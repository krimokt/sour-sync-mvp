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
  created_at: string;
  updated_at: string;
}

// Profile type matching the Supabase schema
export interface Profile {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

interface StoreContextType {
  company: Company | null;
  profile: Profile | null;
  isOwner: boolean;
  isAdmin: boolean;
  canManage: boolean; // owner or admin
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
  company: Company | null;
  profile: Profile | null;
}

export function StoreProvider({ children, company, profile }: StoreProviderProps) {
  const isOwner = profile?.role === 'owner';
  const isAdmin = profile?.role === 'admin';
  const canManage = isOwner || isAdmin;

  return (
    <StoreContext.Provider 
      value={{ 
        company, 
        profile, 
        isOwner, 
        isAdmin, 
        canManage 
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Helper hook to get just the company
export function useCompany() {
  const { company } = useStore();
  if (!company) {
    throw new Error('No company found in context');
  }
  return company;
}

// Helper hook to get just the profile
export function useProfile() {
  const { profile } = useStore();
  if (!profile) {
    throw new Error('No profile found in context');
  }
  return profile;
}


