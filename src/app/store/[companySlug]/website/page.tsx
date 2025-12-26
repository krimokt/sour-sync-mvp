import { createServerSupabaseClient } from '@/lib/supabase-server';
import ChinaSourceBuilder from '@/components/website/builder/ChinaSourceBuilder';
import { WebsiteSettings } from '@/types/website';

export default async function WebsiteBuilderPage({ params }: { params: { companySlug: string } }) {
  const supabase = createServerSupabaseClient();
  
  // Fetch company & website settings
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, slug,
      settings:website_settings(*)
    `)
    .eq('slug', params.companySlug)
    .single();

  const typedCompany = company as { id: string; slug: string; settings?: WebsiteSettings | WebsiteSettings[] | null } | null;
  if (!typedCompany) return (
    <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
      <p>Company not found</p>
    </div>
  );

  // Handle potential array return from relation
  const settingsData = typedCompany.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
  
  if (!settings) return (
    <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
      <div className="max-w-md bg-[#2a2a2a] border border-[#333] rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Website Settings Not Found</h2>
        <p className="text-sm text-gray-400">
          Website settings have not been initialized. Please contact support or try creating a new company.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen -m-6 overflow-auto">
      <ChinaSourceBuilder 
        companyId={typedCompany.id}
        companySlug={typedCompany.slug}
        initialSettings={settings as WebsiteSettings}
      />
    </div>
  );
}
