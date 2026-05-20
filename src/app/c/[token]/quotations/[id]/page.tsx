'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname, useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  AlertCircle,
  Info,
  Package,
  MapPin,
  Truck,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

const OPTION_THEMES = [
  { accent: '#6366f1', label: 'Standard', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { accent: '#06b6d4', label: 'Popular', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { accent: '#f59e0b', label: 'Premium', bg: 'bg-amber-50 dark:bg-amber-950/40' },
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

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase();
  if (s === 'approved')
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
        Approved
      </span>
    );
  if (s === 'rejected')
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800/60">
        Rejected
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60">
      {status || 'Pending'}
    </span>
  );
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

  const fetchQuotation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch quotation');
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

  const handleSelectOption = async (optionNumber: number) => {
    if (!quotation) return;
    const prev = quotation.selected_option;
    setQuotation({ ...quotation, selected_option: optionNumber });
    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_option: optionNumber }),
      });
      const result = await response.json();
      if (!response.ok) {
        setQuotation({ ...quotation, selected_option: prev });
        throw new Error(result.error || 'Failed to select option');
      }
      setQuotation(result.quotation);
    } catch (err) {
      console.error('Failed to sync option selection:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/60 rounded-2xl p-5">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error || 'Quotation not found'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const images =
    quotation.image_urls ||
    quotation.product_images ||
    (quotation.image_url ? [quotation.image_url] : []);

  const optionData = [
    { n: 1, price: quotation.total_price_option1, title: quotation.title_option1, description: quotation.description_option1, deliveryTime: quotation.delivery_time_option1, imageRaw: quotation.image_option1 },
    { n: 2, price: quotation.total_price_option2, title: quotation.title_option2, description: quotation.description_option2, deliveryTime: quotation.delivery_time_option2, imageRaw: quotation.image_option2 },
    { n: 3, price: quotation.total_price_option3, title: quotation.title_option3, description: quotation.description_option3, deliveryTime: quotation.delivery_time_option3, imageRaw: quotation.image_option3 },
  ].filter((o) => !!o.price);

  const hasOptions = optionData.length > 0;
  const isApproved = quotation.status === 'Approved';
  const hasSelection = !!quotation.selected_option;

  const selectedPrice = (() => {
    if (!quotation.selected_option) return null;
    const field = `total_price_option${quotation.selected_option}` as keyof Quotation;
    const val = quotation[field] as string | undefined;
    return val ? parseFloat(val) : null;
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      {/* Extra bottom padding when sticky bar is shown */}
      <main className={`max-w-4xl mx-auto px-4 py-8 space-y-4 ${isApproved && hasSelection ? 'pb-28' : ''}`}>
        {/* Back */}
        <Link
          href={`${basePath}/quotations`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Link>

        {/* Product card */}
        <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {images.length > 0 && (
            <div className="flex gap-2.5 p-4 overflow-x-auto bg-gray-50 dark:bg-gray-800/40">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <Image src={img} alt={`Product ${idx + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {quotation.product_name || 'Quotation'}
                </h1>
                <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                  {quotation.quotation_id || quotation.id}
                </p>
              </div>
              <StatusBadge status={quotation.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Qty</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{quotation.quantity || 1}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Destination</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {[quotation.destination_city, quotation.destination_country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Shipping</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{quotation.shipping_method || 'TBD'}</p>
              </div>
              {quotation.product_url && (
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Link</p>
                  </div>
                  <a href={quotation.product_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#06b6d4] hover:underline">
                    View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending notice */}
        {quotation.status === 'Pending' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Awaiting Review</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  Your quotation is being reviewed. We will notify you once pricing is ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing options */}
        {isApproved && hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Choose Your Option
              </h2>
              {!hasSelection && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Tap to select
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {optionData.map(({ n, price, title, description, deliveryTime, imageRaw }) => {
                const theme = OPTION_THEMES[n - 1];
                const isSelected = quotation.selected_option === n;
                const optionImages = parseOptionImages(imageRaw);
                const priceNum = parseFloat(price!);
                const perUnit =
                  quotation.quantity && quotation.quantity > 1
                    ? (priceNum / quotation.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : null;

                return (
                  <div
                    key={n}
                    onClick={() => handleSelectOption(n)}
                    className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                      isSelected ? '' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                    style={isSelected ? { borderColor: theme.accent, boxShadow: `0 0 0 3px ${theme.accent}18` } : {}}
                  >
                    {/* Card header */}
                    <div className={`${theme.bg} px-4 py-3 border-b border-gray-100 dark:border-gray-800`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                            style={{ backgroundColor: isSelected ? theme.accent : '#9ca3af' }}
                          >
                            {n}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {title || `Option ${n}`}
                            </p>
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
                          <span className="text-xs text-gray-400">Select</span>
                        )}
                      </div>
                    </div>

                    {/* Option image */}
                    {optionImages[0] && (
                      <div className="relative h-36 bg-gray-50 dark:bg-gray-800">
                        <Image src={optionImages[0]} alt={title || `Option ${n}`} fill className="object-cover" />
                      </div>
                    )}

                    {/* Price body */}
                    <div className="p-4 bg-white dark:bg-gray-900">
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                          ${priceNum.toLocaleString()}
                        </span>
                        {perUnit && (
                          <span className="text-sm text-gray-400 pb-0.5">${perUnit}/unit</span>
                        )}
                      </div>
                      {deliveryTime && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          {deliveryTime}
                        </div>
                      )}
                      {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {description}
                        </p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectOption(n); }}
                        className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        style={isSelected ? { backgroundColor: theme.accent } : {}}
                      >
                        {isSelected ? 'Selected' : 'Choose this option'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Select prompt */}
        {isApproved && !hasSelection && hasOptions && (
          <div className="bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-[#06b6d4] shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Select a pricing option above to proceed with payment.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky checkout bar — appears once an option is selected */}
      {isApproved && hasSelection && selectedPrice !== null && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/97 dark:bg-gray-950/97 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Option {quotation.selected_option} selected
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                ${selectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Link
              href={`${basePath}/quotations/${quotationId}/checkout`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold text-sm transition-colors shrink-0"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
