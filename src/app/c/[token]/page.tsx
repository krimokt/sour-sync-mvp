'use client';

import { useState } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import QuotationFormModalWithToken from '@/components/quotation/QuotationFormModalWithToken';
import { FileText, CreditCard, Truck, Plus, ShieldCheck } from 'lucide-react';
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
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Welcome Hero */}
        <div className="mb-8">
          <span className="text-sm text-gray-400">{greeting}</span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
            Welcome back, {data.clientName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your orders, track shipments and review quotes.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {data.scopes.includes('create') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-[#06b6d4]/30 transition-all group cursor-pointer w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-[#06b6d4]" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Create Quotation</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Request pricing for new products</p>
              <p className="text-[#06b6d4] text-sm font-medium mt-4">Create Quote →</p>
            </button>
          )}

          {data.scopes.includes('view') && (
            <Link
              href={`${basePath}/quotations`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-[#06b6d4]/30 transition-all group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">View Quotations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">See all your quotation requests</p>
              <p className="text-[#06b6d4] text-sm font-medium mt-4">View &rarr;</p>
            </Link>
          )}

          {data.scopes.includes('pay') && (
            <Link
              href={`${basePath}/payments`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-[#06b6d4]/30 transition-all group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Payments</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and make payments</p>
              <p className="text-[#06b6d4] text-sm font-medium mt-4">View &rarr;</p>
            </Link>
          )}

          {data.scopes.includes('track') && (
            <Link
              href={`${basePath}/shipping`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-[#06b6d4]/30 transition-all group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Track Shipments</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor your shipments in real-time</p>
              <p className="text-[#06b6d4] text-sm font-medium mt-4">View &rarr;</p>
            </Link>
          )}
        </div>

        {/* Quick Info Strip */}
        <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your portal is secure and always up-to-date.
          </p>
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
