'use client';

import Link from 'next/link';
import { Truck, MapPin, Calendar, CheckCircle, Package, ChevronRight } from 'lucide-react';

interface ShipmentCardProps {
  shipment: {
    id: string;
    tracking_number?: string;
    status?: string;
    location?: string;
    created_at?: string;
    estimated_delivery?: string;
    delivered_at?: string;
    receiver_name?: string;
    receiver_address?: string;
    quotations?: {
      id: string;
      quotation_id?: string;
      product_name?: string;
    };
  };
  basePath: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Truck; bg: string; text: string; border: string; label: string }> = {
  processing: {
    icon: Package,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800/60',
    label: 'Processing',
  },
  shipped: {
    icon: Truck,
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-100 dark:border-violet-800/60',
    label: 'Shipped',
  },
  in_transit: {
    icon: Truck,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800/60',
    label: 'In Transit',
  },
  delivered: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800/60',
    label: 'Delivered',
  },
};

export default function ShipmentCard({ shipment, basePath }: ShipmentCardProps) {
  const statusKey = (shipment.delivered_at ? 'delivered' : shipment.status || 'processing').toLowerCase();
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.processing;
  const StatusIcon = config.icon;

  return (
    <Link
      href={`${basePath}/shipping/${shipment.id}`}
      className="group flex items-center gap-4 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-150"
    >
      <div className="shrink-0 w-[52px] h-[52px] rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
        <Truck className="w-6 h-6 text-orange-500 dark:text-orange-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
          {shipment.quotations?.product_name || 'Shipment'}
        </p>
        {shipment.tracking_number && (
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {shipment.tracking_number}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </span>
          {shipment.location && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              {shipment.location}
            </span>
          )}
          {shipment.estimated_delivery && !shipment.delivered_at && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              Est.{' '}
              {new Date(shipment.estimated_delivery).toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
