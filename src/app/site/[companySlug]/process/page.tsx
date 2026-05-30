import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';
import { ProcessStandalone } from '@/components/storefront/StandaloneSections';
import { getTenantSeo, getTenantBuilder } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage, accentHex } from '@/lib/seo';
import { isStorefrontLocale, dirFor, localeAlternates, DEFAULT_LOCALE } from '@/lib/i18n/storefront-dict';
import { translateBuilderContent } from '@/lib/i18n/translate-content';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Process', robots: { index: false, follow: false } };
  const description = metaDescription(
    undefined,
    `How ${t.name} works — our end-to-end sourcing, quality control and logistics process.`,
  );
  const url = tenantUrl(t, '/process');
  const image = absoluteImage(t.logo_url);
  return {
    title: 'Process',
    description,
    alternates: { canonical: url, languages: localeAlternates(url) },
    openGraph: { title: `Process | ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `Process | ${t.name}`, description, images: image ? [image] : undefined },
  };
}

export default async function ProcessPage({
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
    { name: 'Process', url: tenantUrl(t, '/process') },
  ]);

  return (
    <BuilderSiteShell companySlug={params.companySlug}>
      <JsonLd data={ldCrumb} />
      <div lang={locale} dir={dirFor(locale)}>
        <ProcessStandalone
          howItWorks={gc.howItWorks}
          accentHex={accentHex(builder.formData.themeColor)}
        />
      </div>
    </BuilderSiteShell>
  );
}
