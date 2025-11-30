import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

export async function POST(request: Request) {
  try {
    const { domain, companyId } = await request.json();

    // Validate inputs
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }
    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!siteId || !token) {
      console.error('Netlify configuration missing');
      return NextResponse.json({ 
        error: 'Netlify configuration missing. Please set NETLIFY_SITE_ID and NETLIFY_ACCESS_TOKEN.',
      }, { status: 500 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean the domain
    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');

    console.log(`Registering domain ${cleanDomain} with Netlify site ${siteId}...`);

    // Step 1: Fetch current site configuration to get existing domain_aliases
    const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!siteRes.ok) {
      const errorData = await siteRes.json().catch(() => ({}));
      console.error('Failed to fetch site:', siteRes.status, errorData);
      return NextResponse.json({ 
        error: 'Failed to fetch site configuration',
        details: { code: siteRes.status, message: errorData.message || siteRes.statusText }
      }, { status: siteRes.status });
    }

    const siteData = await siteRes.json();
    const currentAliases: string[] = siteData.domain_aliases || [];
    const siteName = siteData.name || siteId;

    console.log('Current domain aliases:', currentAliases);

    // Step 2: Add the new domain and www variant to aliases (if not already present)
    const domainsToAdd = [cleanDomain, `www.${cleanDomain}`];
    const newAliases = [...currentAliases];
    
    for (const d of domainsToAdd) {
      if (!newAliases.includes(d)) {
        newAliases.push(d);
      }
    }

    // Step 3: Update site with new domain_aliases using PATCH
    if (newAliases.length > currentAliases.length) {
      console.log('Adding new aliases:', domainsToAdd);
      
      const updateRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_aliases: newAliases,
        }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json().catch(() => ({}));
        console.error('Failed to update site aliases:', updateRes.status, errorData);
        return NextResponse.json({ 
          error: errorData.message || 'Failed to register domain with Netlify',
          details: errorData
        }, { status: updateRes.status });
      }

      console.log('Domain aliases updated successfully');
    } else {
      console.log('Domain already registered in aliases');
    }

    // Step 4: Trigger SSL provisioning
    try {
      await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('SSL provisioning triggered');
    } catch (sslErr) {
      console.warn('SSL provision trigger failed (expected if DNS not ready):', sslErr);
    }

    // Step 5: Construct DNS records
    const dnsRecords = [
      {
        type: 'A',
        host: '@',
        value: '75.2.60.5', // Netlify's primary load balancer IP
      },
      {
        type: 'CNAME',
        host: 'www',
        value: `${siteName}.netlify.app`,
      },
    ];

    // Step 6: Save to database
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({
        custom_domain: cleanDomain,
        custom_domain_verified: false,
        dns_status: 'pending',
        ssl_status: 'pending',
        netlify_dns_records: dnsRecords,
        netlify_domain_id: null,
        domain_registered_at: new Date().toISOString(),
        dns_verified_at: null,
        ssl_provisioned_at: null,
        ssl_last_attempt_at: null,
      })
      .eq('company_id', companyId);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Step 7: Return success with DNS records
    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      dns_records: dnsRecords,
      message: 'Domain registered successfully. Please configure your DNS records.',
    });

  } catch (error: unknown) {
    console.error('Error registering domain:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET endpoint to fetch current domain status from Netlify
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

    // Fetch site to check if domain is in aliases
    const siteRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!siteRes.ok) {
      throw new Error(`Netlify API error: ${siteRes.statusText}`);
    }

    const siteData = await siteRes.json();
    const aliases: string[] = siteData.domain_aliases || [];
    const isRegistered = aliases.includes(domain) || aliases.includes(`www.${domain}`);

    return NextResponse.json({
      domain,
      registered: isRegistered,
      ssl_enabled: siteData.ssl || false,
      site_name: siteData.name,
    });

  } catch (error: unknown) {
    console.error('Error fetching domain status:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
