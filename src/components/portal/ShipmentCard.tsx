'use client';

import Link from 'next/link';
import { Truck, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';

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

export default function ShipmentCard({ shipment, basePath }: ShipmentCardProps) {
  const statusColors: Record<string, string> = {
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    in_transit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  const isDelivered = shipment.status === 'delivered' || !!shipment.delivered_at;

  return (
    <Link
      href={`${basePath}/shipping/${shipment.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {shipment.quotations?.product_name || 'Shipment'}
              </h3>
              {shipment.quotations?.quotation_id && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Quotation: {shipment.quotations.quotation_id}
                </p>
              )}
              {shipment.tracking_number && (
                <p className="text-sm font-mono text-gray-600 dark:text-gray-300 mb-2">
                  Tracking: {shipment.tracking_number}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${
              statusColors[shipment.status || 'processing'] || statusColors.processing
            }`}>
              {isDelivered && <CheckCircle className="w-3 h-3" />}
              {shipment.status || 'Processing'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {shipment.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{shipment.location}</span>
              </div>
            )}
            {shipment.estimated_delivery && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
              </div>
            )}
            {shipment.delivered_at && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Delivered: {new Date(shipment.delivered_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {shipment.receiver_name && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Receiver:</span> {shipment.receiver_name}
              </p>
              {shipment.receiver_address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {shipment.receiver_address}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

