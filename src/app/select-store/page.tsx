'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string;
}

export default function SelectStorePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [companies, _setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noCompany, setNoCompany] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/signin');
          return;
        }

        // Get user's profile(s) with company info
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (!profile?.company_id) {
          // No company - show message to create one
          setNoCompany(true);
          setIsLoading(false);
          return;
        }

        // Get company details
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, slug, logo_url, plan')
          .eq('id', profile.company_id)
          .single();

        if (company) {
          // If only one company, redirect directly
          router.push(`/store/${company.slug}`);
          return;
        } else {
          setNoCompany(true);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setNoCompany(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
          Select a Store
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Choose which store you want to manage
        </p>

        <div className="space-y-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/store/${company.slug}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-colors"
            >
              <div className="flex items-center gap-4">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {company.slug}.soursync.com
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 capitalize">
                  {company.plan}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {(companies.length === 0 || noCompany) && (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg p-8">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No Store Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account isn&apos;t linked to any store yet. Create your first store to get started.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Create Your First Store
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/signin');
              }}
              className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Sign out and try a different account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

