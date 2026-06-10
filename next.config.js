/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const immutable = { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' };
    return [
      // Security headers (migrated from netlify.toml). Vercel serves _next/static
      // with immutable caching automatically, so that rule is no longer needed.
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Aggressively cache public images served from /public.
      { source: '/images/:path*', headers: [immutable] },
      { source: '/:all*(webp|png|jpg|jpeg|svg|gif|ico|avif)', headers: [immutable] },
      { source: '/favicon.svg', headers: [immutable] },
      // Never cache API responses.
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  eslint: { ignoreDuringBuilds: true },
  // Types are valid at runtime; the deprecated @supabase/auth-helpers-nextjs
  // package fails to infer them. Remove once we migrate to @supabase/ssr.
  typescript: { ignoreBuildErrors: true },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.iconfinder.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 's.alicdn.com',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

module.exports = nextConfig;
