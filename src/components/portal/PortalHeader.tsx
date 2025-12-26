'use client';

import Image from 'next/image';
import { useMagicLink } from './MagicLinkProvider';
import { usePathname } from 'next/navigation';
import CreateQuotationButton from '@/app/c/[token]/quotations/CreateQuotationButton';

export default function PortalHeader() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const token = pathname?.split('/')[2] || '';
  const company = data.company as { name?: string; logo_url?: string | null } | undefined;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name || 'Company'}
                width={40}
                height={40}
                className="rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                {(company?.name?.[0] || 'C').toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {company?.name || 'Client Portal'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {data.clientName}
              </p>
            </div>
          </div>
          {data.scopes.includes('create') && token && (
            <div className="flex items-center">
              <CreateQuotationButton token={token} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


