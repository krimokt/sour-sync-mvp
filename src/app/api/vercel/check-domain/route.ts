import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import { deriveStatus, getDomainConfig, getProjectDomain, getVercelConfig, verifyDomain } from '@/lib/vercel';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'vercel_check_domain', ip }, { limit: 30, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();

    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const cfg = getVercelConfig();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!cfg || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const cleanDomain = domain.toLowerCase().trim();
    const now = new Date();

    console.log(`Checking domain status for ${cleanDomain}...`);

    // Confirm the domain belongs to the company (prevents cross-tenant updates).
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
      .select('dns_verified_at, ssl_provisioned_at, dns_status, ssl_status')
      .eq('company_id', companyId)
      .single();

    // Ask Vercel for verification + DNS config. Trigger a verify attempt so
    // ownership challenges are re-evaluated each poll.
    await verifyDomain(cleanDomain, cfg).catch(() => null);

    const [domainRes, configRes] = await Promise.all([
      getProjectDomain(cleanDomain, cfg),
      getDomainConfig(cleanDomain, cfg),
    ]);

    const verified: boolean = domainRes.ok ? Boolean(domainRes.data?.verified) : false;
    // When the config endpoint can't be read, assume misconfigured (pending).
    const misconfigured: boolean = configRes.ok ? Boolean(configRes.data?.misconfigured) : true;

    const { dns_status, ssl_status, dnsActive, sslActive } = deriveStatus({ verified, misconfigured });

    const updateDataPrivate: Record<string, unknown> = {
      dns_status,
      ssl_status,
      last_checked_at: now.toISOString(),
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

    console.log(`Domain check complete: DNS=${dns_status}, SSL=${ssl_status}`);

    return NextResponse.json({
      dns_status,
      ssl_status,
      dns_verified: dnsActive,
      ssl_active: sslActive,
      checked_at: now.toISOString(),
      dns_verified_at: dnsActive ? (currentSettings?.dns_verified_at || now.toISOString()) : null,
      ssl_provisioned_at: sslActive ? (currentSettings?.ssl_provisioned_at || now.toISOString()) : null,
    });

  } catch (error: unknown) {
    console.error('Check domain error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint for a quick, DB-free status probe.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    const cfg = getVercelConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Vercel configuration missing' }, { status: 500 });
    }

    const cleanDomain = domain.toLowerCase().trim();
    const [domainRes, configRes] = await Promise.all([
      getProjectDomain(cleanDomain, cfg),
      getDomainConfig(cleanDomain, cfg),
    ]);

    const verified = domainRes.ok ? Boolean(domainRes.data?.verified) : false;
    const misconfigured = configRes.ok ? Boolean(configRes.data?.misconfigured) : true;
    const { dns_status, ssl_status } = deriveStatus({ verified, misconfigured });

    return NextResponse.json({ domain: cleanDomain, dns_status, ssl_status, verified, misconfigured });

  } catch (error: unknown) {
    console.error('Error fetching domain status:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
