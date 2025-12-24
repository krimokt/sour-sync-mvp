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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch profile and company for a user
  const fetchProfileAndCompany = async (userId: string) => {
    try {
      // Ensure we have a valid session before querying
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session status when fetching profile:', session ? 'Active' : 'None', 'User ID:', userId);
      
      if (!session) {
        console.log('No active session, skipping profile fetch');
        setProfile(null);
        setCompany(null);
        return;
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError.message, profileError.code);
        setProfile(null);
        setCompany(null);
        return;
      }
      
      if (!profileData) {
        console.log('No profile data returned for user:', userId);
        setProfile(null);
        setCompany(null);
        return;
      }

      setProfile(profileData as Profile);

      // Get company if profile has company_id
      const typedProfileData = profileData as { company_id?: string | null; [key: string]: unknown } | null;
      if (typedProfileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', typedProfileData.company_id)
          .single();

        if (!companyError && companyData) {
          setCompany(companyData as Company);
        }
      }
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
        console.log('AuthContext: Getting session...');
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthContext: Session result -', session ? 'Found' : 'None');

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          console.log('AuthContext: Fetching profile for user...');
          await fetchProfileAndCompany(session.user.id);
          console.log('AuthContext: Profile fetch complete');
        } else {
          setUser(null);
          setProfile(null);
          setCompany(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setCompany(null);
        }
      } finally {
        if (isMounted) {
          console.log('AuthContext: Setting loading to false');
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        // Only handle SIGNED_IN if we don't already have a user
        // (to avoid duplicate profile fetches with getSession)
        if (event === 'SIGNED_IN' && session?.user) {
          // Don't call fetchProfile again if getSession already did it
          // The initial getSession handles the first load
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setCompany(null);
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
