import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BuilderSiteShell from '@/components/storefront/BuilderSiteShell';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';
import { ContactStandalone } from '@/components/storefront/StandaloneSections';
import { getTenantSeo, getTenantBuilder } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage, accentHex } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'Contact', robots: { index: false, follow: false } };
  const description = metaDescription(
    undefined,
    `Contact ${t.name} for a sourcing quote. We reply within 24 hours.`,
  );
  const url = tenantUrl(t, '/contact');
  const image = absoluteImage(t.logo_url);
  return {
    title: 'Contact',
    description,
    alternates: { canonical: url },
    openGraph: { title: `Contact | ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `Contact | ${t.name}`, description, images: image ? [image] : undefined },
  };
}

export default async function ContactPage({ params }: { params: { companySlug: string } }) {
  const t = await getTenantSeo(params.companySlug);
  if (!t) notFound();
  const builder = await getTenantBuilder(params.companySlug);
  if (!builder) notFound();

  const contact = builder.generatedContent.contact;
  const url = tenantUrl(t, '/contact');
  const ldCrumb = breadcrumbLd([
    { name: 'Home', url: tenantUrl(t, '') },
    { name: 'Contact', url },
  ]);
  // ContactPoint as part of the Organization entity.
  const ldContact = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t.name,
    url: tenantUrl(t, ''),
    ...(contact?.email || contact?.phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'sales',
            ...(contact.email ? { email: contact.email } : {}),
            ...(contact.phone ? { telephone: contact.phone } : {}),
          },
        }
      : {}),
  };

  return (
    <BuilderSiteShell companySlug={params.companySlug}>
      <JsonLd data={[ldContact, ldCrumb]} />
      <ContactStandalone
        contact={contact}
        companySlug={params.companySlug}
        accentHex={accentHex(builder.formData.themeColor)}
      />
    </BuilderSiteShell>
  );
}
