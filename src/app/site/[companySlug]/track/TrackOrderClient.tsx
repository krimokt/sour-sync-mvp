'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Order } from '@/types/store';

interface TrackOrderClientProps {
  companySlug: string;
  themeColor: string;
}

export default function TrackOrderClient({ companySlug, themeColor }: TrackOrderClientProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setIsSearching(true);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/store/${companySlug}/orders/track?order_number=${orderNumber}&email=${email}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Order not found');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
      { key: 'processing', label: 'Processing', icon: Clock },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: MapPin },
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Truck className="w-12 h-12 mx-auto mb-4" style={{ color: themeColor }} />
        <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-gray-600 mt-2">
          Enter your order number and email to check the status
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Number
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ORD000001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Track Order
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && searched && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please check your order number and email address and try again.
          </p>
        </div>
      )}

      {/* Order Found */}
      {order && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="text-xl font-bold" style={{ color: themeColor }}>${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative">
              <div className="flex justify-between">
                {getStatusSteps(order.status).map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? step.current
                              ? 'text-white'
                              : 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        style={step.current ? { backgroundColor: themeColor } : {}}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${
                          step.completed ? 'text-gray-900 font-medium' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      (getStatusSteps(order.status).filter((s) => s.completed).length - 1) * 25
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="space-y-3">
                {order.shipping_carrier && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Carrier</span>
                    <span className="font-medium">{order.shipping_carrier}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking Number</span>
                  <span className="font-medium">{order.tracking_number}</span>
                </div>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-4"
                  >
                    Track with Carrier
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping To</h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p>{order.shipping_address_1}</p>
              {order.shipping_address_2 && <p>{order.shipping_address_2}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-4">
                    <img
                      src={item.product_image || 'https://placehold.co/60x60/e2e8f0/64748b?text=...'}
                      alt={item.product_name}
                      className="w-14 h-14 object-cover rounded bg-gray-100"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${item.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <Link href={`/site/${companySlug}/contact`} className="hover:underline" style={{ color: themeColor }}>
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

