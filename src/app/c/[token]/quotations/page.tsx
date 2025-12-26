'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import QuotationCard from '@/components/portal/QuotationCard';
import CreateQuotationButton from './CreateQuotationButton';
import { Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quotations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Quotations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No quotations found</p>
            {data.scopes.includes('create') && (
              <CreateQuotationButton 
                token={token} 
                onSuccess={fetchQuotations}
                allowedCountries={data.quotationCountries || []}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
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

