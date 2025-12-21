'use client';

import Link from 'next/link';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

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

export default function PaymentCard({ payment, basePath }: PaymentCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    completed: CheckCircle,
    accepted: CheckCircle,
    rejected: XCircle,
    failed: XCircle,
  };

  const status = (payment.status || 'pending').toLowerCase();
  const StatusIcon = statusIcons[status] || CreditCard;
  const statusColor = statusColors[status] || statusColors.pending;

  const quotation = payment.payment_quotations?.[0]?.quotations;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {quotation?.product_name || 'Payment'}
            </h3>
          </div>
          {quotation?.quotation_id && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Quotation: {quotation.quotation_id}
            </p>
          )}
          {payment.reference_number && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Reference: {payment.reference_number}
            </p>
          )}
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {payment.currency || 'USD'} {payment.amount?.toLocaleString() || '0.00'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Method: {payment.payment_method || 'Bank Transfer'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${statusColor}`}>
            <StatusIcon className="w-3 h-3" />
            {payment.status || 'Pending'}
          </span>
          {payment.created_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(payment.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {quotation && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`${basePath}/quotations/${quotation.id}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Quotation →
          </Link>
        </div>
      )}
    </div>
  );
}


