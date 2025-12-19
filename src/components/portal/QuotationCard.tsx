'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface QuotationCardProps {
  quotation: {
    id: string;
    quotation_id?: string;
    product_name?: string;
    status?: string;
    total_price_option1?: string;
    created_at?: string;
    image_url?: string;
    image_urls?: string[];
  };
  basePath: string;
}

export default function QuotationCard({ quotation, basePath }: QuotationCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    confirmed: CheckCircle,
  };

  const status = (quotation.status || 'pending').toLowerCase();
  const StatusIcon = statusIcons[status] || FileText;
  const statusColor = statusColors[status] || statusColors.pending;

  const imageUrl = quotation.image_url || 
    (quotation.image_urls && quotation.image_urls.length > 0 ? quotation.image_urls[0] : null);

  return (
    <Link
      href={`${basePath}/quotations/${quotation.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        {imageUrl ? (
          <div className="flex-shrink-0">
            <Image
              src={imageUrl}
              alt={quotation.product_name || 'Product'}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {quotation.product_name || 'Untitled Quotation'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {quotation.quotation_id || quotation.id}
              </p>
              {quotation.total_price_option1 && (
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${parseFloat(quotation.total_price_option1).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${statusColor}`}>
                <StatusIcon className="w-3 h-3" />
                {quotation.status || 'Pending'}
              </span>
              {quotation.created_at && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(quotation.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

