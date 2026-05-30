import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StoreHeader from '../components/StoreHeader';
import ContactSection from '../components/ContactSection';
import { getTenantSeo } from '@/lib/seo-data';
import { tenantUrl, metaDescription, absoluteImage } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { companySlug: string } }): Promise<Metadata> {
  const t = await getTenantSeo(params.companySlug);
  if (!t) return { title: 'About', robots: { index: false, follow: false } };
  const about = t.builder?.generatedContent?.about;
  const description = metaDescription(
    about?.description,
    `Learn about ${t.name}${t.country ? `, a sourcing partner in ${t.country.toUpperCase()}` : ''}.`,
  );
  const url = tenantUrl(t, '/about');
  const image = absoluteImage(t.logo_url);
  return {
    title: `About ${t.name}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `About ${t.name}`, description, url, siteName: t.name, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: `About ${t.name}`, description, images: image ? [image] : undefined },
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Subset of the AI-generated landing page content we render on the About page.
// Kept loose so it survives schema drift in the builder data.
interface PublishedBuilderData {
  formData?: {
    companyName?: string;
    logoUrl?: string | null;
    services?: string;
    countries?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    wechat?: string;
  };
  generatedContent?: {
    hero?: { tagline?: string; headline?: string; subheadline?: string };
    about?: {
      title?: string;
      description?: string;
      image?: string;
      trustMetrics?: { label?: string; value?: string; suffix?: string }[];
    };
    solutions?: {
      title?: string;
      description?: string;
      items?: { title?: string; description?: string; icon?: string }[];
    };
    contact?: {
      title?: string;
      address?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      wechat?: string;
    };
    certificates?: { url: string; label?: string }[];
  };
}

interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_settings: {
    primary_color?: string | null;
    published_builder_data?: PublishedBuilderData | null;
  } | null;
}

async function getCompany(slug: string): Promise<CompanyRow | null> {
  const { data } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      website_settings ( primary_color, published_builder_data )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as CompanyRow | null;
}

export default async function AboutPage({ params }: { params: { companySlug: string } }) {
  const company = await getCompany(params.companySlug);
  if (!company) notFound();

  const t = await getTenantSeo(params.companySlug);
  const ldCrumb = t
    ? breadcrumbLd([
        { name: 'Home', url: tenantUrl(t, '') },
        { name: 'About', url: tenantUrl(t, '/about') },
      ])
    : null;

  const settings = Array.isArray(company.website_settings)
    ? company.website_settings[0]
    : company.website_settings;
  const themeColor = settings?.primary_color || '#0ea5e9';
  const builder = settings?.published_builder_data ?? {};
  const about = builder.generatedContent?.about;
  const solutions = builder.generatedContent?.solutions;
  const contact = builder.generatedContent?.contact;
  const certificates = builder.generatedContent?.certificates ?? [];

  return (
    <>
    <JsonLd data={ldCrumb} />
    <div className="min-h-screen bg-gray-50">
      <StoreHeader
        companyName={company.name}
        logoUrl={company.logo_url ?? undefined}
        themeColor={themeColor}
      />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: themeColor }}>
            About {company.name}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900">
            {about?.title || 'Who we are'}
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            {about?.description ||
              `We help global businesses source quality products from China — fast, reliable, and at a fair price.`}
          </p>
        </div>
      </section>

      {/* Trust metrics */}
      {about?.trustMetrics && about.trustMetrics.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {about.trustMetrics.map((m, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {m.value}{m.suffix}
              </div>
              <div className="mt-1 text-sm text-gray-500">{m.label}</div>
            </div>
          ))}
        </section>
      )}

      {/* Our advantages */}
      {solutions?.items && solutions.items.length > 0 && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">{solutions.title || 'Our advantages'}</h2>
              {solutions.description && (
                <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{solutions.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.items.map((it, i) => (
                <div key={i} className="p-6 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{it.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{it.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Certificates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {certificates.map((c, i) => (
              <figure key={i} className="bg-white rounded-xl border border-gray-200 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.url}
                  alt={c.label || `Certificate ${i + 1}`}
                  loading="lazy"
                  className="w-full h-40 object-contain"
                />
                {c.label && (
                  <figcaption className="mt-2 text-center text-xs text-gray-600">{c.label}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <ContactSection
        companySlug={company.slug}
        themeColor={themeColor}
        contact={contact}
        defaultEmail={builder.formData?.email}
        defaultPhone={builder.formData?.phone}
      />
    </div>
    </>
  );
}
