import { createClient } from '@supabase/supabase-js';
import BuilderNavbar from '@/components/website/builder/chinasource-builder-components/BuilderNavbar';
import SiteFooter from '@/components/website/builder/chinasource-builder-components/SiteFooter';
import FloatingChatButton from '@/components/storefront/FloatingChatButton';
import type { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const themeAccentHex: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#2563eb',
  red: '#dc2626',
  emerald: '#059669',
  indigo: '#4f46e5',
  zinc: '#18181b',
};

async function getBuilderData(slug: string) {
  const { data } = await supabase
    .from('companies')
    .select('id, name, slug, settings:website_settings (published_builder_data)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!data) return null;
  const settingsData = (data as { settings?: unknown }).settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
  const builder = (settings as { published_builder_data?: unknown } | null)?.published_builder_data as
    | { formData?: FormData; generatedContent?: GeneratedContent }
    | undefined;
  if (!builder?.formData || !builder?.generatedContent) return null;
  return { formData: builder.formData, generatedContent: builder.generatedContent };
}

export default async function BuilderSiteShell({
  companySlug,
  children,
}: {
  companySlug: string;
  children: React.ReactNode;
}) {
  const builder = await getBuilderData(companySlug);

  // No builder data? Render children alone, but still expose the chat button
  // with whatever we have (no contact channels — quote link only).
  if (!builder) {
    return (
      <>
        {children}
        <FloatingChatButton companySlug={companySlug} />
      </>
    );
  }

  const accentColor = themeAccentHex[builder.formData.themeColor] || '#2563eb';
  const contactEmail = builder.generatedContent.contact?.email || builder.formData.email || null;
  const contactWhatsapp = builder.generatedContent.contact?.whatsapp || builder.formData.whatsapp || null;

  return (
    <>
      <BuilderNavbar
        data={builder.formData}
        content={builder.generatedContent}
        companySlug={companySlug}
        linkToHome
      />
      {/* Spacer for the fixed navbar (h-20 collapses to h-14 on scroll) */}
      <div className="h-20" />
      <main>{children}</main>
      <SiteFooter
        data={builder.formData}
        content={builder.generatedContent}
        accentColor={accentColor}
        companySlug={companySlug}
      />
      <FloatingChatButton
        companySlug={companySlug}
        email={contactEmail}
        whatsapp={contactWhatsapp}
      />
    </>
  );
}
