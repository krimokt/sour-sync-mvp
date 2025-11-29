import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    // Simple verification: check if the domain resolves
    // In production, you might want to:
    // 1. Check DNS records directly using a DNS API
    // 2. Verify a TXT record for ownership
    // 3. Make a request to the domain and check the response
    
    // For now, we'll do a simple DNS check by trying to fetch the domain
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // If we get any response, the domain is configured
      // In production, you'd want to verify it points to your server
      if (response.ok || response.status === 301 || response.status === 302 || response.status === 308) {
        return NextResponse.json({ verified: true, status: response.status });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Domain might not be reachable yet, which is fine
      // Just means DNS hasn't propagated
    }

    // Alternative: Try to resolve DNS
    // Note: This requires additional setup in production
    
    return NextResponse.json({ 
      verified: false, 
      message: 'Domain is not yet pointing to our servers. Please check your DNS settings and try again in a few minutes.' 
    });

  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json({ 
      verified: false, 
      error: 'Verification failed. Please try again.' 
    }, { status: 500 });
  }
}



