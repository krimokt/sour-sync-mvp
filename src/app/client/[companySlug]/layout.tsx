import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ClientProvider, Company, Profile, Client } from '@/context/ClientContext';
import ClientLayoutClient from './ClientLayoutClient';
import ClientAuthProviders from './ClientAuthProviders';

interface ClientLayoutProps {
  children: React.ReactNode;
  params: { companySlug: string };
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { companySlug } = params;
  const supabase = createServerSupabaseClient();

  // Auth check (fast — reads from cookie)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/site/${companySlug}?login=true`);
  }

  // Run company + client(+profile joined) queries in parallel
  const [
    { data: company, error: companyError },
    { data: clientWithProfile, error: clientError },
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('slug', companySlug).single(),
    supabase
      .from('clients')
      .select('*, profile:profiles(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single(),
  ]);

  if (companyError || !company) {
    notFound();
  }

  const companyData = company as Company;

  // Verify client belongs to this company
  if (clientError || !clientWithProfile) {
    redirect(`/site/${companySlug}?error=not_authorized`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { profile: profileData, ...clientData } = clientWithProfile as any;

  if ((clientData as { company_id?: string }).company_id !== companyData.id) {
    redirect(`/site/${companySlug}?error=not_authorized`);
  }

  if (!profileData) {
    redirect('/signup?step=profile');
  }

  return (
    <ClientAuthProviders>
      <ClientProvider
        company={companyData}
        profile={profileData as Profile}
        client={clientData as Client}
      >
        <ClientLayoutClient companySlug={companySlug}>
          {children}
        </ClientLayoutClient>
      </ClientProvider>
    </ClientAuthProviders>
  );
}
