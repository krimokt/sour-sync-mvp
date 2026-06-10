import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import {
  buildDnsRecords,
  createCustomHostname,
  extractValidationRecords,
  findCustomHostname,
  getCloudflareConfig,
} from '@/lib/cloudflare';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'cf_register_domain', ip }, { limit: 10, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const cfg = getCloudflareConfig();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!cfg) {
      console.error('Cloudflare configuration missing');
      return NextResponse.json({
        error: 'Cloudflare configuration missing. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID and NEXT_PUBLIC_DASHBOARD_CNAME_TARGET.',
      }, { status: 500 });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');

    console.log(`Creating Cloudflare custom hostname for ${cleanDomain}...`);

    // Create the custom hostname; if it already exists, reuse it (idempotent).
    let record: any = null;
    const created = await createCustomHostname(cleanDomain, cfg);
    if (created.ok) {
      record = created.data?.result;
    } else {
      const existing = await findCustomHostname(cleanDomain, cfg);
      if (existing.record) {
        record = existing.record;
      } else {
        const message =
          created.data?.errors?.[0]?.message || 'Failed to register domain with Cloudflare';
        console.error('Cloudflare create custom hostname failed:', created.status, created.data?.errors);
        return NextResponse.json({ error: message, details: created.data?.errors }, { status: created.status || 500 });
      }
    }

    const hostnameId: string | null = record?.id ?? null;

    // Records the tenant must add: the CNAME to our target + any DV/ownership TXT.
    const dnsRecords = [
      ...buildDnsRecords(cleanDomain, cfg),
      ...extractValidationRecords(record),
    ];

    // Public table: store the custom domain mapping
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({ custom_domain: cleanDomain, custom_domain_verified: false })
      .eq('company_id', companyId);
    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Private table: store ops status + dns records + the Cloudflare hostname id.
    // (Columns keep their `netlify_` prefix to avoid a schema migration.)
    const { error: privateError } = await supabase
      .from('website_settings_private')
      .upsert(
        {
          company_id: companyId,
          dns_status: 'pending',
          ssl_status: 'pending',
          netlify_dns_records: dnsRecords,
          netlify_domain_id: hostnameId,
          domain_registered_at: new Date().toISOString(),
          dns_verified_at: null,
          ssl_provisioned_at: null,
          ssl_last_attempt_at: null,
        },
        { onConflict: 'company_id' }
      );
    if (privateError) {
      console.error('Private settings error:', privateError);
      throw privateError;
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      dns_records: dnsRecords,
      message: 'Domain registered. Add the DNS records below to finish setup.',
    });

  } catch (error: unknown) {
    console.error('Error registering domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
