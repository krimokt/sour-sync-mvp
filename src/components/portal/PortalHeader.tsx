'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMagicLink } from './MagicLinkProvider';
import { usePathname } from 'next/navigation';
import CreateQuotationButton from '@/app/c/[token]/quotations/CreateQuotationButton';

export default function PortalHeader() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const token = pathname?.split('/')[2] || '';
  const company = data.company as { name?: string; logo_url?: string | null } | undefined;

  return (
    <header className="sticky top-0 z-40 bg-white/96 dark:bg-gray-950/96 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href={`/c/${token}`} className="flex items-center gap-2.5 shrink-0 min-w-0">
          {company?.logo_url ? (
            <Image
              src={company.logo_url}
              alt={company.name || 'Company'}
              width={32}
              height={32}
              className="rounded-lg object-cover w-8 h-8 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-[#06b6d4] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(company?.name?.[0] || 'C').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {company?.name || 'Client Portal'}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
              Client Portal
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {data.clientName && (
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full pl-1.5 pr-3 py-1">
              <div className="w-5 h-5 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {data.clientName[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                {data.clientName}
              </span>
            </div>
          )}
          {token && data.scopes.includes('create') && (
            <CreateQuotationButton
              token={token}
              allowedCountries={data.quotationCountries || []}
            />
          )}
        </div>
      </div>
    </header>
  );
}
