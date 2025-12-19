'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_settings: {
    theme_color?: string;
  } | null;
}

interface ClientSignInPageProps {
  params: { companySlug: string };
}

export default function ClientSignInPage({ params }: ClientSignInPageProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [companyLoadError, setCompanyLoadError] = useState('');

  // Update mode when search param changes
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    } else {
      setMode('signin');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setCompanyLoadError('');
        const apiUrl = `/api/public/company/${params.companySlug}`;
        console.log('[Signin] Fetching company from:', apiUrl);
        
        const res = await fetch(apiUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[Signin] API response status:', res.status, res.statusText);

        // Check if response is ok before parsing JSON
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = 'Failed to load company';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            // If JSON parsing fails, use the text or default message
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const json = await res.json();

        if (!json?.company) {
          throw new Error(json?.error || 'Company data not found');
        }

        const data = json.company as Company;
        setCompany(data);

        const settings = Array.isArray(data.website_settings)
          ? data.website_settings[0]
          : data.website_settings;
        if (settings?.primary_color) {
          setThemeColor(settings.primary_color);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Company fetch error details:', errorMessage);
        setCompanyLoadError(
          'Unable to load company branding. You can still sign in / sign up.'
        );
        // Fallback so we don't show an infinite spinner
        setCompany({
          id: '',
          name: params.companySlug,
          slug: params.companySlug,
          logo_url: null,
          website_settings: null,
        });
      }
    };

    fetchCompany();
  }, [params.companySlug]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/client/${params.companySlug}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, it's likely an HTML error page (404, 500, etc.)
        const text = await response.text();
        console.error('Non-JSON response from API:', text.substring(0, 200));
        throw new Error('API route not found. Please check your deployment configuration.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success - redirect to client dashboard
      // The API sets cookies, so we use a full page reload to ensure cookies are sent
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isCustomDomain = !hostname.includes('localhost') && 
                               !hostname.includes('soursync.com') && 
                               !hostname.includes('netlify.app');
        const isLocalhostSubdomain =
          hostname.includes('localhost') &&
          hostname.split('.').length > 1 &&
          hostname !== 'localhost';
        
        if (isCustomDomain || isLocalhostSubdomain) {
          // For custom domain, redirect to /dashboard-client
          window.location.href = '/dashboard-client';
        } else {
          // For localhost/subdomain, redirect directly to client dashboard
          window.location.href = `/client/${params.companySlug}`;
        }
      } else {
        // Fallback if window is not available (shouldn't happen in client component)
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!fullName || !email || !password || !companyName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/client/${params.companySlug}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          fullName, 
          companyName 
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, it's likely an HTML error page (404, 500, etc.)
        const text = await response.text();
        console.error('Non-JSON response from API:', text.substring(0, 200));
        throw new Error('API route not found. Please check your deployment configuration.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Auto login after signup
      try {
        const loginResponse = await fetch(`/api/client/${params.companySlug}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        // Check if response is JSON before parsing
        const loginContentType = loginResponse.headers.get('content-type');
        
        if (loginContentType && loginContentType.includes('application/json')) {
          // Parse JSON to ensure valid response, but we don't need the data
          await loginResponse.json();
        } else {
          // If not JSON, it's likely an HTML error page
          const text = await loginResponse.text();
          console.error('Non-JSON response from login API:', text.substring(0, 200));
          throw new Error('API route not found. Please check your deployment configuration.');
        }

        if (!loginResponse.ok) {
          // Signup succeeded but login failed - user can manually login
          setError('Account created successfully! Please sign in.');
          setIsLoading(false);
          setMode('signin');
          // Clear password for security
          setPassword('');
          return;
        }

        // Success - redirect to client dashboard
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const isCustomDomain = !hostname.includes('localhost') && 
                                 !hostname.includes('soursync.com') && 
                                 !hostname.includes('netlify.app');
          const isLocalhostSubdomain =
            hostname.includes('localhost') &&
            hostname.split('.').length > 1 &&
            hostname !== 'localhost';
          
          if (isCustomDomain || isLocalhostSubdomain) {
            // For custom domain, redirect to /dashboard-client
            window.location.href = '/dashboard-client';
          } else {
            // For localhost/subdomain, redirect directly to client dashboard
            window.location.href = `/client/${params.companySlug}`;
          }
        }
      } catch (loginErr) {
        // Login failed but signup succeeded
        console.error('Auto-login error:', loginErr);
        setError('Account created successfully! Please sign in.');
        setIsLoading(false);
        setMode('signin');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          {company.logo_url ? (
            <Image
              src={company.logo_url}
              alt={company.name}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-lg"
            />
          ) : (
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: themeColor }}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {company.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new client account'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </div>
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </div>
            </button>
          </div>

          {/* Error Message */}
          {(companyLoadError || error) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {companyLoadError || error}
            </div>
          )}

          {/* Forms */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:text-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to site */}
          <div className="mt-6 text-center">
            <a
              href={`/site/${params.companySlug}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to {company.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}




