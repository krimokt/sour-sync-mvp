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

const STATUS_CONFIG: Record<string, { icon: typeof Clock; bg: string; text: string; border: string }> = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800/60',
  },
  approved: {
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
  confirmed: {
    icon: CheckCircle,
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-100 dark:border-sky-800/60',
  },
};

export default function QuotationCard({ quotation, basePath }: QuotationCardProps) {
  const status = (quotation.status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const imageUrl =
    quotation.image_url ||
    (quotation.image_urls?.length ? quotation.image_urls[0] : null);

  const price = quotation.total_price_option1
    ? parseFloat(quotation.total_price_option1)
    : null;

  return (
    <Link
      href={`${basePath}/quotations/${quotation.id}`}
      className="group flex items-center gap-4 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-150"
    >
      <div className="shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={quotation.product_name || 'Product'}
            width={68}
            height={68}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
          {quotation.product_name || 'Untitled Quotation'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5 truncate">
          {quotation.quotation_id || quotation.id.slice(0, 14)}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
          >
            <StatusIcon className="w-3 h-3" />
            {quotation.status || 'Pending'}
          </span>
          {price !== null && price > 0 && (
            <span className="text-xs font-semibold text-[#06b6d4]">
              ${price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        {quotation.created_at && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(quotation.created_at).toLocaleDateString('en', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
