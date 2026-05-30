import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/client/',
          '/store/',
          '/c/',
          '/checkoutpage',
          '/payment-details',
          '/select-store',
          '/signin',
          '/signup',
          // Per-tenant transactional/auth routes — not for indexing.
          '/site/*/checkout',
          '/site/*/signin',
          '/site/*/signup',
          '/site/*/track',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
