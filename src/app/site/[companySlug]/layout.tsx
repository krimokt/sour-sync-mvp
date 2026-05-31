import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import LocaleProvider from '@/components/storefront/LocaleProvider';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';

// Self-hosted via next/font — zero extra network roundtrip vs <link rel="stylesheet">.
const sora = Sora({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-sora', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['600'], variable: '--font-mono', display: 'swap' });

// Create a public Supabase client for fetching company data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables for public site');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Use React's cache to deduplicate requests within the same render pass
// This ensures generateMetadata and SiteLayout share the same fetch
const getCompany = cache(async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, slug, logo_url,
        settings:website_settings (
          theme_name, logo_url, primary_color, secondary_color, font, is_published
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('[Site Layout] Error fetching company:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('[Site Layout] Exception fetching company:', err);
    return null;
  }
});

export async function generateMetadata({ params }: { params: { companySlug: string } }) {
  const { getTenantSeo, tenantTagline } = await import('@/lib/seo-data');
  const { tenantUrl, metaDescription, absoluteImage } = await import('@/lib/seo');
  const t = await getTenantSeo(params.companySlug);

  if (!t) {
    return { title: 'Store Not Found', robots: { index: false, follow: false } };
  }

  const tagline = tenantTagline(t);

  // Search-engine ownership verification (site-wide so every storefront page carries it).
  const verification: { google?: string; other?: Record<string, string> } = {};
  if (t.google_site_verification) verification.google = t.google_site_verification;
  if (t.bing_site_verification) verification.other = { 'msvalidate.01': t.bing_site_verification };

  return {
    // Child routes set a short title (e.g. "About") -> "About | {Company}".
    // Pages that set `title.absolute` bypass this template.
    title: {
      template: `%s | ${t.name}`,
      default: `${t.name} — ${tagline}`,
    },
    description: metaDescription(tagline, `Welcome to ${t.name}`),
    openGraph: {
      siteName: t.name,
      url: tenantUrl(t, ''),
      images: absoluteImage(t.logo_url) ? [{ url: absoluteImage(t.logo_url)! }] : undefined,
    },
    ...(verification.google || verification.other ? { verification } : {}),
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companySlug: string };
}) {
  const company = await getCompany(params.companySlug);

  if (!company) {
    notFound();
  }

  // Handle array vs object for relation
  const typedCompany = company as { settings?: unknown } | null;
  const settingsData = typedCompany?.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData as { primary_color?: string; [key: string]: unknown } | null | undefined;

  const themeColor = settings?.primary_color || '#3B82F6';

  // Render children directly - the PreviewWrapper handles header/footer dynamically.
  // LocaleProvider supplies storefront UI translations + RTL to the whole subtree.
  return (
    <LocaleProvider>
      {/* Preconnect hints must be in the document head to take effect early. */}
      <link rel="preconnect" href="https://lh3.googleusercontent.com" />
      <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      <div
        className={`min-h-screen flex flex-col bg-white ${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
        style={{ '--theme-color': themeColor } as React.CSSProperties}
      >
        {children}
      </div>
    </LocaleProvider>
  );
}
