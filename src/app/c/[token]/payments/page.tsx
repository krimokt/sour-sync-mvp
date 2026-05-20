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
  reference_number?: string;
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
      const responseText = await response.text();
      if (!response.ok) {
        let msg = 'Failed to fetch payments';
        try {
          if (responseText.trim()) msg = JSON.parse(responseText).error || msg;
          else msg = `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          msg = responseText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(msg);
      }
      if (!responseText.trim()) { setPayments([]); return; }
      try {
        const result = JSON.parse(responseText);
        setPayments(result.payments || []);
      } catch {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const pendingPayments = payments.filter(
    (p) => (p.status || '').toLowerCase() === 'pending'
  );
  const completedPayments = payments.filter((p) =>
    ['completed', 'accepted'].includes((p.status || '').toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {payments.length > 0
              ? `${payments.length} payment${payments.length !== 1 ? 's' : ''}`
              : 'Your payment history'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/60 rounded-2xl p-5">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No payments yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Payments will appear here once you proceed to checkout on an approved quotation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingPayments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Pending
                  </h2>
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60">
                    {pendingPayments.length}
                  </span>
                </div>
                <div className="space-y-2">
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
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Completed
                  </h2>
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                    {completedPayments.length}
                  </span>
                </div>
                <div className="space-y-2">
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
