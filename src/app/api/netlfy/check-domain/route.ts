import { NextResponse } from 'next/server';
import { resolveCname, resolve4 } from 'dns/promises';
import { createClient } from '@supabase/supabase-js';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

export async function POST(request: Request) {
  try {
    const { domain, companyId } = await request.json();

    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!siteId || !token || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check DNS
    let dnsStatus = 'pending';
    try {
      // Check CNAME (for subdomains) or A (for root)
      // Simple logic: if it resolves to Netlify, it's good.
      const isRoot = domain.split('.').length === 2; // e.g. example.com
      
      if (isRoot) {
        const ips = await resolve4(domain).catch(() => []);
        if (ips.includes('75.2.60.5')) {
          dnsStatus = 'active';
        }
      } else {
        const cnames = await resolveCname(domain).catch(() => []);
        if (cnames.some(c => c.includes('netlify.app'))) {
          dnsStatus = 'active';
        }
      }
    } catch (e) {
      console.log('DNS check failed:', e);
      // Keep pending
    }

    // 2. Check Netlify SSL Status
    let sslStatus = 'pending';
    try {
      const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const site = await siteRes.json();
      
      // Check if domain is in aliases
      const hasAlias = site.domain_aliases?.includes(domain);
      
      if (hasAlias) {
        // Check SSL certificate
        // Netlify returns ssl_url or we can fetch /ssl endpoint
        // But looking at site object is faster for status
        // If URL works with https, it's active?
        // Better: fetch /ssl endpoint specifically for this domain?
        // Netlify has one cert for the site (SAN).
        // We check if the cert includes this domain and is ready.
        
        // Usually checking accessing HTTPS is the best proof
        if (dnsStatus === 'active') {
             // Try to trigger/check SSL provisioning
             const sslRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
                headers: { Authorization: `Bearer ${token}` },
             });
             const sslData = await sslRes.json();
             
             // Check if certificate includes the domain and is valid
             // This might be complex to parse from Netlify API directly easily.
             // Heuristic: If DNS is active, we assume SSL will follow shortly.
             // But we can try to fetch the HTTPS URL.
             try {
                const checkHttps = await fetch(`https://${domain}`, { method: 'HEAD', timeout: 5000 } as any).catch(() => null);
                if (checkHttps && checkHttps.ok) {
                    sslStatus = 'active';
                }
             } catch {
                // SSL handshake failed
             }
        }
      }
    } catch (e) {
      console.log('Netlify check failed:', e);
    }

    // 3. Update Database
    const { error } = await supabase
      .from('website_settings')
      .update({
        dns_status: dnsStatus,
        ssl_status: sslStatus,
        last_checked_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .eq('custom_domain', domain); // Ensure matching domain

    if (error) throw error;

    // 4. Trigger SSL Provision if DNS active but SSL pending
    if (dnsStatus === 'active' && sslStatus !== 'active') {
       await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
       }).catch(() => {});
    }

    return NextResponse.json({ 
      dns_status: dnsStatus, 
      ssl_status: sslStatus,
      checked_at: new Date().toISOString() 
    });

  } catch (error: any) {
    console.error('Check domain error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

