import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { pickSettings } from '@/lib/seo';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface BuilderHero {
  tagline?: string;
  headline?: string;
  subheadline?: string;
}
interface BuilderData {
  formData?: { companyName?: string; services?: string; countries?: string };
  generatedContent?: {
    hero?: BuilderHero;
    about?: { title?: string; description?: string };
  };
}

export interface TenantSeo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  custom_domain: string | null;
  custom_domain_verified: boolean | null;
  is_published: boolean;
  builder: BuilderData | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_location: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  google_site_verification: string | null;
  bing_site_verification: string | null;
}

/**
 * Normalised SEO source for a tenant, deduplicated per render via React cache.
 * Sources canonical fields + marketing copy from the related website_settings row.
 */
export const getTenantSeo = cache(async (slug: string): Promise<TenantSeo | null> => {
  const { data } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url, country,
      settings:website_settings (
        custom_domain, custom_domain_verified, is_published, published_builder_data,
        contact_email, contact_phone, contact_location,
        meta_title, meta_description, og_image,
        google_site_verification, bing_site_verification
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!data) return null;

  const s = pickSettings(
    (data as { settings?: unknown }).settings as
      | {
          custom_domain?: string | null;
          custom_domain_verified?: boolean | null;
          is_published?: boolean | null;
          published_builder_data?: BuilderData | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_location?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image?: string | null;
          google_site_verification?: string | null;
          bing_site_verification?: string | null;
        }
      | null,
  );

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logo_url: data.logo_url ?? null,
    country: data.country ?? null,
    custom_domain: s?.custom_domain ?? null,
    custom_domain_verified: s?.custom_domain_verified ?? null,
    is_published: s?.is_published ?? false,
    builder: s?.published_builder_data ?? null,
    contact_email: s?.contact_email ?? null,
    contact_phone: s?.contact_phone ?? null,
    contact_location: s?.contact_location ?? null,
    meta_title: s?.meta_title ?? null,
    meta_description: s?.meta_description ?? null,
    og_image: s?.og_image ?? null,
    google_site_verification: s?.google_site_verification ?? null,
    bing_site_verification: s?.bing_site_verification ?? null,
  };
});

export interface ProductSeo {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  sku: string | null;
  category: string | null;
  company_id: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_image: string | null;
}

export const getProductSeo = cache(async (productId: string): Promise<ProductSeo | null> => {
  const { data } = await supabase
    .from('products')
    .select(
      'id, name, description, images, sku, category, company_id, slug, meta_title, meta_description, focus_keyword, og_image',
    )
    .eq('id', productId)
    .eq('is_published', true)
    .single();
  return (data as ProductSeo) ?? null;
});

import type { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';

/** Full published builder payload for a tenant (for standalone section pages). */
export const getTenantBuilder = cache(
  async (slug: string): Promise<{ formData: FormData; generatedContent: GeneratedContent } | null> => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, slug, settings:website_settings (published_builder_data)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    if (!data) return null;
    const s = pickSettings(
      (data as { settings?: unknown }).settings as
        | { published_builder_data?: { formData?: FormData; generatedContent?: GeneratedContent } | null }
        | null,
    );
    const builder = s?.published_builder_data;
    if (!builder?.formData || !builder?.generatedContent) return null;
    return { formData: builder.formData, generatedContent: builder.generatedContent };
  },
);

export interface BlogPostSeo {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  published_at: string | null;
  updated_at: string | null;
}

/** Published blog posts for a tenant (newest first). */
export const getPublishedPosts = cache(async (companyId: string): Promise<BlogPostSeo[]> => {
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, content, cover_image, meta_title, meta_description, og_image, published_at, updated_at')
    .eq('company_id', companyId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data as BlogPostSeo[]) ?? [];
});

/** A single published post by slug, scoped to a company. */
export const getPostBySlug = cache(
  async (companyId: string, slug: string): Promise<BlogPostSeo | null> => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, content, cover_image, meta_title, meta_description, og_image, published_at, updated_at')
      .eq('company_id', companyId)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    return (data as BlogPostSeo) ?? null;
  },
);

/** Best available marketing tagline for a tenant. */
export function tenantTagline(t: TenantSeo): string {
  const hero = t.builder?.generatedContent?.hero;
  return (
    hero?.subheadline ||
    hero?.tagline ||
    hero?.headline ||
    t.builder?.generatedContent?.about?.description ||
    `${t.name}${t.country ? ` — sourcing from ${t.country.toUpperCase()}` : ''}`
  );
}
