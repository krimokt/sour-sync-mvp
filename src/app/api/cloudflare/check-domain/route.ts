import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import {
  buildDnsRecords,
  deriveStatus,
  extractValidationRecords,
  findCustomHostname,
  getCloudflareConfig,
  getCustomHostname,
} from '@/lib/cloudflare';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'cf_check_domain', ip }, { limit: 30, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();
    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const cfg = getCloudflareConfig();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!cfg || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const cleanDomain = domain.toLowerCase().trim();
    const now = new Date();

    // Confirm the domain belongs to this company (prevents cross-tenant updates).
    const { data: currentPublic } = await supabase
      .from('website_settings')
      .select('company_id, custom_domain')
      .eq('company_id', companyId)
      .eq('custom_domain', cleanDomain)
      .single();
    if (!currentPublic) {
      return NextResponse.json({ error: 'Domain is not registered for this company' }, { status: 404 });
    }

    const { data: currentSettings } = await supabase
      .from('website_settings_private')
      .select('dns_verified_at, ssl_provisioned_at, netlify_domain_id')
      .eq('company_id', companyId)
      .single();

    // Fetch the Cloudflare custom hostname (by stored id, else by hostname).
    let record: any = null;
    const storedId = currentSettings?.netlify_domain_id;
    if (storedId) {
      const r = await getCustomHostname(storedId, cfg);
      if (r.ok) record = r.data?.result;
    }
    if (!record) {
      const found = await findCustomHostname(cleanDomain, cfg);
      record = found.record;
    }

    if (!record) {
      return NextResponse.json({ error: 'Custom hostname not found on Cloudflare' }, { status: 404 });
    }

    const { dns_status, ssl_status, dnsActive, sslActive } = deriveStatus(record);

    // Keep the displayed records fresh (validation TXT can change between polls).
    const dnsRecords = [
      ...buildDnsRecords(cleanDomain, cfg),
      ...extractValidationRecords(record),
    ];

    const updateDataPrivate: Record<string, unknown> = {
      dns_status,
      ssl_status,
      last_checked_at: now.toISOString(),
      netlify_dns_records: dnsRecords,
      netlify_domain_id: record.id ?? storedId ?? null,
    };
    if (dnsActive && !currentSettings?.dns_verified_at) {
      updateDataPrivate.dns_verified_at = now.toISOString();
    }
    if (sslActive && !currentSettings?.ssl_provisioned_at) {
      updateDataPrivate.ssl_provisioned_at = now.toISOString();
    }

    const { error: privateError } = await supabase
      .from('website_settings_private')
      .upsert({ company_id: companyId, ...updateDataPrivate }, { onConflict: 'company_id' });
    if (privateError) {
      console.error('Private settings update error:', privateError);
      throw privateError;
    }

    if (sslActive) {
      const { error: publicError } = await supabase
        .from('website_settings')
        .update({ custom_domain_verified: true })
        .eq('company_id', companyId)
        .eq('custom_domain', cleanDomain);
      if (publicError) {
        console.error('Public settings update error:', publicError);
        throw publicError;
      }
    }

    return NextResponse.json({
      dns_status,
      ssl_status,
      dns_verified: dnsActive,
      ssl_active: sslActive,
      ssl_state: record?.ssl?.status ?? null,
      hostname_state: record?.status ?? null,
      checked_at: now.toISOString(),
      dns_records: dnsRecords,
      dns_verified_at: dnsActive ? (currentSettings?.dns_verified_at || now.toISOString()) : null,
      ssl_provisioned_at: sslActive ? (currentSettings?.ssl_provisioned_at || now.toISOString()) : null,
    });

  } catch (error: unknown) {
    console.error('Check domain error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
