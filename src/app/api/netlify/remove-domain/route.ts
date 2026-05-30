import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIp, rateLimit } from '@/lib/ratelimit';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

/**
 * Remove a tenant's custom domain.
 * Mirrors register-domain: first detaches the alias (+ www variant) from the
 * Netlify site so it is NOT orphaned, then clears the DB mapping. Netlify
 * failures are surfaced but DB cleanup still proceeds so the tenant is never
 * stuck pointing at a domain they can't re-add.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'netlify_remove_domain', ip }, { limit: 10, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { domain, companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;
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

    let netlifyDetached: boolean | null = null;

    // Step 1: detach alias from Netlify (best-effort — DB cleanup proceeds regardless)
    if (siteId && token && cleanDomain) {
      try {
        const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (siteRes.ok) {
          const siteData = await siteRes.json();
          const currentAliases: string[] = siteData.domain_aliases || [];
          const toRemove = new Set([cleanDomain, `www.${cleanDomain}`]);
          const newAliases = currentAliases.filter((a) => !toRemove.has(a));

          if (newAliases.length !== currentAliases.length) {
            const updateRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain_aliases: newAliases }),
            });
            netlifyDetached = updateRes.ok;
            if (!updateRes.ok) {
              const err = await updateRes.json().catch(() => ({}));
              console.error('Failed to remove Netlify alias:', updateRes.status, err);
            }
          } else {
            netlifyDetached = true; // nothing to remove — already absent
          }
        } else {
          console.error('Failed to fetch Netlify site for removal:', siteRes.status);
          netlifyDetached = false;
        }
      } catch (netlifyErr) {
        console.error('Netlify alias removal error:', netlifyErr);
        netlifyDetached = false;
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
      netlify_detached: netlifyDetached,
      message: 'Custom domain removed.',
    });
  } catch (error: unknown) {
    console.error('Error removing domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
