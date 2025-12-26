import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/reset-password', '/'];

// Blocked routes - these routes are deprecated and should not be accessible
const blockedRoutes = [
  '/dashboard-home',
  '/quotation',
  '/shipment-tracking',
  '/clients',
  '/payment',
  '/bank-accounts',
  '/profile',
  '/account-settings',
  '/website-builder',
  '/payment-proofs',
    '/order',
    '/select-store'
    
];

// Routes that should be accessible without authentication (static assets, API, etc.)
const alwaysPublicPatterns = [
  /^\/api\//,
  /^\/_next\//,
  /^\/images\//,
  /^\/favicon\.ico$/,
  /^\/payment-info/, // Public payment info page
  /^\/payment-details/, // Public payment details page
  /^\/site\//, // Public company websites
  /^\/dashboard-client$/, // Client dashboard (handled by page)
  /^\/c\//, // Magic link client portal (token validation in layout)
];


// Reserved subdomains that should not be treated as company slugs
const reservedSubdomains = ['www', 'admin', 'api', 'app', 'dashboard'];

// Main platform domains (not custom domains)
const platformDomains = [
  'soursync.com',
  'netlify.app',
  'localhost',
];

// Check if hostname is a custom domain (not our platform domain)
function isCustomDomain(hostname: string): boolean {
  const hostWithoutPort = hostname.split(':')[0];
  return !platformDomains.some(domain => hostWithoutPort.endsWith(domain));
}

// Extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
  // Handle localhost (e.g., whitesourcing.localhost:3000)
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }
  
  // Handle production domain (e.g., whitesourcing.soursync.com)
  const parts = hostname.split('.');
  // For soursync.com or www.soursync.com, no subdomain
  if (parts.length <= 2) return null;
  
  const subdomain = parts[0];
  if (reservedSubdomains.includes(subdomain)) return null;
  
  return subdomain;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';
  
  // Initialize response early for Supabase client
  const res = NextResponse.next();
  
  // ----- FORCE HTTPS -----
  // Check if request is HTTP and redirect to HTTPS
  // This serves as a backup to netlify.toml redirects
  // Skip HTTPS redirect for localhost (local development)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  if (!isLocalhost) {
    const protocol = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol;
    if (protocol === 'http' || req.nextUrl.protocol === 'http:') {
      const httpsUrl = req.nextUrl.clone();
      httpsUrl.protocol = 'https:';
      return NextResponse.redirect(httpsUrl, 301);
    }
  }
  
  // ----- BLOCKED ROUTES -----
  // Redirect users away from deprecated routes
  if (blockedRoutes.some(route => path === route || path.startsWith(route + '/'))) {
    const redirectUrl = new URL('/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // ----- WWW TO ROOT REDIRECT -----
  // If client only configured root domain, redirect www to root
  // This handles the case where www.domain.com should redirect to domain.com
  if (hostname.startsWith('www.')) {
    const rootDomain = hostname.replace('www.', '');
    // Only redirect for custom domains (not platform domains like www.soursync.com)
    if (isCustomDomain(hostname)) {
      const url = req.nextUrl.clone();
      url.host = rootDomain;
      return NextResponse.redirect(url, 301);
    }
  }
  
  // ----- CUSTOM DOMAIN ROUTING -----
  // Check if this is a custom domain (client's own domain like mycompany.com)
  // IMPORTANT: Exclude API routes and magic link routes from custom domain rewriting - they should go directly
  if (isCustomDomain(hostname) && !path.startsWith('/store/') && !path.startsWith('/site/') && !path.startsWith('/client/') && !path.startsWith('/api/') && !path.startsWith('/c/')) {
    try {
      // Create Supabase client to look up custom domain
      const supabase = createMiddlewareClient({ req, res });
      
      const hostWithoutPort = hostname.split(':')[0];
      
      // First, check if the full hostname (including subdomain) matches a custom domain
      // This handles cases like whitesourcing.sthe.shop where the subdomain might be part of the custom domain
      let { data: settings } = await supabase
        .from('website_settings')
        .select('company_id, companies!inner(slug)')
        .eq('custom_domain', hostWithoutPort)
        .single();
      
      // If not found, check if this is a subdomain of a registered custom domain
      // Example: whitesourcing.sthe.shop when sthe.shop is registered
      if (!settings) {
        const parts = hostWithoutPort.split('.');
        if (parts.length >= 3) {
          // This is a subdomain, try the root domain (e.g., sthe.shop from whitesourcing.sthe.shop)
          const rootDomain = parts.slice(-2).join('.'); // Get last two parts
          const subdomain = parts[0]; // Get first part as potential company slug
          
          // Check if root domain is registered
          const { data: rootSettings } = await supabase
            .from('website_settings')
            .select('company_id, companies!inner(slug)')
            .eq('custom_domain', rootDomain)
            .single();
          
          if (rootSettings) {
            // Root domain is registered, check if subdomain matches the company slug
            const typedRootSettings = rootSettings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
            if (typedRootSettings?.companies) {
              const companies = Array.isArray(typedRootSettings.companies) ? typedRootSettings.companies : [typedRootSettings.companies];
              const company = companies[0] as { slug: string } | undefined;
              
              // If subdomain matches company slug, use it; otherwise use the root domain's company
              if (company?.slug === subdomain || company?.slug) {
                settings = rootSettings;
              }
            }
          }
        }
      }
      
      const typedSettings = settings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
      if (typedSettings?.companies) {
        // Found company with this custom domain
        const companies = Array.isArray(typedSettings.companies) ? typedSettings.companies : [typedSettings.companies];
        const company = companies[0] as { slug: string } | undefined;
        if (company?.slug) {
          // Handle /dashboard-client route
          if (path === '/dashboard-client' || path.startsWith('/dashboard-client/')) {
            const url = req.nextUrl.clone();
            url.pathname = `/dashboard-client`;
            return NextResponse.rewrite(url);
          }
          
          // Rewrite other paths to /site/[companySlug]
          const url = req.nextUrl.clone();
          url.pathname = `/site/${company.slug}${path}`;
          return NextResponse.rewrite(url);
        }
      }
    } catch (error) {
      console.error('Custom domain lookup error:', error);
    }
    // If custom domain not found, continue to show 404 or default page
  }
  
  // ----- SUBDOMAIN ROUTING -----
  const subdomain = getSubdomain(hostname);
  
  // Handle subdomain routing for /client/* paths
  if (subdomain && (path.startsWith('/client/') || path === '/client')) {
    const pathParts = path.split('/').filter(Boolean);
    // pathParts will be ['client', 'companySlug', ...rest] or just ['client']
    
    // If path is just /client or /client/, use subdomain as companySlug
    if (path === '/client' || path === '/client/') {
      const url = req.nextUrl.clone();
      url.pathname = `/client/${subdomain}`;
      return NextResponse.rewrite(url);
    }
    
    // If path has companySlug, check if it matches subdomain
    if (pathParts.length >= 2 && pathParts[0] === 'client') {
      const pathCompanySlug = pathParts[1];
      
      // If the subdomain matches the companySlug in the path, rewrite to ensure consistency
      if (pathCompanySlug === subdomain) {
        // Rewrite to use subdomain as companySlug (in case of any path variations)
        const restOfPath = pathParts.length > 2 ? '/' + pathParts.slice(2).join('/') : '';
        const url = req.nextUrl.clone();
        url.pathname = `/client/${subdomain}${restOfPath}`;
        return NextResponse.rewrite(url);
      }
    }
  }
  
  // Handle subdomain routing for public websites (/site/*)
  // IMPORTANT: do NOT rewrite app routes like /dashboard-client on subdomains.
  // Example desired:
  // - http://whitesourcing.localhost:3000/dashboard-client  (should stay /dashboard-client)
  if (
    subdomain &&
    !path.startsWith('/store/') &&
    !path.startsWith('/site/') &&
    !path.startsWith('/client/') &&
    !(path === '/dashboard-client' || path.startsWith('/dashboard-client/')) &&
    !path.startsWith('/api/') &&
    !path.startsWith('/_next/') &&
    !path.startsWith('/images/')
  ) {
    // Rewrite subdomain requests to /site/[companySlug] path
    const url = req.nextUrl.clone();
    url.pathname = `/site/${subdomain}${path}`;
    return NextResponse.rewrite(url);
  }
  
  // Check if the path should always be public
  const isAlwaysPublic = alwaysPublicPatterns.some(pattern => pattern.test(path));
  if (isAlwaysPublic) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client with the request
    const supabase = createMiddlewareClient({ req, res });

    // Get session data
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ----- CLIENT ROUTES (/client/*) -----
    // These are protected and require client authentication
    if (path.startsWith('/client/')) {
      if (!session) {
        // Extract company slug from path
        const pathParts = path.split('/');
        const companySlug = pathParts[2];
        if (companySlug) {
          const redirectUrl = new URL(`/site/${companySlug}?login=true`, req.url);
          return NextResponse.redirect(redirectUrl);
        }
        // Redirect to signin with return URL
        const redirectUrl = new URL('/signin', req.url);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
      }
      // User is authenticated - let the layout handle client verification
      return res;
    }

    // ----- STORE ROUTES (/store/*) -----
    // These are protected and require authentication
    if (path.startsWith('/store/')) {
      if (!session) {
        // Redirect to signin with return URL
        const redirectUrl = new URL('/signin', req.url);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
      }
      // User is authenticated - let the layout handle company verification
      return res;
    }

    // ----- PUBLIC AUTH ROUTES (/signin, /signup) -----
    if (publicRoutes.includes(path)) {
      if (session) {
        // User is already logged in - redirect to their company dashboard
        try {
          // Get user's profile to find their company
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', session.user.id)
            .single();

          if (profile?.company_id) {
            // Get company slug
            const { data: company } = await supabase
              .from('companies')
              .select('slug')
              .eq('id', profile.company_id)
              .single();

            if (company?.slug) {
              const redirectUrl = new URL(`/store/${company.slug}`, req.url);
              return NextResponse.redirect(redirectUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching user company in middleware:', error);
        }
        // If we can't determine the company, just continue to the page
        // The signin/signup pages will handle the redirect
      }
      return res;
    }

    // ----- ROOT PATH -----
    if (path === '/') {
      if (session) {
        // Redirect logged-in users to their dashboard
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', session.user.id)
            .single();

          if (profile?.company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('slug')
              .eq('id', profile.company_id)
              .single();

            if (company?.slug) {
              const redirectUrl = new URL(`/store/${company.slug}`, req.url);
              return NextResponse.redirect(redirectUrl);
            }
          }
        } catch (error) {
          console.error('Error redirecting from root:', error);
        }
      }
      // Allow access to landing page for non-authenticated users
      return res;
    }

    // ----- ALL OTHER ROUTES -----
    // Default behavior: require authentication
    if (!session) {
      const redirectUrl = new URL('/signin', req.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }

    return res;

  } catch (error) {
    console.error('Middleware error:', error);

    // In case of error, allow access to public routes
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }

    // For other routes, redirect to signin for safety
    const redirectUrl = new URL('/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
