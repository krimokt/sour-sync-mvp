'use client';

import Checkbox from '@/components/form/input/Checkbox';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const router = useRouter();

  // Auto-generate slug when company name changes (unless manually edited)
  useEffect(() => {
    if (!slugEdited && companyName) {
      setCompanySlug(generateSlug(companyName));
    }
  }, [companyName, slugEdited]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!companySlug || companySlug.length < 3) {
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
  }, [companySlug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setCompanySlug(generateSlug(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validation
    if (!fullName || !email || !password || !companyName || !companySlug) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (companySlug.length < 3) {
      setError('Company URL must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (!isChecked) {
      setError('Please agree to the Terms and Conditions');
      setIsLoading(false);
      return;
    }

    if (slugAvailable === false) {
      setError('This company URL is already taken. Please choose another.');
      setIsLoading(false);
      return;
    }

    try {
      // Use API route for more reliable sign-up process
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        console.error('Signup API error:', result);
        throw new Error(result.error || 'Failed to create account');
      }

      console.log('Signup successful:', result);

      // Check if email confirmation is required
      if (result.requiresEmailConfirmation) {
        setSuccessMessage(
          'Account created! Please check your email to confirm your account before signing in.'
        );
        // Redirect to sign in page
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
        return;
      }

      // Success! Redirect to company dashboard
      setSuccessMessage(
        'Account created successfully! Redirecting to your dashboard...'
      );

      // Redirect to company dashboard
      setTimeout(() => {
        router.push(`/store/${companySlug}`);
      }, 1500);

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create Your Store
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set up your SourSync account and start managing your sourcing business
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <Label>
                  Full Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-gray-500 bg-white dark:bg-gray-900">
                    Company Information
                  </span>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <Label>
                  Company / Store Name<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="e.g., Yifan Trading Co."
                  onChange={(e) => setCompanyName(e.target.value)}
                  value={companyName}
                  required
                />
              </div>

              {/* Company Slug (URL) */}
              <div>
                <Label>
                  Store URL<span className="text-error-500">*</span>
                </Label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-2.5 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                    soursync.com/store/
                  </span>
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      id="companySlug"
                      name="companySlug"
                      placeholder="your-company-name"
                      onChange={handleSlugChange}
                      value={companySlug}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>
                {/* Slug availability indicator */}
                {companySlug.length >= 3 && (
                  <div className="mt-1 text-sm">
                    {checkingSlug ? (
                      <span className="text-gray-500">Checking availability...</span>
                    ) : slugAvailable === true ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ This URL is available
                      </span>
                    ) : slugAvailable === false ? (
                      <span className="text-red-600 dark:text-red-400">
                        ✗ This URL is already taken
                      </span>
                    ) : null}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This will be your store&apos;s URL. You can change it later in settings.
                </p>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  By creating an account you agree to the{' '}
                  <span className="text-gray-800 dark:text-white/90">
                    Terms and Conditions
                  </span>
                  , and our{' '}
                  <span className="text-gray-800 dark:text-white">
                    Privacy Policy
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  disabled={isLoading || slugAvailable === false}
                  className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 ${
                    isLoading || slugAvailable === false
                      ? 'opacity-70 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isLoading ? 'Creating Your Store...' : 'Create Store'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
