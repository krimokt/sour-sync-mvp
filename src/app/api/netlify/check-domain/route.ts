import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

// SSL retry interval: 30 minutes
const SSL_RETRY_INTERVAL_MS = 30 * 60 * 1000;

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
    const cleanDomain = domain.toLowerCase().trim();
    const now = new Date();

    console.log(`Checking domain status for ${cleanDomain}...`);

    // ============================================
    // STEP 1: Check DNS by making HTTP request to the domain
    // This is the most reliable way to verify DNS is pointing to Netlify
    // ============================================
    let dnsActive = false;
    let sslActive = false;

    // Method 1: Try HTTPS first (checks both DNS and SSL)
    try {
      const httpsRes = await fetch(`https://${cleanDomain}`, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Check for Netlify headers to confirm it's pointing to our site
      const serverHeader = httpsRes.headers.get('server');
      const netlifyRequestId = httpsRes.headers.get('x-nf-request-id');
      const middlewareRewrite = httpsRes.headers.get('x-middleware-rewrite');

      if (serverHeader?.toLowerCase().includes('netlify') || netlifyRequestId) {
        dnsActive = true;
        sslActive = true; // HTTPS worked, so SSL is active
        console.log(`✅ HTTPS check passed - DNS active, SSL active`);
      }
    } catch (httpsError) {
      console.log(`HTTPS check failed for ${cleanDomain}:`, httpsError instanceof Error ? httpsError.message : 'Unknown error');
    }

    // Method 2: If HTTPS failed, try HTTP (DNS might be working but SSL not ready)
    if (!dnsActive) {
      try {
        const httpRes = await fetch(`http://${cleanDomain}`, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        });

        const serverHeader = httpRes.headers.get('server');
        const netlifyRequestId = httpRes.headers.get('x-nf-request-id');

        if (serverHeader?.toLowerCase().includes('netlify') || netlifyRequestId) {
          dnsActive = true;
          console.log(`✅ HTTP check passed - DNS active, SSL pending`);
        }
      } catch (httpError) {
        console.log(`HTTP check failed for ${cleanDomain}:`, httpError instanceof Error ? httpError.message : 'Unknown error');
      }
    }

    // Method 3: Check if domain is in Netlify's domain_aliases (as backup verification)
    if (!dnsActive) {
      try {
        const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (siteRes.ok) {
          const siteData = await siteRes.json();
          const aliases: string[] = siteData.domain_aliases || [];
          
          if (aliases.includes(cleanDomain) || aliases.includes(`www.${cleanDomain}`)) {
            console.log(`Domain found in Netlify aliases, but HTTP check failed - DNS not propagated yet`);
          } else {
            console.log(`Domain not found in Netlify aliases`);
          }
        }
      } catch (apiError) {
        console.log('Netlify API check failed:', apiError);
      }
    }

    // ============================================
    // STEP 2: Get current database state
    // ============================================
    const { data: currentSettings } = await supabase
      .from('website_settings')
      .select('ssl_last_attempt_at, dns_verified_at, ssl_provisioned_at, dns_status, ssl_status')
      .eq('company_id', companyId)
      .eq('custom_domain', cleanDomain)
      .single();

    // ============================================
    // STEP 3: Trigger SSL provisioning if DNS is active but SSL is not
    // ============================================
    let sslTriggered = false;

    if (dnsActive && !sslActive) {
      const lastAttempt = currentSettings?.ssl_last_attempt_at
        ? new Date(currentSettings.ssl_last_attempt_at)
        : null;

      const shouldRetry = !lastAttempt ||
        (now.getTime() - lastAttempt.getTime() > SSL_RETRY_INTERVAL_MS);

      if (shouldRetry) {
        console.log('Triggering SSL provisioning...');
        try {
          const sslRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (sslRes.ok) {
            sslTriggered = true;
            console.log('✅ SSL provisioning triggered');
          } else {
            console.log('SSL provisioning response:', sslRes.status);
          }
        } catch (sslError) {
          console.error('Error triggering SSL:', sslError);
        }
      }
    }

    // ============================================
    // STEP 4: Prepare database update
    // ============================================
    const dnsStatus = dnsActive ? 'active' : 'pending';
    const sslStatus = sslActive ? 'active' : 'pending';

    const updateData: Record<string, unknown> = {
      dns_status: dnsStatus,
      ssl_status: sslStatus,
      last_checked_at: now.toISOString(),
    };

    // Track verification timestamps
    if (dnsActive && !currentSettings?.dns_verified_at) {
      updateData.dns_verified_at = now.toISOString();
    }

    if (sslActive && !currentSettings?.ssl_provisioned_at) {
      updateData.ssl_provisioned_at = now.toISOString();
      updateData.custom_domain_verified = true;
    }

    if (sslTriggered) {
      updateData.ssl_last_attempt_at = now.toISOString();
    }

    // ============================================
    // STEP 5: Update database
    // ============================================
    const { error } = await supabase
      .from('website_settings')
      .update(updateData)
      .eq('company_id', companyId)
      .eq('custom_domain', cleanDomain);

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    console.log(`Domain check complete: DNS=${dnsStatus}, SSL=${sslStatus}`);

    // ============================================
    // STEP 6: Return status
    // ============================================
    return NextResponse.json({
      dns_status: dnsStatus,
      ssl_status: sslStatus,
      dns_verified: dnsActive,
      ssl_active: sslActive,
      ssl_triggered: sslTriggered,
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

// GET endpoint for quick status check
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();
    let dnsActive = false;
    let sslActive = false;

    // Quick HTTP check
    try {
      const httpsRes = await fetch(`https://${cleanDomain}`, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
      });

      const serverHeader = httpsRes.headers.get('server');
      const netlifyRequestId = httpsRes.headers.get('x-nf-request-id');

      if (serverHeader?.toLowerCase().includes('netlify') || netlifyRequestId) {
        dnsActive = true;
        sslActive = true;
      }
    } catch {
      // Try HTTP
      try {
        const httpRes = await fetch(`http://${cleanDomain}`, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000),
        });

        const serverHeader = httpRes.headers.get('server');
        const netlifyRequestId = httpRes.headers.get('x-nf-request-id');

        if (serverHeader?.toLowerCase().includes('netlify') || netlifyRequestId) {
          dnsActive = true;
        }
      } catch {
        // DNS not working
      }
    }

    return NextResponse.json({
      domain: cleanDomain,
      dns_active: dnsActive,
      ssl_active: sslActive,
    });

  } catch (error: unknown) {
    console.error('Get domain status error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
