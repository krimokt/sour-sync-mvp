import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import { addDomain, buildDnsRecords, getVercelConfig } from '@/lib/vercel';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'vercel_register_domain', ip }, { limit: 10, window: '1 m' });
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

    const cfg = getVercelConfig();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!cfg) {
      console.error('Vercel configuration missing');
      return NextResponse.json({
        error: 'Vercel configuration missing. Please set VERCEL_API_TOKEN and VERCEL_PROJECT_ID.',
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

    console.log(`Registering domain ${cleanDomain} with Vercel project ${cfg.projectId}...`);

    // Add both the apex and the www variant to the project. Vercel issues SSL
    // automatically once DNS points at us, so there is no separate SSL trigger.
    for (const d of [cleanDomain, `www.${cleanDomain}`]) {
      const res = await addDomain(d, cfg);
      if (!res.ok) {
        const message = res.data?.error?.message || res.data?.message || 'Failed to register domain with Vercel';
        console.error('Failed to add domain to Vercel:', d, res.status, res.data);
        // Surface the apex failure; a www failure alone shouldn't block the apex.
        if (d === cleanDomain) {
          return NextResponse.json({ error: message, details: res.data }, { status: res.status });
        }
      }
    }

    const dnsRecords = buildDnsRecords(cleanDomain);

    // Public table: store the custom domain mapping
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({ custom_domain: cleanDomain, custom_domain_verified: false })
      .eq('company_id', companyId);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Private table: store domain ops status + dns records.
    // (Column names retain the `netlify_` prefix to avoid a schema migration;
    //  they now hold Vercel data.)
    const { error: privateError } = await supabase
      .from('website_settings_private')
      .upsert(
        {
          company_id: companyId,
          dns_status: 'pending',
          ssl_status: 'pending',
          netlify_dns_records: dnsRecords,
          netlify_domain_id: cleanDomain,
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
      message: 'Domain registered successfully. Please configure your DNS records.',
    });

  } catch (error: unknown) {
    console.error('Error registering domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
