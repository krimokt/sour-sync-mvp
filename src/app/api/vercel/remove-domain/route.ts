import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';
import { getVercelConfig, removeDomain } from '@/lib/vercel';

/**
 * Remove a tenant's custom domain.
 * First detaches the domain (+ www variant) from the Vercel project so it is
 * not orphaned, then clears the DB mapping. Vercel failures are surfaced but DB
 * cleanup still proceeds so the tenant is never stuck pointing at a domain they
 * can't re-add.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'vercel_remove_domain', ip }, { limit: 10, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const cfg = getVercelConfig();
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

    let vercelDetached: boolean | null = null;

    // Step 1: detach from Vercel (best-effort — DB cleanup proceeds regardless)
    if (cfg && cleanDomain) {
      try {
        const results = await Promise.all([
          removeDomain(cleanDomain, cfg),
          removeDomain(`www.${cleanDomain}`, cfg),
        ]);
        vercelDetached = results.every((r) => r.ok);
        if (!vercelDetached) {
          console.error('Failed to fully detach domain from Vercel:', results.map((r) => r.status));
        }
      } catch (vercelErr) {
        console.error('Vercel domain removal error:', vercelErr);
        vercelDetached = false;
      }
    }

    // Step 2: clear the public domain mapping
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({ custom_domain: null, custom_domain_verified: false })
      .eq('company_id', companyId);
    if (dbError) {
      console.error('Database error clearing custom_domain:', dbError);
      throw dbError;
    }

    // Step 3: reset private domain ops state
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
      // Non-fatal: the public mapping is already cleared, which is what routing depends on.
      console.error('Private settings reset error (non-fatal):', privateError);
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain || null,
      vercel_detached: vercelDetached,
      message: 'Custom domain removed.',
    });
  } catch (error: unknown) {
    console.error('Error removing domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
