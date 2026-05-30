import type { Metadata } from 'next';

/**
 * Shared SEO helpers for tenant storefronts.
 *
 * Canonical URLs are derived purely from DB data (the tenant's verified
 * custom domain, else the platform path) — NOT from the request Host header.
 * This keeps storefront routes ISR-friendly and consolidates the platform,
 * subdomain, and custom-domain copies of a page onto a single canonical URL.
 */

/** Theme-color token → hex, mirroring the builder's accent palette. */
const THEME_ACCENT_HEX: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#2563eb',
  red: '#dc2626',
  emerald: '#059669',
  indigo: '#4f46e5',
  zinc: '#18181b',
};
export function accentHex(themeColor: string | null | undefined): string {
  return (themeColor && THEME_ACCENT_HEX[themeColor]) || '#2563eb';
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://soursync.com'
).replace(/\/$/, '');

/** Minimal shape we need to compute a tenant's canonical origin + path. */
export interface TenantSeoSource {
  slug: string;
  // website_settings may arrive as an object or a 1-element array (PostgREST relation)
  custom_domain?: string | null;
  custom_domain_verified?: boolean | null;
}

/** Normalise a PostgREST relation that may be an object or array. */
export function pickSettings<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

/** The origin a tenant should canonicalise to (verified custom domain, else platform). */
export function tenantOrigin(src: TenantSeoSource): string {
  if (src.custom_domain && src.custom_domain_verified) {
    return `https://${src.custom_domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }
  return SITE_URL;
}

/** Path prefix for a tenant: '' on a verified custom domain, '/site/{slug}' on the platform. */
export function tenantPathPrefix(src: TenantSeoSource): string {
  if (src.custom_domain && src.custom_domain_verified) return '';
  return `/site/${src.slug}`;
}

/**
 * Build a tenant's canonical URL for a sub-path.
 * @param sub leading-slash sub-path under the storefront root, e.g. '' | '/about' | '/products/123'
 */
export function tenantUrl(src: TenantSeoSource, sub = ''): string {
  const clean = sub && !sub.startsWith('/') ? `/${sub}` : sub;
  return `${tenantOrigin(src)}${tenantPathPrefix(src)}${clean}` || `${SITE_URL}/`;
}

/** Trim and collapse whitespace, then cap length for meta description (no mid-word cut). */
export function metaDescription(input: string | null | undefined, fallback: string, max = 160): string {
  const text = (input || fallback).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/** Ensure an image URL is absolute (Supabase URLs already are; relative paths get the platform origin). */
export function absoluteImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const DEFAULT_OG = `${SITE_URL}/images/logo/soursync-logo.svg`;

/**
 * Assemble a Metadata object for a tenant page with canonical + OG/Twitter cards.
 */
export function tenantMetadata(opts: {
  src: TenantSeoSource;
  sub?: string;
  title: string;
  description: string;
  image?: string | null;
  companyName: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const url = tenantUrl(opts.src, opts.sub);
  const image = absoluteImage(opts.image) || DEFAULT_OG;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: opts.companyName,
      images: [{ url: image }],
      type: opts.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
