/**
 * schema.org JSON-LD builders for tenant storefronts.
 *
 * Each builder returns a plain object ready to be rendered by the <JsonLd>
 * component. Keep these pure (no I/O) so pages can call them with data they
 * already fetched. Omit empty/optional fields rather than emitting nulls —
 * Google prefers absent over empty.
 */

type Json = Record<string, unknown>;

/** Drop undefined/null/empty-string entries so we never emit empty schema fields. */
function clean<T extends Json>(obj: T): T {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

export function organizationLd(opts: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}): Json {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name,
    url: opts.url,
    logo: opts.logo,
    description: opts.description,
    sameAs: opts.sameAs,
  });
}

/**
 * LocalBusiness — only meaningful when we have an address or phone.
 * Returns null when there's nothing location-specific to say.
 */
export function localBusinessLd(opts: {
  name: string;
  url: string;
  logo?: string;
  telephone?: string | null;
  email?: string | null;
  address?: string | null;
  countryCode?: string | null;
}): Json | null {
  if (!opts.address && !opts.telephone) return null;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: opts.name,
    url: opts.url,
    image: opts.logo,
    telephone: opts.telephone || undefined,
    email: opts.email || undefined,
    address: opts.address
      ? clean({
          '@type': 'PostalAddress',
          streetAddress: opts.address,
          addressCountry: opts.countryCode ? opts.countryCode.toUpperCase() : undefined,
        })
      : undefined,
  });
}

export function productLd(opts: {
  name: string;
  url: string;
  description?: string;
  images?: string[];
  sku?: string | null;
  brandName: string;
  price?: number | null;
  currency?: string;
  inStock?: boolean;
}): Json {
  const hasOffer = typeof opts.price === 'number' && opts.price > 0;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    image: opts.images,
    sku: opts.sku || undefined,
    brand: clean({ '@type': 'Brand', name: opts.brandName }),
    offers: hasOffer
      ? clean({
          '@type': 'Offer',
          price: opts.price,
          priceCurrency: opts.currency || 'USD',
          availability: opts.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: opts.url,
        })
      : undefined,
  });
}

export function articleLd(opts: {
  headline: string;
  url: string;
  description?: string;
  image?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName: string;
}): Json {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: opts.image,
    url: opts.url,
    datePublished: opts.datePublished || undefined,
    dateModified: opts.dateModified || opts.datePublished || undefined,
    author: clean({ '@type': 'Organization', name: opts.authorName }),
    publisher: clean({ '@type': 'Organization', name: opts.authorName }),
    mainEntityOfPage: opts.url,
  });
}

export function breadcrumbLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
