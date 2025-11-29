import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();
    
    // Validate domain
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }

    const siteId = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_ACCESS_TOKEN;

    if (!siteId || !token) {
      console.error('Netlify configuration missing');
      // Fallback: If config is missing, we return success so the user flow isn't blocked,
      // but we log it. In production, this should fail or be handled.
      // For now, assuming user might not have set keys yet.
      return NextResponse.json({ 
        warning: 'Netlify keys missing. Domain saved in DB but not added to Netlify.',
        savedInDb: true 
      }, { status: 200 });
    }

    // 1. Get current site to fetch existing aliases
    const siteRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!siteRes.ok) {
      throw new Error(`Failed to fetch site: ${siteRes.statusText}`);
    }

    const site = await siteRes.json();
    const currentAliases: string[] = site.domain_aliases || [];

    // Check if already exists
    if (currentAliases.includes(domain)) {
      return NextResponse.json({ success: true, message: 'Domain already registered on Netlify' });
    }

    // 2. Update site with new alias
    // We must send the FULL list of aliases, including the new one.
    const newAliases = [...currentAliases, domain];

    const updateRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
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
      console.error('Netlify API Error:', errorData);
      return NextResponse.json({ error: errorData.message || 'Failed to update Netlify site' }, { status: updateRes.status });
    }

    // 3. Trigger SSL provisioning (Let's Encrypt)
    try {
      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/ssl`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (sslErr) {
      console.warn('SSL provision trigger failed (expected if DNS not ready):', sslErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error adding domain to Netlify:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
