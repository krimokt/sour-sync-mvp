import { createClient } from '@supabase/supabase-js';
import { WebsiteSection } from '@/types/website';
import PreviewWrapper from '@/components/storefront/PreviewWrapper';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SiteDynamicPage({
  params,
  searchParams,
}: {
  params: { companySlug: string; pageSlug: string };
  searchParams: { preview?: string };
}) {
  const { companySlug, pageSlug } = params;
  const isPreview = searchParams.preview === 'true';

  // 1. Fetch Company & Settings
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (
        id, theme_name, logo_url, primary_color, secondary_color, accent_color, 
        font_heading, font_body, is_published
      )
    `)
    .eq('slug', companySlug)
    .eq('status', 'active')
    .single();

  if (!company) return notFound();

  const settingsData = company.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
  const themeColor = settings?.primary_color || '#3B82F6';
  const fontHeading = settings?.font_heading || 'Inter';
  const fontBody = settings?.font_body || 'Inter';

  // 2. Fetch Page Content
  const { data: page } = await supabase
    .from('website_pages')
    .select('*')
    .eq('company_id', company.id)
    .eq('slug', pageSlug)
    .single();

  if (!page) return notFound();

  // If public access (not preview) and page is not published, 404
  if (!isPreview && !page.is_published) {
    return notFound();
  }

  // Use content (draft/live mixed for now until schema update)
  const layout = (page.content || []) as WebsiteSection[];

  return (
    <PreviewWrapper
      initialLayout={layout}
      themeColor={themeColor}
      fontHeading={fontHeading}
      fontBody={fontBody}
      companyId={company.id}
      companySlug={company.slug}
      companyName={company.name}
      isPreview={isPreview}
    />
  );
}

