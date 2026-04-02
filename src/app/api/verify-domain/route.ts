import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Returns true if the domain string targets a private/local address
 * that must never be reached from a server-side fetch (SSRF protection).
 */
function isPrivateOrLocalDomain(domain: string): boolean {
  const lower = domain.toLowerCase().trim();

  // Reject empty or oversized input
  if (!lower || lower.length > 253) return true;

  // Reject anything containing a port, path, or protocol
  if (lower.includes(':') || lower.includes('/') || lower.includes('@')) return true;

  // Reject bare IPv4 literals (only digits and dots)
  if (/^[\d.]+$/.test(lower)) return true;
  // Reject IPv6 bracket notation
  if (lower.startsWith('[')) return true;

  // Block well-known internal hostnames and address prefixes
  const blocked = [
    'localhost',
    '127.',
    '10.',
    '192.168.',
    '169.254.',   // link-local / AWS/GCP metadata endpoint
    '0.0.0.0',
    'metadata.google.internal',
  ];
  for (const prefix of blocked) {
    if (lower === prefix || lower.startsWith(prefix)) return true;
  }

  // Block 172.16.0.0/12 range (172.16.x.x – 172.31.x.x)
  const m = lower.match(/^172\.(\d+)\./);
  if (m) {
    const octet = parseInt(m[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  // Must contain at least one dot and only valid hostname characters
  if (!lower.includes('.')) return true;
  if (!/^[a-z0-9.-]+$/.test(lower)) return true;

  return false;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  if (isPrivateOrLocalDomain(domain)) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok || response.status === 301 || response.status === 302 || response.status === 308) {
        return NextResponse.json({ verified: true, status: response.status });
      }
    } catch {
      clearTimeout(timeoutId);
      // Domain might not be reachable yet — DNS hasn't propagated
    }

    return NextResponse.json({
      verified: false,
      message: 'Domain is not yet pointing to our servers. Please check your DNS settings and try again in a few minutes.',
    });
  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}





