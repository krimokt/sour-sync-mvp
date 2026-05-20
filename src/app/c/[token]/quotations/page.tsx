'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import QuotationCard from '@/components/portal/QuotationCard';
import CreateQuotationButton from './CreateQuotationButton';
import { Loader2, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Quotation {
  id: string;
  quotation_id?: string;
  product_name?: string;
  status?: string;
  total_price_option1?: string;
  created_at?: string;
  image_url?: string;
  image_urls?: string[];
}

export default function QuotationsPage() {
  const { data } = useMagicLink();
  const pathname = usePathname();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/c/${token}/quotations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quotations');
      }

      setQuotations(result.quotations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const filteredQuotations = selectedStatus === 'All'
    ? quotations
    : quotations.filter((q) => (q.status || '').toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quotations
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              View and manage your quotation requests
            </p>
          </div>
          {data.scopes.includes('create') && (
            <CreateQuotationButton
              token={token}
              onSuccess={fetchQuotations}
              allowedCountries={data.quotationCountries || []}
            />
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-[#06b6d4] text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#06b6d4]/30'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-[#06b6d4]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">No quotations found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {selectedStatus === 'All'
                ? 'Create your first quotation request to get started.'
                : `No ${selectedStatus.toLowerCase()} quotations at this time.`}
            </p>
            {data.scopes.includes('create') && selectedStatus === 'All' && (
              <CreateQuotationButton
                token={token}
                onSuccess={fetchQuotations}
                allowedCountries={data.quotationCountries || []}
              />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                basePath={basePath}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
