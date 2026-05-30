import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { tenantUrl, pickSettings, type TenantSeoSource } from '@/lib/seo';

// Revalidate the sitemap hourly — new products/companies appear within the hour.
export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface CompanyRow {
  id: string;
  slug: string;
  updated_at: string | null;
  settings:
    | { custom_domain: string | null; custom_domain_verified: boolean | null; is_published: boolean | null }
    | { custom_domain: string | null; custom_domain_verified: boolean | null; is_published: boolean | null }[]
    | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only published storefronts of active companies are indexable.
  const { data: companyRows } = await supabase
    .from('companies')
    .select(`
      id, slug, updated_at,
      settings:website_settings ( custom_domain, custom_domain_verified, is_published )
    `)
    .eq('status', 'active');

  const companies = ((companyRows as CompanyRow[] | null) ?? [])
    .map((c) => {
      const s = pickSettings(c.settings);
      return {
        id: c.id,
        src: { slug: c.slug, custom_domain: s?.custom_domain, custom_domain_verified: s?.custom_domain_verified } as TenantSeoSource,
        published: s?.is_published === true,
        updatedAt: c.updated_at ? new Date(c.updated_at) : undefined,
      };
    })
    .filter((c) => c.published);

  if (companies.length === 0) return [];

  const companyIds = companies.map((c) => c.id);

  const { data: productRows } = await supabase
    .from('products')
    .select('id, company_id, updated_at')
    .in('company_id', companyIds)
    .eq('is_published', true);

  const productsByCompany = new Map<string, { id: string; updatedAt?: Date }[]>();
  for (const p of (productRows as { id: string; company_id: string; updated_at: string | null }[] | null) ?? []) {
    const list = productsByCompany.get(p.company_id) ?? [];
    list.push({ id: p.id, updatedAt: p.updated_at ? new Date(p.updated_at) : undefined });
    productsByCompany.set(p.company_id, list);
  }

  // Published blog posts per company.
  const { data: postRows } = await supabase
    .from('blog_posts')
    .select('slug, company_id, updated_at')
    .in('company_id', companyIds)
    .eq('status', 'published');

  const postsByCompany = new Map<string, { slug: string; updatedAt?: Date }[]>();
  for (const p of (postRows as { slug: string; company_id: string; updated_at: string | null }[] | null) ?? []) {
    const list = postsByCompany.get(p.company_id) ?? [];
    list.push({ slug: p.slug, updatedAt: p.updated_at ? new Date(p.updated_at) : undefined });
    postsByCompany.set(p.company_id, list);
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const c of companies) {
    entries.push(
      { url: tenantUrl(c.src, ''), lastModified: c.updatedAt, changeFrequency: 'weekly', priority: 1 },
      { url: tenantUrl(c.src, '/products'), changeFrequency: 'daily', priority: 0.8 },
      { url: tenantUrl(c.src, '/solutions'), changeFrequency: 'monthly', priority: 0.6 },
      { url: tenantUrl(c.src, '/process'), changeFrequency: 'monthly', priority: 0.5 },
      { url: tenantUrl(c.src, '/certifications'), changeFrequency: 'monthly', priority: 0.5 },
      { url: tenantUrl(c.src, '/about'), changeFrequency: 'monthly', priority: 0.5 },
      { url: tenantUrl(c.src, '/services'), changeFrequency: 'monthly', priority: 0.5 },
      { url: tenantUrl(c.src, '/contact'), changeFrequency: 'yearly', priority: 0.5 },
      { url: tenantUrl(c.src, '/blog'), changeFrequency: 'weekly', priority: 0.6 },
    );
    for (const p of productsByCompany.get(c.id) ?? []) {
      entries.push({
        url: tenantUrl(c.src, `/products/${p.id}`),
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    for (const post of postsByCompany.get(c.id) ?? []) {
      entries.push({
        url: tenantUrl(c.src, `/blog/${post.slug}`),
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
