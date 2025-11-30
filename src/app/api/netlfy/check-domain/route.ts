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

    // 1. Check DNS - Use multiple methods for reliability
    let dnsStatus = 'pending';
    try {
      // Method 1: Check if domain is accessible and pointing to Netlify
      // Try to fetch the domain and check if it returns a Netlify response
      try {
        const domainCheck = await fetch(`https://${domain}`, { 
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        // If we get a response (even if it's an error), DNS is likely configured
        // Check if it's a Netlify-hosted response by checking headers
        const serverHeader = domainCheck.headers.get('server');
        const xNetlifyHeader = domainCheck.headers.get('x-nf-request-id');
        
        if (domainCheck.status !== 0 && (serverHeader?.includes('Netlify') || xNetlifyHeader)) {
          dnsStatus = 'active';
        } else if (domainCheck.status < 500) {
          // If we get any non-server-error response, DNS is likely working
          // The domain is resolving, even if SSL isn't ready yet
          dnsStatus = 'active';
        }
      } catch (fetchError) {
        // If fetch fails, try DNS resolution as fallback
        console.log('HTTP check failed, trying DNS resolution:', fetchError);
        
        // Method 2: Try DNS resolution (may not work in serverless, but worth trying)
        try {
          const isRoot = !domain.includes('.') || domain.split('.').filter((p: string) => p).length <= 2;
          
          if (isRoot) {
            const ips: string[] = await resolve4(domain).catch(() => []);
            // Netlify's IP addresses
            const netlifyIPs = ['75.2.60.5', '75.2.60.6', '75.2.60.7'];
            if (ips.some(ip => netlifyIPs.includes(ip))) {
              dnsStatus = 'active';
            }
          } else {
            const cnames: string[] = await resolveCname(domain).catch(() => []);
            if (cnames.some(c => c.includes('netlify.app') || c.includes('netlify'))) {
              dnsStatus = 'active';
            }
          }
        } catch (dnsError) {
          console.log('DNS resolution also failed:', dnsError);
        }
      }
      
      // Method 3: Check Netlify API to see if domain is properly configured
      if (dnsStatus === 'pending') {
        try {
          const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const site = await siteRes.json();
          
          // If domain is in aliases and site is published, DNS is likely active
          if (site.domain_aliases?.includes(domain) && site.published_deploy) {
            // Try one more HTTP check with longer timeout
            try {
              const finalCheck = await fetch(`http://${domain}`, { 
                method: 'HEAD',
                redirect: 'follow',
                signal: AbortSignal.timeout(10000)
              });
              if (finalCheck.status < 500) {
                dnsStatus = 'active';
              }
            } catch {
              // If this fails, keep as pending
            }
          }
        } catch (apiError) {
          console.log('Netlify API check failed:', apiError);
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
        // Usually checking accessing HTTPS is the best proof
        if (dnsStatus === 'active') {
             // Try to trigger/check SSL provisioning
             await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
                headers: { Authorization: `Bearer ${token}` },
             });
             // const sslData = await sslRes.json(); // unused
             
             // Check if certificate includes the domain and is valid
             try {
                const checkHttps = await fetch(`https://${domain}`, { method: 'HEAD' });
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

  } catch (error: unknown) {
    console.error('Check domain error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
