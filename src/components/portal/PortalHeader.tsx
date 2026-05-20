'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useMagicLink } from './MagicLinkProvider';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import QuotationFormModalWithToken from '@/components/quotation/QuotationFormModalWithToken';

export default function PortalHeader() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const token = pathname?.split('/')[2] || '';
  const company = data.company as { name?: string; logo_url?: string | null } | undefined;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/96 dark:bg-gray-950/96 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo + name */}
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
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {company?.name || 'Client Portal'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
                Client Portal
              </p>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Client chip */}
            {data.clientName && (
              <div className="hidden md:flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full pl-1.5 pr-3 py-1">
                <div className="w-5 h-5 rounded-full bg-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] text-[10px] font-bold shrink-0">
                  {data.clientName[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 max-w-[90px] truncate">
                  {data.clientName}
                </span>
              </div>
            )}

            {/* New Quote button — always shown when create scope is available */}
            {data.scopes.includes('create') && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Quote</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {data.scopes.includes('create') && (
        <QuotationFormModalWithToken
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          token={token}
          allowedCountries={data.quotationCountries || []}
          onSuccess={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}
