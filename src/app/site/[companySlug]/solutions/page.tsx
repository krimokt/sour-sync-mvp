import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';
import { SolutionsStandalone } from '@/components/storefront/StandaloneSections';
import { getTenantSeo, getTenantBuilder } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage, accentHex } from '@/lib/seo';
import { isStorefrontLocale, dirFor, localeAlternates, DEFAULT_LOCALE } from '@/lib/i18n/storefront-dict';
import { translateBuilderContent } from '@/lib/i18n/translate-content';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Solutions', robots: { index: false, follow: false } };
  const builder = await getTenantBuilder(params.companySlug);
  const description = metaDescription(
    builder?.generatedContent?.solutions?.description,
    `Sourcing solutions and services from ${t.name}. Request a quote today.`,
  );
  const url = tenantUrl(t, '/solutions');
  const image = absoluteImage(t.logo_url);
  return {
    title: 'Solutions',
    description,
    alternates: { canonical: url, languages: localeAlternates(url) },
    openGraph: { title: `Solutions | ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `Solutions | ${t.name}`, description, images: image ? [image] : undefined },
  };
}

export default async function SolutionsPage({
  params,
  searchParams,
}: {
  params: { companySlug: string };
  searchParams: { lang?: string };
}) {
  const t = await getTenantSeo(params.companySlug);
  if (!t) notFound();
  const builder = await getTenantBuilder(params.companySlug);
  if (!builder) notFound();

  const locale = isStorefrontLocale(searchParams.lang) ? searchParams.lang : DEFAULT_LOCALE;
  const gc =
    locale === DEFAULT_LOCALE
      ? builder.generatedContent
      : await translateBuilderContent(t.id, builder.generatedContent, locale);

  const ldCrumb = breadcrumbLd([
    { name: 'Home', url: tenantUrl(t, '') },
    { name: 'Solutions', url: tenantUrl(t, '/solutions') },
  ]);

  return (
    <BuilderSiteShell companySlug={params.companySlug}>
      <JsonLd data={ldCrumb} />
      <div lang={locale} dir={dirFor(locale)}>
        <SolutionsStandalone
          solutions={gc.solutions}
          accentHex={accentHex(builder.formData.themeColor)}
          themeColor={builder.formData.themeColor}
        />
      </div>
    </BuilderSiteShell>
  );
}
