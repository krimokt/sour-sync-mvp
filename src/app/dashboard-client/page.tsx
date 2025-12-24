import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';

export default async function DashboardClientPage() {
  const supabase = createServerSupabaseClient();
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const hostWithoutPort = hostname.split(':')[0];
  
  // Check if user is authenticated first
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Try to get company from custom domain or subdomain
    let companySlug: string | null = null;
    
    // Try custom domain first
    const { data: settings } = await supabase
      .from('website_settings')
      .select('company_id, companies!inner(slug)')
      .eq('custom_domain', hostWithoutPort)
      .single();

    const typedSettings1 = settings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
    if (typedSettings1?.companies) {
      const companies = Array.isArray(typedSettings1.companies) ? typedSettings1.companies : [typedSettings1.companies];
      companySlug = companies[0]?.slug || null;
    }
    
    // If no custom domain, try subdomain (for localhost: whitesourcing.localhost:3000)
    if (!companySlug && hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        companySlug = parts[0];
      }
    }
    
    if (companySlug) {
      redirect(`/site/${companySlug}/signin`);
    } else {
      // Fallback: redirect to home
      redirect('/');
    }
  }

  // User is authenticated - find which company they're a client of
  // Get all clients for this user with their companies
  // Note: Using service role client to bypass RLS for this check
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: clientsData, error: clientsError } = await supabaseService
    .from('clients')
    .select(`
      company_id,
      companies!inner (
        id,
        slug,
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (clientsError) {
    console.error('Error fetching clients:', clientsError);
    // If there's an error, try to get company from domain for error message
    let companySlug: string | null = null;
    
    const { data: settings } = await supabase
      .from('website_settings')
      .select('company_id, companies!inner(slug)')
      .eq('custom_domain', hostWithoutPort)
      .single();

    const typedSettings3 = settings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
    if (typedSettings3?.companies) {
      const companies = Array.isArray(typedSettings3.companies) ? typedSettings3.companies : [typedSettings3.companies];
      companySlug = companies[0]?.slug || null;
    }
    
    if (!companySlug && hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        companySlug = parts[0];
      }
    }
    
    if (companySlug) {
      redirect(`/site/${companySlug}/signin?error=not_authorized`);
    } else {
      redirect('/');
    }
  }

  if (!clientsData || clientsData.length === 0) {
    // User is not a client of any company
    // Try to get company from domain to show proper error
    let companySlug: string | null = null;
    
    const { data: settings } = await supabase
      .from('website_settings')
      .select('company_id, companies!inner(slug)')
      .eq('custom_domain', hostWithoutPort)
      .single();

    const typedSettings4 = settings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
    if (typedSettings4?.companies) {
      const companies = Array.isArray(typedSettings4.companies) ? typedSettings4.companies : [typedSettings4.companies];
      companySlug = companies[0]?.slug || null;
    }
    
    if (!companySlug && hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        companySlug = parts[0];
      }
    }
    
    if (companySlug) {
      redirect(`/site/${companySlug}/signin?error=not_authorized`);
    } else {
      redirect('/');
    }
  }

  // Extract company slugs from clients
  const clientCompanies = clientsData.map(c => {
    const company = Array.isArray(c.companies) ? c.companies[0] : c.companies;
    return company as { id: string; slug: string; name: string } | null;
  }).filter(Boolean) as { id: string; slug: string; name: string }[];

  // Get company from custom domain or subdomain
  let targetCompanySlug: string | null = null;
  
  // Try custom domain
  const { data: settings } = await supabase
    .from('website_settings')
    .select('company_id, companies!inner(slug)')
    .eq('custom_domain', hostWithoutPort)
    .single();

  const typedSettings5 = settings as { company_id?: string; companies?: { slug: string } | { slug: string }[] } | null;
  if (typedSettings5?.companies) {
    const companies = Array.isArray(typedSettings5.companies) ? typedSettings5.companies : [typedSettings5.companies];
    const company = companies[0] as { slug: string } | undefined;
    
    // Check if user is a client of this company
    const isClientOfThisCompany = clientCompanies.some(c => c.slug === company?.slug);
    
    if (isClientOfThisCompany && company?.slug) {
      targetCompanySlug = company.slug;
    }
  }
  
  // If no custom domain match, try subdomain
  if (!targetCompanySlug && hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      const subdomain = parts[0];
      const isClientOfSubdomain = clientCompanies.some(c => c.slug === subdomain);
      
      if (isClientOfSubdomain) {
        targetCompanySlug = subdomain;
      }
    }
  }
  
  // If still no match (e.g., accessing /dashboard-client directly on localhost:3000),
  // use the first client's company
  if (!targetCompanySlug && clientCompanies.length > 0) {
    targetCompanySlug = clientCompanies[0].slug;
  }

  if (targetCompanySlug) {
    redirect(`/client/${targetCompanySlug}`);
  } else {
    // Fallback - should not reach here if user has clients
    redirect('/');
  }
}








