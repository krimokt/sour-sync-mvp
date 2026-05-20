'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import ShipmentCard from '@/components/portal/ShipmentCard';
import { usePathname } from 'next/navigation';
import { Loader2, Truck } from 'lucide-react';

interface Shipment {
  id: string;
  tracking_number?: string;
  status?: string;
  location?: string;
  created_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  quotations?: {
    id: string;
    quotation_id?: string;
    product_name?: string;
  };
}

export default function ShippingPage() {
  const pathname = usePathname();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/c/${token}/shipping`);
      const responseText = await response.text();
      if (!response.ok) {
        let msg = 'Failed to fetch shipments';
        try {
          if (responseText.trim()) msg = JSON.parse(responseText).error || msg;
          else msg = `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          msg = responseText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(msg);
      }
      if (!responseText.trim()) { setShipments([]); return; }
      try {
        const result = JSON.parse(responseText);
        setShipments(result.shipments || []);
      } catch {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const activeShipments = shipments.filter(
    (s) => s.status !== 'delivered' && !s.delivered_at
  );
  const deliveredShipments = shipments.filter(
    (s) => s.status === 'delivered' || !!s.delivered_at
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Shipping
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {shipments.length > 0
              ? `${shipments.length} shipment${shipments.length !== 1 ? 's' : ''}`
              : 'Track your shipments'}
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
        ) : shipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No shipments yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Shipments will appear here once your orders are dispatched.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeShipments.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-3">
                  In Progress
                </h2>
                <div className="space-y-2">
                  {activeShipments.map((shipment) => (
                    <ShipmentCard
                      key={shipment.id}
                      shipment={shipment}
                      basePath={basePath}
                    />
                  ))}
                </div>
              </div>
            )}

            {deliveredShipments.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-3">
                  Delivered
                </h2>
                <div className="space-y-2">
                  {deliveredShipments.map((shipment) => (
                    <ShipmentCard
                      key={shipment.id}
                      shipment={shipment}
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
