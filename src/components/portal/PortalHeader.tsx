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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Company Info */}
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name || 'Company'}
                width={36}
                height={36}
                className="rounded-xl object-cover w-9 h-9"
              />
            ) : (
              <div className="w-9 h-9 bg-[#06b6d4] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(company?.name?.[0] || 'C').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {company?.name || 'Your Company'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Client Portal</p>
            </div>
          </div>

          {/* Right: Greeting + Create Button */}
          <div className="flex items-center gap-3">
            {data.clientName && (
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1.5 border border-gray-100 dark:border-gray-700">
                <div className="w-6 h-6 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {data.clientName[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {data.clientName}
                </span>
              </div>
            )}
            {token && (
              <CreateQuotationButton
                token={token}
                allowedCountries={data.quotationCountries || []}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
