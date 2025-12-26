import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ClientProvider, Company, Profile, Client } from '@/context/ClientContext';
import ClientLayoutClient from './ClientLayoutClient';

interface ClientLayoutProps {
  children: React.ReactNode;
  params: { companySlug: string };
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { companySlug } = params;
  const supabase = createServerSupabaseClient();

  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to site with login prompt
    redirect(`/site/${companySlug}?login=true`);
  }

  // 2. Get company by slug
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', companySlug)
    .single();

  if (companyError || !company) {
    console.error('Company not found:', companySlug);
    notFound();
  }

  // Type assertion after null check
  const companyData = company as Company;

  // 3. Check if user is a client of this company
  // Use service role to bypass RLS for this check (user is authenticated, just verifying client status)
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: client, error: clientError } = await supabaseService
    .from('clients')
    .select('*')
    .eq('company_id', companyData.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (clientError || !client) {
    // User is not a client of this company
    redirect(`/site/${companySlug}?error=not_authorized`);
  }

  // 4. Get user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // User has no profile - redirect to complete setup
    redirect('/signup?step=profile');
  }

  // 5. All checks passed - render the client layout
  return (
    <ClientProvider 
      company={companyData} 
      profile={profile as Profile}
      client={client as Client}
    >
      <ClientLayoutClient companySlug={companySlug}>
        {children}
      </ClientLayoutClient>
    </ClientProvider>
  );
}














