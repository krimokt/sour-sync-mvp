import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    redirect('/select-store');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('slug')
    .eq('id', (profile as { company_id: string }).company_id)
    .single();

  if ((company as { slug?: string } | null)?.slug) {
    redirect(`/store/${(company as { slug: string }).slug}`);
  }

  redirect('/select-store');
}
