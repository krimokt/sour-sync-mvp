import { createClient } from '@supabase/supabase-js';
import { WebsiteSection } from '@/types/website';
import dynamic from 'next/dynamic';
import { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';

// Dynamic imports: each storefront only loads the component it actually uses.
const PreviewWrapper = dynamic(() => import('@/components/storefront/PreviewWrapper'));
const PublishedBuilderSite = dynamic(() => import('@/components/storefront/PublishedBuilderSite'));
const WhiteSourcingHome = dynamic(() => import('@/components/storefront/whitesourcing/WhiteSourcingHome'));

import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { organizationLd, localBusinessLd } from '@/lib/jsonld';
import { getTenantSeo, tenantTagline, getPublishedCaseStudies, getPublishedTestimonials } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage } from '@/lib/seo';
import { isStorefrontLocale, dirFor, localeAlternates, DEFAULT_LOCALE } from '@/lib/i18n/storefront-dict';
import { translateBuilderContent, translateCaseStudies, translateTestimonials } from '@/lib/i18n/translate-content';

export const revalidate = 3600; // ISR: re-fetch from Supabase at most once per hour

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Store Not Found', robots: { index: false, follow: false } };
  const tagline = tenantTagline(t);
  const derivedTitle = `${t.name} — ${tagline}`;
  // Tenant-set overrides win over derived defaults.
  const title = t.meta_title || derivedTitle;
  const description = t.meta_description || metaDescription(tagline, `Welcome to ${t.name}`);
  const url = tenantUrl(t, '');
  const image = absoluteImage(t.og_image) || absoluteImage(t.logo_url);
  return {
    title: { absolute: title.length > 65 ? title.slice(0, 65) : title },
    description,
    alternates: { canonical: url, languages: localeAlternates(url) },
    openGraph: {
      title,
      description,
      url,
      siteName: t.name,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
    robots: { index: true, follow: true },
  };
}

async function getCompanyWithSettings(slug: string) {
  const { data } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (
        id, theme_name, logo_url, primary_color, secondary_color,
        homepage_layout_draft, homepage_layout_published, is_published,
        published_builder_data
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  
  return data;
}

export default async function SiteHomePage({
  params,
  searchParams,
}: {
  params: { companySlug: string };
  searchParams: { preview?: string; lang?: string };
}) {
  const locale = isStorefrontLocale(searchParams.lang) ? searchParams.lang : DEFAULT_LOCALE;

  // Run the two independent fetches in parallel instead of sequentially.
  const [company, t] = await Promise.all([
    getCompanyWithSettings(params.companySlug),
    getTenantSeo(params.companySlug),
  ]);

  if (!company) {
    return null;
  }

  const orgLd = t
    ? organizationLd({ name: t.name, url: tenantUrl(t, ''), logo: absoluteImage(t.logo_url), description: tenantTagline(t) })
    : null;
  const localLd = t
    ? localBusinessLd({ name: t.name, url: tenantUrl(t, ''), logo: absoluteImage(t.logo_url), telephone: t.contact_phone, email: t.contact_email, address: t.contact_location, countryCode: t.country })
    : null;

  const typedCompany = company as { settings?: unknown } | null;
  const settingsData = typedCompany?.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData as { 
    primary_color?: string; 
    published_builder_data?: { formData: unknown; generatedContent: unknown };
    homepage_layout_draft?: unknown;
    homepage_layout_published?: unknown;
    [key: string]: unknown;
  } | null | undefined;
  
  const themeColor = settings?.primary_color || '#3B82F6';
  const isPreview = searchParams.preview === 'true';

  // Check if this is a ChinaSource builder website
  const builderData = settings?.published_builder_data;

  // If builder data exists, render the builder site
  if (builderData && typeof builderData === 'object' && 'formData' in builderData && 'generatedContent' in builderData) {
    const typedBuilderData = builderData as { formData: FormData; generatedContent: GeneratedContent };
    if (typedBuilderData.formData && typedBuilderData.generatedContent) {
      // Published case-study portfolio + testimonials for this tenant's homepage.
      const [caseStudiesRaw, testimonialsRaw] = await Promise.all([
        getPublishedCaseStudies(company.id),
        getPublishedTestimonials(company.id),
      ]);

      // Auto-translate tenant content for non-default locales (cached server-side).
      const [generatedContent, caseStudies, testimonials] =
        locale === DEFAULT_LOCALE
          ? [typedBuilderData.generatedContent, caseStudiesRaw, testimonialsRaw]
          : await Promise.all([
              translateBuilderContent(company.id, typedBuilderData.generatedContent, locale),
              translateCaseStudies(company.id, caseStudiesRaw, locale),
              translateTestimonials(company.id, testimonialsRaw, locale),
            ]);

      // whitesourcing uses the bespoke "Industrial Precision" homepage; every
      // other tenant keeps the standard builder template.
      if (params.companySlug === 'whitesourcing') {
        return (
          <div lang={locale} dir={dirFor(locale)}>
            <JsonLd data={[orgLd, localLd]} />
            <WhiteSourcingHome
              companySlug={params.companySlug}
              formData={typedBuilderData.formData}
              generatedContent={generatedContent}
              caseStudies={caseStudies}
              testimonials={testimonials}
            />
          </div>
        );
      }

      return (
        <div lang={locale} dir={dirFor(locale)}>
          <JsonLd data={[orgLd, localLd]} />
          <PublishedBuilderSite
            formData={typedBuilderData.formData}
            generatedContent={generatedContent}
            companySlug={params.companySlug}
            caseStudies={caseStudies}
            testimonials={testimonials}
          />
        </div>
      );
    }
  }

  // Otherwise, render the old layout system
  let layout: WebsiteSection[] = [];
  
  if (settings) {
    layout = isPreview 
      ? (settings.homepage_layout_draft as WebsiteSection[]) 
      : (settings.homepage_layout_published as WebsiteSection[]);
  }

  return (
    <>
      <JsonLd data={[orgLd, localLd]} />
      <PreviewWrapper
        initialLayout={layout || []}
        themeColor={themeColor}
        companyId={company.id}
        companySlug={company.slug}
        companyName={company.name}
        isPreview={isPreview}
      />
    </>
  );
}
