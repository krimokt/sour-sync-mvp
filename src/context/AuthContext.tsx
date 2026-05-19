'use client';

import { User, AuthError } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Company, Profile } from './StoreContext';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError; companySlug?: string } | { companySlug: string } | undefined>;
  signUp: (email: string, password: string, fullName: string, companyName: string, companySlug: string) => Promise<{ error: AuthError } | { companySlug: string } | undefined>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const CACHE_KEY = 'ss_auth_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface AuthCache {
  userId: string;
  profile: Profile;
  company: Company | null;
  cachedAt: number;
}

function readCache(userId: string): AuthCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: AuthCache = JSON.parse(raw);
    if (cache.userId !== userId) return null;
    if (Date.now() - cache.cachedAt > CACHE_TTL) return null;
    return cache;
  } catch { return null; }
}

function writeCache(userId: string, profile: Profile, company: Company | null) {
  try {
    const cache: AuthCache = { userId, profile, company, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore storage errors */ }
}

function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Single joined query — profiles + company in one round trip, no redundant getSession()
  const fetchProfileAndCompany = async (userId: string) => {
    // Serve from cache immediately if fresh
    const cached = readCache(userId);
    if (cached) {
      setProfile(cached.profile);
      setCompany(cached.company);
      // Revalidate in background without blocking render
      fetchProfileAndCompany_network(userId);
      return;
    }
    await fetchProfileAndCompany_network(userId);
  };

  const fetchProfileAndCompany_network = async (userId: string) => {
    try {
      // One query: profile joined with company — eliminates the sequential waterfall
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies(*)')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile(null);
        setCompany(null);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { company: companyData, ...profileData } = data as any;
      const profile = profileData as Profile;
      const company = (companyData && !Array.isArray(companyData)) ? companyData as Company : null;

      setProfile(profile);
      setCompany(company);
      writeCache(userId, profile, company);
    } catch (error) {
      console.error('Error fetching profile and company:', error);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndCompany(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfileAndCompany(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setCompany(null);
        }
      } catch (error) {
        console.error('AuthContext error:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setCompany(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes — only act on SIGNED_OUT to avoid
    // duplicate profile fetches already handled by getSession() above
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setCompany(null);
          clearCache();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error: error as AuthError };
      }

      if (!data.user) {
        return { error: { message: 'Sign in failed', name: 'SignInError', status: 400 } as AuthError };
      }

      // Fetch profile and company
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', data.user.id)
        .single();

      const typedProfileData2 = profileData as { company_id?: string | null; [key: string]: unknown } | null;
      if (!typedProfileData2?.company_id) {
        return { error: { message: 'No company found. Please complete setup.', name: 'NoCompanyError', status: 404 } as AuthError };
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('slug')
        .eq('id', typedProfileData2.company_id)
        .single();

      const typedCompanyData = companyData as { slug?: string } | null;
      if (!typedCompanyData?.slug) {
        return { error: { message: 'Company not found', name: 'CompanyNotFound', status: 404 } as AuthError };
      }

      return { companySlug: typedCompanyData.slug };

    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string, companySlug: string) => {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        return { error: authError as AuthError };
      }

      if (!authData.user) {
        return { error: { message: 'Failed to create account', name: 'SignUpError', status: 400 } as AuthError };
      }

      const userId = authData.user.id;

      // Step 2: Create company
      const { data: companyData, error: companyError } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('companies') as any
      )
        .insert({
          name: companyName,
          slug: companySlug,
          owner_id: userId,
          plan: 'starter',
          status: 'active',
        })
        .select()
        .single();

      if (companyError) {
        return { error: { message: 'Failed to create company: ' + companyError.message, name: 'CompanyError', status: 400 } as AuthError };
      }

      // Step 3: Create profile
      const { error: profileError } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('profiles') as any
      )
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          role: 'owner',
          company_id: companyData.id,
        });

      if (profileError) {
        return { error: { message: 'Failed to create profile: ' + profileError.message, name: 'ProfileError', status: 400 } as AuthError };
      }

      return { companySlug };

    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      clearCache();
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setCompany(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, company, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
