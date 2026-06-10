import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findCustomHostname, getCloudflareConfig, reissueCustomHostnameSsl } from '@/lib/cloudflare';

/**
 * Re-trigger DV certificate issuance for a tenant's custom hostname. Cloudflare
 * issues SSL automatically once the CNAME + validation TXT records are in place;
 * this nudges re-validation if a tenant got stuck. Kept for UI compatibility.
 */
export async function POST(request: Request) {
  try {
    const { domain, companyId } = await request.json();
    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const cfg = getCloudflareConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    // Resolve the Cloudflare hostname id (prefer the stored one).
    let id: string | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: priv } = await supabase
        .from('website_settings_private')
        .select('netlify_domain_id')
        .eq('company_id', companyId)
        .single();
      id = priv?.netlify_domain_id ?? null;
    }
    if (!id) {
      const found = await findCustomHostname(cleanDomain, cfg);
      id = found.record?.id ?? null;
    }
    if (!id) {
      return NextResponse.json({ error: 'Custom hostname not found' }, { status: 404 });
    }

    const res = await reissueCustomHostnameSsl(id, cfg);
    if (!res.ok) {
      const message = res.data?.errors?.[0]?.message || res.status;
      console.error('Cloudflare SSL re-issue failed:', message);
      return NextResponse.json({ error: `SSL re-issue failed: ${message}` }, { status: res.status || 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'SSL re-issuance triggered. It completes automatically once DNS validation passes.',
    });

  } catch (error: unknown) {
    console.error('Error forcing SSL:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
