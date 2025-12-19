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
  
  // Fetch Clients
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      profile:profiles!user_id (first_name, last_name, email, avatar_url)
    `)
    .eq('company_id', typedCompany.id)
    .order('created_at', { ascending: false });

  const typedClients = (clients || []) as Array<{
    id: string;
    company_name?: string | null;
    tax_id?: string | null;
    status?: string | null;
    created_at?: string;
    [key: string]: unknown;
    profile?: {
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      avatar_url?: string | null;
    } | null;
  }>;

  return <ClientsPageClient clients={typedClients} companySlug={params.companySlug} />;
}

