import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Server-side Supabase client for Server Components
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

// Get company by slug
export async function getCompanyBySlug(slug: string) {
  const supabase = createServerSupabaseClient();
  
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return company;
}

// Get current user's profile
export async function getCurrentProfile() {
  const supabase = createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}

// Get current user with their profile and company
export async function getCurrentUserWithCompany() {
  const supabase = createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, profile: null, company: null };
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.company_id) {
    return { user, profile, company: null };
  }

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();

  return { user, profile, company };
}

// Verify user belongs to company
export async function verifyUserBelongsToCompany(companySlug: string) {
  const supabase = createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { authorized: false, reason: 'not_authenticated' };
  }

  // Get company by slug
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', companySlug)
    .single();

  if (!company) {
    return { authorized: false, reason: 'company_not_found' };
  }

  // Check if user's profile is linked to this company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .eq('company_id', company.id)
    .single();

  if (!profile) {
    return { authorized: false, reason: 'not_member' };
  }

  return { authorized: true, role: profile.role };
}




