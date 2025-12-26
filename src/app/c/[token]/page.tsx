'use client';

import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import CreateQuotationButton from './quotations/CreateQuotationButton';
import { FileText, CreditCard, Truck, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalHomePage() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {data.clientName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your quotations, payments, and shipments from this portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.scopes.includes('create') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Quotation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Request a new quotation</p>
                </div>
              </div>
              <CreateQuotationButton token={token} />
            </div>
          )}

          {data.scopes.includes('view') && (
            <Link
              href={`${basePath}/quotations`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Quotations</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">See all your quotations</p>
                </div>
              </div>
            </Link>
          )}

          {data.scopes.includes('pay') && (
            <Link
              href={`${basePath}/payments`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Payments</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View and make payments</p>
                </div>
              </div>
            </Link>
          )}

          {data.scopes.includes('track') && (
            <Link
              href={`${basePath}/shipping`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Track Shipments</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your shipments</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your recent quotations, payments, and shipments will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}


