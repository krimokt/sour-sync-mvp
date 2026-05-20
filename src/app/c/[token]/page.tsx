'use client';

import { useState } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import QuotationFormModalWithToken from '@/components/quotation/QuotationFormModalWithToken';
import { FileText, CreditCard, Truck, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function PortalHomePage() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const router = useRouter();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Welcome section */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Good {timeOfDay}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">
            {data.clientName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm max-w-md">
            Your {data.companyName} portal. Manage quotations, track payments and monitor shipments.
          </p>
        </div>

        {/* Create quotation CTA */}
        {data.scopes.includes('create') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full text-left bg-[#06b6d4] rounded-2xl p-6 group transition-colors hover:bg-[#0891b2] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold text-base">
                    New Quotation Request
                  </span>
                </div>
                <p className="text-cyan-50/75 text-sm">
                  Request pricing for sourcing, manufacturing or shipping
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
            </div>
          </button>
        )}

        {/* Portal sections */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
            Your portal
          </h2>

          <div className="space-y-2">
            {data.scopes.includes('view') && (
              <Link
                href={`${basePath}/quotations`}
                className="group flex items-center gap-4 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Quotations
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Browse and review your quotation requests
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )}

            {data.scopes.includes('pay') && (
              <Link
                href={`${basePath}/payments`}
                className="group flex items-center gap-4 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Payments
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    View payment history and pending transactions
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )}

            {data.scopes.includes('track') && (
              <Link
                href={`${basePath}/shipping`}
                className="group flex items-center gap-4 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Shipping
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Track shipments and delivery status
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <QuotationFormModalWithToken
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        token={token}
        allowedCountries={data.quotationCountries || []}
        onSuccess={() => {
          setIsCreateOpen(false);
          setTimeout(() => router.push(`${basePath}/quotations`), 1500);
        }}
      />
    </div>
  );
}
