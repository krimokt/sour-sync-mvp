'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SignInPage, Testimonial, AuthMode } from '@/components/ui/sign-in';

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Elena Rodriguez",
    handle: "@elenalogistics",
    text: "Soursync streamlined our entire procurement process. The dashboard is intuitive and saves us hours every week."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "James Chen",
    handle: "@chensupply",
    text: "Finally, a platform that understands sourcing. From quotation to delivery, everything is tracked perfectly."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Sarah Miller",
    handle: "@sarahimport",
    text: "The best investment for our logistics business. The custom domain feature makes us look so professional."
  },
];

// Generate URL-friendly slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit length
}

interface GlassAuthFormProps {
  initialMode?: AuthMode;
}

export default function GlassAuthForm({ initialMode = 'signin' }: GlassAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  
  // Signup State
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Auto-generate slug when company name changes
  useEffect(() => {
    if (mode === 'signup' && !slugEdited && companyName) {
      setCompanySlug(generateSlug(companyName));
    }
  }, [companyName, slugEdited, mode]);

  // Check slug availability
  useEffect(() => {
    if (mode !== 'signup' || !companySlug || companySlug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const checkSlug = async () => {
      setCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', companySlug)
          .maybeSingle();

        if (error) {
          console.error('Error checking slug:', error);
          setSlugAvailable(null);
        } else {
          setSlugAvailable(data === null); // Available if no data returned
        }
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    };

    const debounceTimer = setTimeout(checkSlug, 500);
    return () => clearTimeout(debounceTimer);
  }, [companySlug, mode]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setCompanySlug(generateSlug(e.target.value));
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Sign in failed');

      // Step 2: Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw new Error(`Could not load your profile: ${profileError.message}`);
      if (!profile?.company_id) {
        // If no company, switch to signup or guide them
        setMode('signup'); 
        // Or redirect to onboarding step
        return;
      }

      // Step 3: Get company slug
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('slug, status')
        .eq('id', profile.company_id)
        .single();

      if (companyError || !company) throw new Error('Could not find your company');
      
      if (company.status !== 'active') {
        await supabase.auth.signOut();
        alert('Your company account is suspended. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Step 4: Redirect
      if (redirectTo && redirectTo.startsWith(`/store/${company.slug}`)) {
        window.location.href = redirectTo;
      } else {
        window.location.href = `/store/${company.slug}`;
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    
    // Validation
    if (!fullName || !email || !password || !companyName || !companySlug) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (slugAvailable === false) {
      alert('This URL is already taken');
      setIsLoading(false);
      return;
    }

    try {
      // Use API route for sign-up process
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          companyName,
          companySlug,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      // Success
      if (result.requiresEmailConfirmation) {
        alert('Account created! Please check your email to confirm your account.');
        setMode('signin');
      } else {
        // Auto login or redirect
        alert('Account created successfully! Redirecting...');
        // Use the slug we just created
        window.location.href = `/store/${companySlug}`;
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    if (mode === 'signin') {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      if (!email || !password) {
        alert('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      
      await handleSignIn(email, password);
    } else {
      // We need to update the companyName state if it wasn't updated via change handler (autofill)
      // But controlled inputs handle this.
      await handleSignUp(formData);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign In clicked");
    // Add Supabase Google Auth logic
  };

  const handleResetPassword = () => {
    router.push('/reset-password');
  };

  return (
    <SignInPage
      mode={mode}
      heroImageSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" // Warehouse/Logistics image
      testimonials={testimonials}
      isLoading={isLoading}
      
      slugAvailable={slugAvailable}
      checkingSlug={checkingSlug}
      companySlug={companySlug}

      onSubmit={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onModeChange={setMode}
      onSlugChange={(e) => {
        if (mode === 'signup') {
          if (e.target.name === 'companyName') setCompanyName(e.target.value); // Capture this one too if passed
          if (e.target.name === 'companySlug') handleSlugChange(e);
        }
      }}
    />
  );
}


