import { NextResponse } from 'next/server';
import { getVercelConfig, verifyDomain } from '@/lib/vercel';

/**
 * Vercel provisions SSL automatically once a domain is verified and its DNS
 * points at us — there is no manual SSL trigger. The closest equivalent (and
 * what unblocks issuance) is re-running domain verification, so this endpoint
 * nudges that. Kept for UI compatibility with the previous Netlify flow.
 */
export async function POST(request: Request) {
  try {
    const { domain, companyId } = await request.json();

    if (!domain || !companyId) {
      return NextResponse.json({ error: 'Missing domain or companyId' }, { status: 400 });
    }

    const cfg = getVercelConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const cleanDomain = domain.toLowerCase().trim();
    console.log(`Re-running verification for ${cleanDomain} to nudge SSL issuance...`);

    const res = await verifyDomain(cleanDomain, cfg);
    if (!res.ok) {
      const message = res.data?.error?.message || res.data?.message || res.status;
      console.error('Vercel verify failed:', message);
      return NextResponse.json(
        { error: `Verification failed: ${message}` },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification re-triggered. SSL is issued automatically once DNS is correct.',
      data: res.data,
    });

  } catch (error: unknown) {
    console.error('Error forcing SSL:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
