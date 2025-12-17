import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { StoreProvider, Company, Profile } from '@/context/StoreContext';
import StoreLayoutClient from './StoreLayoutClient';

interface StoreLayoutProps {
  children: React.ReactNode;
  params: { companySlug: string };
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { companySlug } = params;
  const supabase = createServerSupabaseClient();

  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to sign in with return URL
    redirect(`/signin?redirect=/store/${companySlug}`);
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

  // 3. Get user's profile and verify they belong to this company
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // User has no profile - redirect to complete setup
    redirect('/signup?step=profile');
  }

  // 4. Verify user belongs to this company
  if (profile.company_id !== company.id) {
    // User doesn't belong to this company
    // Check if they have any company
    if (profile.company_id) {
      // Get their actual company and redirect there
      const { data: userCompany } = await supabase
        .from('companies')
        .select('slug')
        .eq('id', profile.company_id)
        .single();

      if (userCompany) {
        redirect(`/store/${userCompany.slug}`);
      }
    }
    // No company - redirect to create one
    redirect('/signup?step=company');
  }

  // 5. All checks passed - render the store layout
  return (
    <StoreProvider company={company as Company} profile={profile as Profile}>
      <StoreLayoutClient companySlug={companySlug}>
        {children}
      </StoreLayoutClient>
    </StoreProvider>
  );
}






