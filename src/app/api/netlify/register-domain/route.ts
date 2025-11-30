import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

interface NetlifyDnsRecord {
  type: string;
  hostname: string;
  value: string;
  ttl?: number;
  priority?: number;
}

interface NetlifyDomainResponse {
  id: string;
  domain: string;
  hostname: string;
  dns_zone_id?: string;
  ssl?: {
    state: string;
    status: string;
  };
  dns_verified?: boolean;
  required_dns_records?: NetlifyDnsRecord[];
}

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

    // Step 1: Register domain with Netlify
    // POST to /sites/{site_id}/domains
    console.log(`Registering domain ${cleanDomain} with Netlify...`);
    
    const registerRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostname: cleanDomain,
      }),
    });

    let domainData: NetlifyDomainResponse;
    
    if (!registerRes.ok) {
      const errorData = await registerRes.json().catch(() => ({}));
      
      // If domain already exists (409 Conflict), fetch its details instead
      if (registerRes.status === 409 || errorData.code === 'domain_already_exists') {
        console.log('Domain already registered, fetching existing data...');
        
        const existingRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/domains/${cleanDomain}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!existingRes.ok) {
          throw new Error(`Failed to fetch existing domain: ${existingRes.statusText}`);
        }
        
        domainData = await existingRes.json();
      } else {
        console.error('Netlify domain registration error:', errorData);
        return NextResponse.json({ 
          error: errorData.message || 'Failed to register domain with Netlify',
          details: errorData
        }, { status: registerRes.status });
      }
    } else {
      domainData = await registerRes.json();
    }

    console.log('Netlify domain response:', JSON.stringify(domainData, null, 2));

    // Step 2: Extract DNS records
    // Netlify returns required_dns_records or we construct them from known values
    let dnsRecords: Array<{type: string; host: string; value: string}> = [];
    
    if (domainData.required_dns_records && domainData.required_dns_records.length > 0) {
      // Use records from Netlify API
      dnsRecords = domainData.required_dns_records.map(record => ({
        type: record.type,
        host: record.hostname === cleanDomain ? '@' : record.hostname.replace(`.${cleanDomain}`, ''),
        value: record.value,
      }));
    } else {
      // Construct standard Netlify DNS records
      // For root domain: A record pointing to Netlify's load balancer
      // For www: CNAME to the Netlify site
      const netlifySiteName = siteId.includes('.') ? siteId : `${siteId}.netlify.app`;
      
      dnsRecords = [
        {
          type: 'A',
          host: '@',
          value: '75.2.60.5', // Netlify's primary load balancer IP
        },
        {
          type: 'CNAME',
          host: 'www',
          value: netlifySiteName,
        },
      ];
    }

    // Step 3: Save to database
    const { error: dbError } = await supabase
      .from('website_settings')
      .update({
        custom_domain: cleanDomain,
        custom_domain_verified: false,
        dns_status: 'pending',
        ssl_status: 'pending',
        netlify_dns_records: dnsRecords,
        netlify_domain_id: domainData.id || null,
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

    // Step 4: Return success with DNS records
    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      netlify_domain_id: domainData.id,
      dns_records: dnsRecords,
      dns_verified: domainData.dns_verified || false,
      ssl_status: domainData.ssl?.status || 'pending',
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

    const res = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/domains/${domain}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'Domain not found in Netlify' }, { status: 404 });
      }
      throw new Error(`Netlify API error: ${res.statusText}`);
    }

    const data = await res.json();

    return NextResponse.json({
      domain: data.hostname || data.domain,
      dns_verified: data.dns_verified || false,
      ssl_status: data.ssl?.status || 'pending',
      ssl_state: data.ssl?.state || 'unknown',
      required_dns_records: data.required_dns_records || [],
    });

  } catch (error: unknown) {
    console.error('Error fetching domain status:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

