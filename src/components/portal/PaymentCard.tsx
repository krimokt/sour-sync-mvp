'use client';

import Link from 'next/link';
import { CreditCard, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

interface PaymentCardProps {
  payment: {
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
  };
  basePath: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; bg: string; text: string; border: string }> = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800/60',
  },
  completed: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800/60',
  },
  accepted: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800/60',
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-100 dark:border-red-800/60',
  },
  failed: {
    icon: XCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-100 dark:border-red-800/60',
  },
};

export default function PaymentCard({ payment, basePath }: PaymentCardProps) {
  const status = (payment.status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const quotation = payment.payment_quotations?.[0]?.quotations;

  return (
    <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
              {quotation?.product_name || 'Payment'}
            </p>
            {payment.reference_number && (
              <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                Ref: {payment.reference_number}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {payment.payment_method || 'Bank Transfer'}
              {payment.created_at && (
                <>
                  {' '}
                  &middot;{' '}
                  {new Date(payment.created_at).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
          >
            <StatusIcon className="w-3 h-3" />
            {payment.status || 'Pending'}
          </span>
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
            {payment.currency || 'USD'}{' '}
            {(payment.amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {quotation && (
        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/80">
          <Link
            href={`${basePath}/quotations/${quotation.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#06b6d4] hover:text-[#0891b2] transition-colors"
          >
            View quotation
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
