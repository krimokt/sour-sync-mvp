import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

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

async function getCompany(slug: string) {
  console.log('[Site Layout] Fetching company with slug:', slug);
  
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
    
    console.log('[Site Layout] Company found:', data?.name);
    return data;
  } catch (err) {
    console.error('[Site Layout] Exception fetching company:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { companySlug: string } }) {
  const company = await getCompany(params.companySlug);
  
  if (!company) {
    return {
      title: 'Store Not Found',
    };
  }

  return {
    title: company.name,
    description: `Welcome to ${company.name}`,
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
  const settingsData = company.settings;
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;

  const themeColor = settings?.primary_color || '#3B82F6';

  // Render children directly - the PreviewWrapper handles header/footer dynamically
  return (
    <div 
      className="min-h-screen flex flex-col bg-white"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
