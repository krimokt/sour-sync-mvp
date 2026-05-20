'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname, useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  ShoppingCart,
  Clock,
  DollarSign,
  AlertCircle,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import CheckoutModal from '@/components/portal/CheckoutModal';

interface Quotation {
  id: string;
  quotation_id?: string;
  product_name?: string;
  product_url?: string;
  quantity?: number;
  status?: string;
  destination_country?: string;
  destination_city?: string;
  shipping_method?: string;
  total_price_option1?: string;
  total_price_option2?: string;
  total_price_option3?: string;
  title_option1?: string;
  title_option2?: string;
  title_option3?: string;
  description_option1?: string;
  description_option2?: string;
  description_option3?: string;
  delivery_time_option1?: string;
  delivery_time_option2?: string;
  delivery_time_option3?: string;
  image_option1?: string;
  image_option2?: string;
  image_option3?: string;
  selected_option?: number;
  created_at?: string;
  image_url?: string;
  image_urls?: string[];
  product_images?: string[];
}

const optionThemes = [
  { accent: '#6366f1', label: 'Standard', lightBg: 'bg-indigo-50 dark:bg-indigo-950/40', borderColor: '#6366f1' },
  { accent: '#06b6d4', label: 'Popular', lightBg: 'bg-cyan-50 dark:bg-cyan-950/40', borderColor: '#06b6d4' },
  { accent: '#f59e0b', label: 'Premium', lightBg: 'bg-amber-50 dark:bg-amber-950/40', borderColor: '#f59e0b' },
];

function parseOptionImages(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
  } catch {
    return [raw];
  }
}

export default function QuotationDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const token = pathname.split('/')[2];
  const basePath = `/c/${token}`;
  const quotationId = pathname.split('/')[4];

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quotation');
      }

      setQuotation(result.quotation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  }, [token, quotationId]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this quotation?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve quotation');
      }

      setQuotation(result.quotation);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve quotation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectOption = async (optionNumber: number) => {
    if (!quotation) return;

    // Optimize: Update local state immediately for instant feedback
    setQuotation({ ...quotation, selected_option: optionNumber });

    // Sync with server in background
    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_option: optionNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Revert on error
        setQuotation({ ...quotation, selected_option: quotation.selected_option });
        throw new Error(result.error || 'Failed to select option');
      }

      // Update with server response to ensure consistency
      setQuotation(result.quotation);
    } catch (err) {
      // Only show error if it's not a network issue (user already sees the change)
      console.error('Failed to sync option selection:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-[#06b6d4]" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
            <p className="text-red-700 dark:text-red-400 text-sm">{error || 'Quotation not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const images = quotation.image_urls || quotation.product_images || (quotation.image_url ? [quotation.image_url] : []);

  const statusBadge = () => {
    if (quotation.status === 'Approved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Approved
        </span>
      );
    }
    if (quotation.status === 'Rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
        {quotation.status || 'Pending'}
      </span>
    );
  };

  const optionData = [
    {
      n: 1,
      price: quotation.total_price_option1,
      title: quotation.title_option1,
      description: quotation.description_option1,
      deliveryTime: quotation.delivery_time_option1,
      imageRaw: quotation.image_option1,
    },
    {
      n: 2,
      price: quotation.total_price_option2,
      title: quotation.title_option2,
      description: quotation.description_option2,
      deliveryTime: quotation.delivery_time_option2,
      imageRaw: quotation.image_option2,
    },
    {
      n: 3,
      price: quotation.total_price_option3,
      title: quotation.title_option3,
      description: quotation.description_option3,
      deliveryTime: quotation.delivery_time_option3,
      imageRaw: quotation.image_option3,
    },
  ].filter((o) => !!o.price);

  const hasOptions = optionData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`${basePath}/quotations`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Link>

        {/* Product Hero Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
          {/* Images Strip */}
          {images.length > 0 && (
            <div className="flex gap-3 p-4 overflow-x-auto bg-gray-50 dark:bg-gray-800/50">
              {images.map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Product Details */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quotation.product_name || 'Quotation'}
                </h1>
                <p className="text-sm font-mono text-gray-400 dark:text-gray-500 mt-1">
                  {quotation.quotation_id || quotation.id}
                </p>
              </div>
              {statusBadge()}
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Quantity</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{quotation.quantity || 1}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Destination</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {[quotation.destination_city, quotation.destination_country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Shipping Method</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{quotation.shipping_method || 'TBD'}</p>
              </div>
              {quotation.product_url && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Product URL</p>
                  <a
                    href={quotation.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#06b6d4] hover:underline"
                  >
                    View Product
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Options Section */}
        {quotation.status === 'Approved' && hasOptions && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-[#06b6d4]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Choose Your Option</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 ml-8">
              Select the pricing option that works best for you
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optionData.map(({ n, price, title, description, deliveryTime, imageRaw }) => {
                const theme = optionThemes[n - 1];
                const isSelected = quotation.selected_option === n;
                const optionImages = parseOptionImages(imageRaw);
                const priceNum = parseFloat(price!);
                const perUnit = quotation.quantity && quotation.quantity > 1
                  ? (priceNum / quotation.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : null;

                return (
                  <div
                    key={n}
                    onClick={() => handleSelectOption(n)}
                    className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                      isSelected ? '' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                    style={isSelected
                      ? { borderColor: theme.accent, boxShadow: `0 4px 20px ${theme.accent}22` }
                      : {}}
                  >
                    <div className="overflow-hidden">
                      {/* Card Header */}
                      <div className={`${theme.lightBg} px-4 py-3 border-b border-gray-100 dark:border-gray-800`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                              style={{ backgroundColor: isSelected ? theme.accent : '#9ca3af' }}
                            >
                              {n}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Option {n}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{theme.label}</p>
                            </div>
                          </div>
                          {isSelected ? (
                            <span
                              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ color: theme.accent, backgroundColor: `${theme.accent}18` }}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Selected
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Select</span>
                          )}
                        </div>
                      </div>

                      {/* Option Image */}
                      {optionImages[0] && (
                        <div className="relative h-36 bg-gray-50 dark:bg-gray-800">
                          <Image
                            src={optionImages[0]}
                            alt={title || `Option ${n}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="p-4">
                        <div className="flex items-end gap-2 mb-3">
                          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            ${priceNum.toLocaleString()}
                          </span>
                          {perUnit && (
                            <span className="text-sm text-gray-500 pb-1">
                              ${perUnit} / unit
                            </span>
                          )}
                        </div>

                        {deliveryTime && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{deliveryTime}</span>
                          </div>
                        )}

                        {description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>

                      {/* Select CTA */}
                      <div className="px-4 pb-4">
                        <button
                          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          style={isSelected ? { backgroundColor: theme.accent } : {}}
                          onClick={(e) => { e.stopPropagation(); handleSelectOption(n); }}
                        >
                          {isSelected ? 'Selected' : 'Choose this option'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Banners */}
        {quotation.status === 'Pending' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Awaiting Admin Review</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  Your quotation is being processed. You will be notified when a price is available.
                </p>
              </div>
            </div>
          </div>
        )}

        {quotation.status === 'Approved' && quotation.selected_option && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-5 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Option {quotation.selected_option} Selected
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Ready to proceed with payment</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex-shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {quotation.status === 'Approved' && !quotation.selected_option && hasOptions && (
          <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-2xl p-5 mt-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Please select a price option above to proceed with payment.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      {quotation && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          quotation={quotation}
          token={token}
          onSuccess={() => {
            fetchQuotation();
            router.push(`${basePath}/payments`);
          }}
        />
      )}
    </div>
  );
}
