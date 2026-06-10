import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import { deleteCustomHostname, findCustomHostname, getCloudflareConfig } from '@/lib/cloudflare';

/**
 * Remove a tenant's custom domain. First deletes the Cloudflare custom hostname
 * so it isn't orphaned, then clears the DB mapping. Cloudflare failures are
 * surfaced but DB cleanup still proceeds so the tenant can re-add the domain.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'cf_remove_domain', ip }, { limit: 10, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const cfg = getCloudflareConfig();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cleanDomain =
      typeof domain === 'string'
        ? domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '')
        : '';

    // Look up the stored Cloudflare hostname id to delete precisely.
    const { data: priv } = await supabase
      .from('website_settings_private')
      .select('netlify_domain_id')
      .eq('company_id', companyId)
      .single();

    let cfDetached: boolean | null = null;
    if (cfg && cleanDomain) {
      try {
        let id: string | null = priv?.netlify_domain_id ?? null;
        if (!id) {
          const found = await findCustomHostname(cleanDomain, cfg);
          id = found.record?.id ?? null;
        }
        if (id) {
          const del = await deleteCustomHostname(id, cfg);
          cfDetached = del.ok;
          if (!del.ok) console.error('Failed to delete Cloudflare custom hostname:', del.status, del.data?.errors);
        } else {
          cfDetached = true; // nothing to remove
        }
      } catch (cfErr) {
        console.error('Cloudflare custom hostname removal error:', cfErr);
        cfDetached = false;
      }
    }

    // Clear the public domain mapping
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({ custom_domain: null, custom_domain_verified: false })
      .eq('company_id', companyId);
    if (dbError) {
      console.error('Database error clearing custom_domain:', dbError);
      throw dbError;
    }

    // Reset private domain ops state
    const { error: privateError } = await supabase
      .from('website_settings_private')
      .update({
        dns_status: 'pending',
        ssl_status: 'pending',
        netlify_dns_records: [],
        netlify_domain_id: null,
        dns_verified_at: null,
        ssl_provisioned_at: null,
      })
      .eq('company_id', companyId);
    if (privateError) {
      console.error('Private settings reset error (non-fatal):', privateError);
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain || null,
      cloudflare_detached: cfDetached,
      message: 'Custom domain removed.',
    });
  } catch (error: unknown) {
    console.error('Error removing domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
