'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMagicLink } from '@/components/portal/MagicLinkProvider';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, MapPin, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Shipment {
  id: string;
  tracking_number?: string;
  status?: string;
  location?: string;
  created_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  images_urls?: string[];
  videos_urls?: string[];
  quotations?: {
    id: string;
    quotation_id?: string;
    product_name?: string;
    image_url?: string;
  };
}

export default function ShipmentDetailPage() {
  const pathname = usePathname();
  const basePath = `/c/${pathname.split('/')[2]}`;
  const shipmentId = pathname.split('/')[4];

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${basePath.replace('/shipping/' + shipmentId, '')}/api/c/${pathname.split('/')[2]}/shipping/${shipmentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shipment');
      }

      setShipment(result.shipment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment');
    } finally {
      setIsLoading(false);
    }
  }, [basePath, pathname, shipmentId]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error || 'Shipment not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const isDelivered = shipment.status === 'delivered' || !!shipment.delivered_at;

  // Timeline events (mock - replace with actual tracking_events when available)
  const timelineEvents = [
    {
      date: shipment.created_at,
      title: 'Shipment Created',
      description: 'Your shipment has been created and is being prepared',
      status: 'completed',
    },
    {
      date: shipment.estimated_delivery,
      title: isDelivered ? 'Delivered' : 'Estimated Delivery',
      description: isDelivered 
        ? `Delivered on ${shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : 'N/A'}`
        : `Expected delivery: ${shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'TBD'}`,
      status: isDelivered ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`${basePath}/shipping`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shipments
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {shipment.quotations?.product_name || 'Shipment'}
              </h1>
              {shipment.quotations?.quotation_id && (
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Quotation: {shipment.quotations.quotation_id}
                </p>
              )}
              {shipment.tracking_number && (
                <p className="font-mono text-lg text-gray-900 dark:text-white">
                  Tracking: {shipment.tracking_number}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 inline-flex items-center gap-1 text-sm font-semibold rounded-full ${
              isDelivered
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {isDelivered && <CheckCircle className="w-4 h-4" />}
              {shipment.status || 'Processing'}
            </span>
          </div>

          {shipment.quotations?.image_url && (
            <div className="mb-6">
              <Image
                src={shipment.quotations.image_url}
                alt={shipment.quotations.product_name || 'Product'}
                width={400}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {shipment.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Current Location
                </h3>
                <p className="text-gray-900 dark:text-white">{shipment.location}</p>
              </div>
            )}
            {shipment.estimated_delivery && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Estimated Delivery
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {new Date(shipment.estimated_delivery).toLocaleDateString()}
                </p>
              </div>
            )}
            {shipment.receiver_name && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Receiver Name
                </h3>
                <p className="text-gray-900 dark:text-white">{shipment.receiver_name}</p>
              </div>
            )}
            {shipment.receiver_phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Receiver Phone
                </h3>
                <p className="text-gray-900 dark:text-white">{shipment.receiver_phone}</p>
              </div>
            )}
          </div>

          {shipment.receiver_address && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Delivery Address
              </h3>
              <p className="text-gray-900 dark:text-white">{shipment.receiver_address}</p>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tracking Timeline
            </h3>
            <div className="space-y-4">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {idx < timelineEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                    {event.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images and Videos */}
          {(shipment.images_urls && shipment.images_urls.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipment Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {shipment.images_urls.map((url, idx) => (
                  <Image
                    key={idx}
                    src={url}
                    alt={`Shipment image ${idx + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full h-32"
                  />
                ))}
              </div>
            </div>
          )}

          {shipment.quotations && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`${basePath}/quotations/${shipment.quotations.id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Related Quotation →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

