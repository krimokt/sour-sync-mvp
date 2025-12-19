'use client';

import { useState, useEffect } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
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
  const { data } = useMagicLink();
  const pathname = usePathname();
  const basePath = `/c/${pathname.split('/')[2]}`;
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments();
  }, [pathname]);

  const fetchShipments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${basePath.replace('/shipping', '')}/api/c/${pathname.split('/')[2]}/shipping`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shipments');
      }

      setShipments(result.shipments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Shipment Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your shipments and delivery status
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
        ) : shipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No shipments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                basePath={basePath}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

