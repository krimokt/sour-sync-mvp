'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import PaymentCard from '@/components/portal/PaymentCard';
import { usePathname } from 'next/navigation';
import { Loader2, CreditCard } from 'lucide-react';

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
  const basePath = `/c/${pathname.split('/')[2]}`;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${basePath.replace('/payments', '')}/api/c/${pathname.split('/')[2]}/payments`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      setPayments(result.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [basePath, pathname]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payments
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your payment history
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {pendingPayments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pending Payments
                </h3>
                <div className="space-y-4">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment History
                </h3>
                <div className="space-y-4">
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

            {payments.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No payments found</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

