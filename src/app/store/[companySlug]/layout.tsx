import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { StoreProvider, Company, Profile } from '@/context/StoreContext';
import StoreLayoutClient from './StoreLayoutClient';
import StoreAuthProviders from './StoreAuthProviders';

interface StoreLayoutProps {
  children: React.ReactNode;
  params: { companySlug: string };
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { companySlug } = params;
  const supabase = createServerSupabaseClient();

  // Auth check first (fast — reads from cookie)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/signin?redirect=/store/${companySlug}`);
  }

  // Run company + profile queries in parallel — cuts latency in half vs sequential
  const [{ data: company, error: companyError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase.from('companies').select('*').eq('slug', companySlug).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

  if (companyError || !company) {
    notFound();
  }

  if (profileError || !profile) {
    redirect('/signup?step=profile');
  }

  const typedCompany = company as { id: string; [key: string]: unknown };
  const typedProfile = profile as { company_id?: string | null; [key: string]: unknown };

  // Verify user belongs to this company
  if (typedProfile.company_id !== typedCompany.id) {
    if (typedProfile.company_id) {
      const { data: userCompany } = await supabase
        .from('companies')
        .select('slug')
        .eq('id', typedProfile.company_id)
        .single();

      const slug = (userCompany as { slug: string } | null)?.slug;
      if (slug) redirect(`/store/${slug}`);
    }
    redirect('/signup?step=company');
  }

  return (
    <StoreAuthProviders>
      <StoreProvider company={company as Company} profile={profile as Profile}>
        <StoreLayoutClient companySlug={companySlug}>
          {children}
        </StoreLayoutClient>
      </StoreProvider>
    </StoreAuthProviders>
  );
}
