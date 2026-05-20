'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

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
    pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    approved: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
    rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
    confirmed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
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
      className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        {imageUrl ? (
          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={quotation.product_name || 'Product'}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Middle Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 dark:text-white truncate">
            {quotation.product_name || 'Untitled Quotation'}
          </p>
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
            {quotation.quotation_id || quotation.id}
          </p>
          {quotation.total_price_option1 && (
            <p className="text-xl font-bold text-[#06b6d4] mt-1">
              ${parseFloat(quotation.total_price_option1).toLocaleString()}
            </p>
          )}
        </div>

        {/* Right: Status + Date + Arrow */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${statusColor}`}>
            <StatusIcon className="w-3 h-3" />
            {quotation.status || 'Pending'}
          </span>
          {quotation.created_at && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(quotation.created_at).toLocaleDateString()}
            </p>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
