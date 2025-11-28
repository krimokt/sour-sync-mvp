import { createClient } from '@supabase/supabase-js';
import TrackOrderClient from './TrackOrderClient';
import StoreHeader from '../components/StoreHeader';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCompany(slug: string) {
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, name, slug, logo_url,
      settings:website_settings (primary_color)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  return company;
}

export default async function TrackOrderPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const company = await getCompany(params.companySlug);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Store not found</p>
      </div>
    );
  }

  const settings = Array.isArray(company.settings) ? company.settings[0] : company.settings;
  const themeColor = settings?.primary_color || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader 
        companyName={company.name} 
        logoUrl={company.logo_url} 
        themeColor={themeColor} 
      />
      <TrackOrderClient companySlug={params.companySlug} themeColor={themeColor} />
    </div>
  );
}
