import { NextResponse } from 'next/server';

const NETLIFY_API_ENDPOINT = 'https://api.netlify.com/api/v1';

export async function POST(request: Request) {
  try {
    const { domain, companyId } = await request.json();

    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;

    if (!siteId || !token) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    console.log(`Force triggering SSL provisioning for ${cleanDomain}...`);

    // Trigger SSL provisioning via Netlify API
    const sslRes = await fetch(`${NETLIFY_API_ENDPOINT}/sites/${siteId}/ssl`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!sslRes.ok) {
      const errorText = await sslRes.text();
      console.error(`SSL provisioning failed (${sslRes.status}):`, errorText);
      return NextResponse.json(
        { error: `SSL provisioning failed: ${sslRes.statusText}` },
        { status: sslRes.status }
      );
    }

    const sslData = await sslRes.json();
    console.log('✅ SSL provisioning triggered successfully');

    return NextResponse.json({
      success: true,
      message: 'SSL provisioning triggered. It may take a few minutes to complete.',
      data: sslData,
    });

  } catch (error: unknown) {
    console.error('Error forcing SSL:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

