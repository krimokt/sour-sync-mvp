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
  
  // Check authentication and get user profile for RLS
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch Clients - try with user_id foreign key
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select(`
      *,
      profiles!user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('company_id', typedCompany.id)
    .order('created_at', { ascending: false });

  if (clientsError) {
    console.error('Error fetching clients:', clientsError);
    console.error('User authenticated:', !!user);
    if (user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single();
      console.error('User profile:', userProfile);
    }
  }

  // Log clients for debugging
  console.log('Clients fetched:', clients?.length || 0, 'clients');

  const typedClients = (clients || []) as Array<{
    id: string;
    company_name?: string | null;
    tax_id?: string | null;
    status?: string | null;
    created_at?: string;
    [key: string]: unknown;
    profiles?: {
      full_name?: string | null;
      email?: string | null;
      avatar_url?: string | null;
    } | null;
  }>;

  return <ClientsPageClient clients={typedClients} companySlug={params.companySlug} />;
}

