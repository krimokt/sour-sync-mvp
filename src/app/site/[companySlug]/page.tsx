import { createClient } from '@supabase/supabase-js';
import { WebsiteSection } from '@/types/website';
import PreviewWrapper from '@/components/storefront/PreviewWrapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCompanyWithSettings(slug: string) {
  const { data } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (
        id, theme_name, logo_url, primary_color, secondary_color,
        homepage_layout_draft, homepage_layout_published, is_published
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
  searchParams: { preview?: string };
}) {
  const company = await getCompanyWithSettings(params.companySlug);
  
  if (!company) {
    return null;
  }

  const typedCompany = company as { settings?: unknown } | null;
  const settingsData = typedCompany?.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData as { primary_color?: string; [key: string]: unknown } | null | undefined;
  
  const themeColor = settings?.primary_color || '#3B82F6';
  const isPreview = searchParams.preview === 'true';

  let layout: WebsiteSection[] = [];
  
  if (settings) {
    layout = isPreview 
      ? (settings.homepage_layout_draft as WebsiteSection[]) 
      : (settings.homepage_layout_published as WebsiteSection[]);
  }

  return (
    <PreviewWrapper
      initialLayout={layout || []}
      themeColor={themeColor}
      companyId={company.id}
      companySlug={company.slug}
      companyName={company.name}
      isPreview={isPreview}
    />
  );
}
