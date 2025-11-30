import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

// SSL retry interval: 30 minutes
const SSL_RETRY_INTERVAL_MS = 30 * 60 * 1000;

interface NetlifyDomainStatus {
  id?: string;
  hostname?: string;
  domain?: string;
  dns_verified?: boolean;
  ssl?: {
    state: string;
    status: string;
  };
}

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

    // Clean domain
    const cleanDomain = domain.toLowerCase().trim();

    // Step 1: Get domain status from Netlify API
    // GET /sites/{site_id}/domains/{domain}
    console.log(`Checking domain status for ${cleanDomain} via Netlify API...`);
    
    let domainStatus: NetlifyDomainStatus | null = null;
    let dnsVerified = false;
    let sslStatus = 'pending';
    
    try {
      const domainRes = await fetch(
        `${NETLIFY_API_ENDPOINT}/sites/${siteId}/domains/${cleanDomain}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (domainRes.ok) {
        domainStatus = await domainRes.json();
        dnsVerified = domainStatus?.dns_verified || false;
        sslStatus = domainStatus?.ssl?.status || 'pending';
        
        console.log('Netlify domain status:', {
          dns_verified: dnsVerified,
          ssl_status: sslStatus,
          ssl_state: domainStatus?.ssl?.state,
        });
      } else if (domainRes.status === 404) {
        // Domain not registered with Netlify
        console.log('Domain not found in Netlify - needs registration');
        return NextResponse.json({
          dns_status: 'not_registered',
          ssl_status: 'pending',
          message: 'Domain not registered with Netlify. Please save the domain first.',
        });
      } else {
        console.error('Netlify API error:', domainRes.statusText);
      }
    } catch (apiError) {
      console.error('Error fetching domain status from Netlify:', apiError);
    }

    // Step 2: Map Netlify status to our status
    const dnsStatus = dnsVerified ? 'active' : 'pending';
    
    // Map SSL status: Netlify uses "verified", "pending", "failed", etc.
    let finalSslStatus = 'pending';
    if (sslStatus === 'verified' || sslStatus === 'active') {
      finalSslStatus = 'active';
    } else if (sslStatus === 'failed') {
      finalSslStatus = 'failed';
    } else {
      finalSslStatus = 'pending';
    }

    // Step 3: Get current database state for retry logic
    const { data: currentSettings } = await supabase
      .from('website_settings')
      .select('ssl_last_attempt_at, dns_verified_at, ssl_provisioned_at')
      .eq('company_id', companyId)
      .eq('custom_domain', cleanDomain)
      .single();

    // Step 4: Handle SSL provisioning
    let sslTriggered = false;
    const now = new Date();

    // If DNS is verified but SSL is not active, try to provision SSL
    if (dnsVerified && finalSslStatus !== 'active') {
      const lastAttempt = currentSettings?.ssl_last_attempt_at 
        ? new Date(currentSettings.ssl_last_attempt_at)
        : null;
      
      const shouldRetry = !lastAttempt || 
        (now.getTime() - lastAttempt.getTime() > SSL_RETRY_INTERVAL_MS);
      
      // Also retry if status is failed
      if (shouldRetry || finalSslStatus === 'failed') {
        console.log('Triggering SSL provisioning...');
        try {
          const sslRes = await fetch(
            `${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (sslRes.ok) {
            sslTriggered = true;
            console.log('SSL provisioning triggered successfully');
          } else {
            console.log('SSL provisioning response:', sslRes.status, sslRes.statusText);
          }
        } catch (sslError) {
          console.error('Error triggering SSL:', sslError);
        }
      }
    }

    // Step 5: Prepare database update
    const updateData: Record<string, unknown> = {
      dns_status: dnsStatus,
      ssl_status: finalSslStatus,
      last_checked_at: now.toISOString(),
    };

    // Track verification timestamps
    if (dnsVerified && !currentSettings?.dns_verified_at) {
      updateData.dns_verified_at = now.toISOString();
    }

    if (finalSslStatus === 'active' && !currentSettings?.ssl_provisioned_at) {
      updateData.ssl_provisioned_at = now.toISOString();
      updateData.custom_domain_verified = true;
    }

    if (sslTriggered) {
      updateData.ssl_last_attempt_at = now.toISOString();
    }

    // Step 6: Update database
    const { error } = await supabase
      .from('website_settings')
      .update(updateData)
      .eq('company_id', companyId)
      .eq('custom_domain', cleanDomain);

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    // Step 7: Return status
    return NextResponse.json({
      dns_status: dnsStatus,
      ssl_status: finalSslStatus,
      dns_verified: dnsVerified,
      ssl_triggered: sslTriggered,
      checked_at: now.toISOString(),
      dns_verified_at: dnsVerified ? (currentSettings?.dns_verified_at || now.toISOString()) : null,
      ssl_provisioned_at: finalSslStatus === 'active' 
        ? (currentSettings?.ssl_provisioned_at || now.toISOString()) 
        : null,
    });

  } catch (error: unknown) {
    console.error('Check domain error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint for quick status check without database update
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;

    if (!siteId || !token) {
      return NextResponse.json({ error: 'Netlify configuration missing' }, { status: 500 });
    }

    const domainRes = await fetch(
      `${NETLIFY_API_ENDPOINT}/sites/${siteId}/domains/${domain}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!domainRes.ok) {
      if (domainRes.status === 404) {
        return NextResponse.json({ 
          dns_verified: false, 
          ssl_status: 'not_registered' 
        });
      }
      throw new Error(`Netlify API error: ${domainRes.statusText}`);
    }

    const data = await domainRes.json();

    return NextResponse.json({
      dns_verified: data.dns_verified || false,
      ssl_status: data.ssl?.status || 'pending',
      ssl_state: data.ssl?.state || 'unknown',
    });

  } catch (error: unknown) {
    console.error('Get domain status error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

