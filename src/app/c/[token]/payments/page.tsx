'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import PaymentCard from '@/components/portal/PaymentCard';
import { usePathname } from 'next/navigation';
import { Loader2, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

interface Payment {
  id: string;
  amount?: number;
  status?: string;
  payment_method?: string;
  currency?: string;
  created_at?: string;
  payment_quotations?: Array<{
    quotation_id: string;
    quotations?: {
      id: string;
      quotation_id?: string;
      product_name?: string;
    };
  }>;
}

export default function PaymentsPage() {
  const pathname = usePathname();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/c/${token}/payments`);

      // Read response as text first to handle empty responses
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Failed to fetch payments';
        try {
          if (responseText && responseText.trim()) {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.error || errorMessage;
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch {
          errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Check if response has content before parsing
      if (!responseText || !responseText.trim()) {
        // Empty response, return empty array
        setPayments([]);
        return;
      }

      // Parse JSON response
      try {
        const result = JSON.parse(responseText);
        setPayments(result.payments || []);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]); // Set empty array on error to prevent UI issues
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const pendingPayments = payments.filter((p) =>
    (p.status || '').toLowerCase() === 'pending'
  );
  const completedPayments = payments.filter((p) =>
    ['completed', 'accepted'].includes((p.status || '').toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View and manage your payment history
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-[#06b6d4]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">No payments yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Payments will appear here once you proceed to checkout on an approved quotation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingPayments.length > 0 && (
              <div>
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pending Payments</h3>
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                    {pendingPayments.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      basePath={basePath}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedPayments.length > 0 && (
              <div>
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payment History</h3>
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    {completedPayments.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {completedPayments.map((payment) => (
                    <PaymentCard
                      key={payment.id}
                      payment={payment}
                      basePath={basePath}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
