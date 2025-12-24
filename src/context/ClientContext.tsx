'use client';

import { createContext, useContext, ReactNode } from 'react';

// Company type matching the Supabase schema
export interface Company {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  logo_url: string | null;
  country: string | null;
  currency: string;
  timezone: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  custom_domain: string | null;
  quotation_countries?: string[] | null;
  quotation_input_fields?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Client type
export interface Client {
  id: string;
  company_id: string;
  user_id: string;
  status: string;
  company_name: string | null;
  tax_id: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

// Profile type
export interface Profile {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'staff' | null;
  created_at: string;
  updated_at: string;
}

interface ClientContextType {
  company: Company | null;
  profile: Profile | null;
  client: Client | null;
  isClient: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
  company: Company | null;
  profile: Profile | null;
  client: Client | null;
}

export function ClientProvider({ children, company, profile, client }: ClientProviderProps) {
  const isClient = !!client;

  return (
    <ClientContext.Provider 
      value={{ 
        company, 
        profile, 
        client,
        isClient
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

// Helper hook to get just the company
export function useClientCompany() {
  const { company } = useClient();
  if (!company) {
    throw new Error('No company found in context');
  }
  return company;
}

// Helper hook to get just the profile
export function useClientProfile() {
  const { profile } = useClient();
  if (!profile) {
    throw new Error('No profile found in context');
  }
  return profile;
}









