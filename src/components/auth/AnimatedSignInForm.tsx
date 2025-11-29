'use client';

import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
} from '@/components/ui/modern-animated-sign-in';
import Image from 'next/image';
import { 
  Truck, 
  Plane, 
  Globe, 
  Package, 
  FileText, 
  ShoppingBag,
  LayoutDashboard
} from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

interface OrbitIcon {
  component: () => ReactNode;
  className: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
  pathColor?: string;
}

const BRAND_CYAN = '#06b6d4';
const BRAND_BLUE = '#0f7aff';

const iconsArray: OrbitIcon[] = [
  // Logistics Icons
  {
    component: () => <Truck className="size-8 text-[#06b6d4]" />,
    className: 'size-[50px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <Globe className="size-8 text-[#0f7aff]" />,
    className: 'size-[50px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  // Tech/Dashboard Icons
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg'
        alt='React'
      />
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 210,
    duration: 25,
    path: false,
    reverse: false,
    pathColor: BRAND_CYAN,
  },
  {
    component: () => <Package className="size-10 text-[#06b6d4]" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 210,
    duration: 25,
    delay: 20,
    path: false,
    reverse: false,
  },
  // More Logistics
  {
    component: () => <Plane className="size-8 text-[#0f7aff]" />,
    className: 'size-[50px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
    pathColor: BRAND_BLUE,
  },
  {
    component: () => <FileText className="size-8 text-[#06b6d4]" />,
    className: 'size-[50px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  // Outer Circle
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg'
        alt='Nextjs'
      />
    ),
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 30,
    path: false,
    reverse: true,
    pathColor: BRAND_CYAN,
  },
  {
    component: () => <LayoutDashboard className="size-12 text-[#0f7aff]" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 270,
    duration: 30,
    delay: 60,
    path: false,
    reverse: true,
  },
  {
    component: () => <ShoppingBag className="size-12 text-[#06b6d4]" />,
    className: 'size-[60px] border-none bg-transparent',
    radius: 320,
    duration: 35,
    delay: 20,
    path: false,
    reverse: false,
    pathColor: BRAND_BLUE,
  },
];

export default function AnimatedSignInForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const goToForgotPassword = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    router.push('/reset-password');
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof FormData
  ) => {
    const value = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Sign in failed');
      }

      // Wait a moment for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Get user's profile to find their company
      console.log('Fetching profile for user:', authData.user.id);
      
      // Re-get the session to ensure we have a valid token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'Valid' : 'None');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', authData.user.id)
        .single();

      console.log('Profile result:', { profile, profileError });

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Could not load your profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Profile not found. Please contact support.');
      }

      if (!profile.company_id) {
        // User has profile but no company - redirect to create one
        router.push('/signup?step=company');
        return;
      }

      // Step 3: Get company slug
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('slug, status')
        .eq('id', profile.company_id)
        .single();

      if (companyError || !company) {
        throw new Error('Could not find your company');
      }

      // Check if company is active
      if (company.status !== 'active') {
        setError('Your company account is suspended. Please contact support.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Step 4: Redirect to company dashboard
      // If there was a redirect URL and it's for the same company, use it
      if (redirectTo && redirectTo.startsWith(`/store/${company.slug}`)) {
        window.location.href = redirectTo;
      } else {
        window.location.href = `/store/${company.slug}`;
      }

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your Soursync account',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: isLoading ? 'Signing in...' : 'Sign in',
    textVariantButton: 'Forgot password?',
  };

  return (
    <section className='flex max-lg:justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30'>
      {/* Left Side */}
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative overflow-hidden'>
        <Ripple mainCircleSize={100} circleColor="rgba(6, 182, 212, 0.2)" />
        <TechOrbitDisplay 
          iconsArray={iconsArray} 
          centerContent={
            <div className="relative w-48 h-16 animate-pulse">
              <Image 
                src="/images/logo/soursync-logo.svg" 
                alt="Soursync Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          }
        />
      </span>

      {/* Right Side */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]'>
        <AuthTabs
          formFields={{
            ...formFields,
            errorField: error,
          }}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
        />
      </span>
    </section>
  );
}
