'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  Package,
  Truck,
  Phone,
  User,
  Home,
} from 'lucide-react';
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

const TIMELINE_STATUSES = [
  { key: 'processing', label: 'Order Confirmed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

function getStatusIndex(status?: string, delivered?: string) {
  if (delivered || status === 'delivered') return 3;
  if (status === 'in_transit') return 2;
  if (status === 'shipped') return 1;
  return 0;
}

export default function ShipmentDetailPage() {
  const pathname = usePathname();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const shipmentId = pathname.split('/')[4];

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/c/${token}/shipping/${shipmentId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch shipment');
      setShipment(result.shipment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment');
    } finally {
      setIsLoading(false);
    }
  }, [token, shipmentId]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/60 rounded-2xl p-5">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error || 'Shipment not found'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isDelivered = shipment.status === 'delivered' || !!shipment.delivered_at;
  const statusIndex = getStatusIndex(shipment.status, shipment.delivered_at);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* Back */}
        <Link
          href={`${basePath}/shipping`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shipping
        </Link>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {shipment.quotations?.product_name || 'Shipment'}
                </h1>
                {shipment.quotations?.quotation_id && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Quotation: {shipment.quotations.quotation_id}
                  </p>
                )}
                {shipment.tracking_number && (
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-300 mt-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 inline-block">
                    {shipment.tracking_number}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isDelivered
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/60'
                }`}
              >
                {isDelivered ? 'Delivered' : (shipment.status || 'Processing')}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/80">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
              Tracking Timeline
            </h2>
            <div className="relative">
              {TIMELINE_STATUSES.map((step, idx) => {
                const isCompleted = statusIndex >= idx;
                const isCurrent = statusIndex === idx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Vertical line */}
                    {idx < TIMELINE_STATUSES.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] ${
                          isCompleted && statusIndex > idx
                            ? 'bg-[#06b6d4]'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      />
                    )}
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCompleted
                          ? 'bg-[#06b6d4] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-[#06b6d4]/20' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {/* Label */}
                    <div className={`pb-6 ${idx === TIMELINE_STATUSES.length - 1 ? 'pb-0' : ''}`}>
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && shipment.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shipment.location}
                        </p>
                      )}
                      {step.key === 'delivered' && isDelivered && shipment.delivered_at && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {new Date(shipment.delivered_at).toLocaleDateString('en', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shipment.location && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Current Location</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {shipment.location}
                  </p>
                </div>
              </div>
            )}
            {shipment.estimated_delivery && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    {isDelivered ? 'Delivered' : 'Estimated Delivery'}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {new Date(shipment.estimated_delivery).toLocaleDateString('en', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
            {shipment.receiver_name && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Receiver</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {shipment.receiver_name}
                  </p>
                </div>
              </div>
            )}
            {shipment.receiver_phone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {shipment.receiver_phone}
                  </p>
                </div>
              </div>
            )}
            {shipment.receiver_address && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Delivery Address</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {shipment.receiver_address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shipment images */}
          {shipment.images_urls && shipment.images_urls.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Photos
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {shipment.images_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={url}
                      alt={`Shipment photo ${idx + 1}`}
                      width={160}
                      height={160}
                      className="w-full h-24 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related quotation link */}
          {shipment.quotations && (
            <div className="px-6 pb-6 pt-0">
              <Link
                href={`${basePath}/quotations/${shipment.quotations.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#06b6d4] hover:text-[#0891b2] transition-colors"
              >
                View related quotation
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
