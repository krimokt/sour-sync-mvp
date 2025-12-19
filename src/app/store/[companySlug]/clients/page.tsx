import { createServerSupabaseClient } from '@/lib/supabase-server';
import ClientsPageClient from './ClientsPageClient';

export default async function ClientsPage({ params }: { params: { companySlug: string } }) {
  const supabase = createServerSupabaseClient();
  
  // Get Company ID
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', params.companySlug)
    .single();

  const typedCompany = company as { id: string } | null;
  if (!typedCompany) return <div>Company not found</div>;
  
  // Fetch Clients first (without join since there's no direct FK relationship)
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', typedCompany.id)
    .order('created_at', { ascending: false });

  if (clientsError) {
    console.error('Error fetching clients:', clientsError);
    return <ClientsPageClient clients={[]} companySlug={params.companySlug} />;
  }

  // Fetch profiles for all client user_ids
  const userIds = (clients || [])
    .map((c) => c.user_id)
    .filter((id): id is string => !!id);

  let profilesMap: Record<string, { full_name?: string | null; email?: string | null; avatar_url?: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);

    if (profiles) {
      profiles.forEach((profile) => {
        profilesMap[profile.id] = {
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
        };
      });
    }
  }

  // Combine clients with their profiles
  const typedClients = (clients || []).map((client) => ({
    ...client,
    profiles: client.user_id ? profilesMap[client.user_id] || null : null,
  })) as Array<{
    id: string;
    company_name?: string | null;
    tax_id?: string | null;
    status?: string | null;
    created_at?: string;
    user_id?: string | null;
    [key: string]: unknown;
    profiles?: {
      full_name?: string | null;
      email?: string | null;
      avatar_url?: string | null;
    } | null;
  }>;

  return <ClientsPageClient clients={typedClients} companySlug={params.companySlug} />;
}

