'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import {
  Package, MapPin, Truck, Link as LinkIcon,
  CheckCircle, Loader2, Layers, Clock, X, FileText,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { VariantGroup } from '@/types/database';

interface QuotationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    id: string;
    quotation_id: string;
    product_name: string;
    product_url?: string;
    quantity: number;
    variant_specs?: string;
    notes?: string;
    destination_country?: string;
    destination_city?: string;
    shipping_method?: string;
    service_type?: string;
    image_url?: string;
    product_images?: string[];
    created_at: string;
    status?: string;
    variant_groups?: VariantGroup[];
  };
}

const getCountryName = (code: string): string => {
  if (!code) return code;
  const c = code.includes('-') ? code.split('-')[0] : code;
  if (c.length !== 2) return code;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(c.toUpperCase()) || code;
  } catch { return code; }
};

const getCountryEmoji = (code: string): string => {
  try {
    return String.fromCodePoint(...code.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt(0)));
  } catch { return '🏳️'; }
};

interface PriceOption {
  id: number;
  title: string;
  price: string;
  perUnit?: string;
  description?: string;
  deliveryTime?: string;
  images: string[];
  priceDescription?: string;
}

export default function QuotationReviewModal({ isOpen, onClose, quotation }: QuotationReviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const allImages = [
    ...(quotation.image_url ? [quotation.image_url] : []),
    ...(quotation.product_images || []),
  ].filter(Boolean);

  const parseImages = (field?: string | null): string[] => {
    if (!field) return [];
    try {
      const p = JSON.parse(field);
      return Array.isArray(p) ? p : [p].filter(Boolean);
    } catch { return field ? [field] : []; }
  };

  const fetchOptions = useCallback(async () => {
    if (!quotation.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotation.id)
        .single();

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any;
      const options: PriceOption[] = [];

      for (const n of [1, 2, 3]) {
        if (d[`title_option${n}`] || d[`total_price_option${n}`]) {
          options.push({
            id: n,
            title: d[`title_option${n}`] || `Option ${n}`,
            price: d[`total_price_option${n}`] || '0',
            perUnit: d[`price_per_unit_option${n}`] || undefined,
            description: d[`description_option${n}`] || undefined,
            deliveryTime: d[`delivery_time_option${n}`] || undefined,
            images: parseImages(d[`image_option${n}`]),
            priceDescription: d[`price_description_option${n}`] || undefined,
          });
        }
      }

      setPriceOptions(options);
      if (d.selected_option) setSelectedOption(d.selected_option);
    } catch (e) {
      console.error('Error fetching options:', e);
    } finally {
      setIsLoading(false);
    }
  }, [quotation.id]);

  // Auto-load on open
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      setSaveSuccess(false);
      setSaveError('');
    } else {
      setSelectedOption(null);
      setPriceOptions([]);
      setSelectedImageIndex(0);
    }
  }, [isOpen, fetchOptions]);

  const handleSave = async () => {
    if (!selectedOption || !quotation.id) return;
    setIsSaving(true);
    setSaveError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('quotations') as any)
        .update({ selected_option: selectedOption, status: 'Approved', updated_at: new Date().toISOString() })
        .eq('id', quotation.id);
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => { onClose(); }, 900);
    } catch (e) {
      setSaveError('Failed to save. Please try again.');
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const fmt = (p: string) => {
    const n = parseFloat(p);
    return isNaN(n) ? p : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const destination = [
    quotation.destination_country ? `${getCountryEmoji(quotation.destination_country)} ${getCountryName(quotation.destination_country)}` : null,
    quotation.destination_city,
  ].filter(Boolean).join(', ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-2xl w-full mx-auto p-0 overflow-hidden">

      {/* ── Sticky header ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(6,182,212,0.1)' }}
        >
          <FileText size={15} style={{ color: '#06b6d4' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Quotation Review</p>
          <p className="text-[11px] text-gray-400 font-mono">{quotation.quotation_id}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {quotation.status && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              quotation.status.toLowerCase() === 'approved'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : quotation.status.toLowerCase() === 'rejected'
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {quotation.status}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 148px)', background: 'oklch(0.975 0.004 238)' }}
      >
        <div className="p-5 space-y-3" style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}>

          {/* ── Product summary card ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex gap-4 p-4">
              {/* Product image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                {allImages[selectedImageIndex] ? (
                  <div className="relative w-full h-full">
                    <Image src={allImages[selectedImageIndex]} alt={quotation.product_name} fill className="object-contain" unoptimized />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={28} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                  {quotation.product_name}
                </h3>
                {quotation.product_url && (
                  <a
                    href={quotation.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#06b6d4] hover:underline mb-2 truncate max-w-full"
                  >
                    <LinkIcon size={11} />
                    {quotation.product_url.replace(/^https?:\/\//, '').slice(0, 50)}{quotation.product_url.length > 53 ? '…' : ''}
                  </a>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                  {[
                    { icon: <Package size={11} />, label: 'Qty', value: String(quotation.quantity) },
                    destination ? { icon: <MapPin size={11} />, label: 'To', value: destination } : null,
                    quotation.shipping_method ? { icon: <Truck size={11} />, label: 'Via', value: quotation.shipping_method } : null,
                    quotation.service_type ? { icon: <FileText size={11} />, label: 'Service', value: quotation.service_type } : null,
                  ].filter(Boolean).map((item) => item && (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className="text-gray-400">{item.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.label}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === i ? 'border-[#06b6d4]' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Image src={img} alt={`Image ${i + 1}`} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}

            {/* Notes + specs */}
            {(quotation.notes || quotation.variant_specs) && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3 space-y-3">
                {quotation.notes && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Client notes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
                  </div>
                )}
                {quotation.variant_specs && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Variant specs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quotation.variant_specs}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Variant groups ── */}
          {quotation.variant_groups && quotation.variant_groups.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={13} style={{ color: '#06b6d4' }} />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Variant groups</p>
              </div>
              <div className="space-y-3">
                {quotation.variant_groups.map((group, gi) => (
                  <div key={gi} className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-500 pt-1 min-w-[56px] flex-shrink-0">
                      {group.name || `Group ${gi + 1}`}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.values?.map((v, vi) => (
                        <div key={vi} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {v.images?.[0] && (
                            <div className="relative w-4 h-4 rounded overflow-hidden flex-shrink-0">
                              <Image src={v.images[0]} alt={v.name} fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{v.name}</span>
                          {v.moq && <span className="text-[10px] text-gray-400">MOQ {v.moq}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Price options ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} style={{ color: '#06b6d4' }} />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pricing options</p>
              </div>
              <button
                onClick={fetchOptions}
                disabled={isLoading}
                className="text-[11px] text-[#06b6d4] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isLoading && <Loader2 size={11} className="animate-spin" />}
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-gray-300 dark:text-gray-600" />
              </div>
            ) : priceOptions.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-2 w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <Package size={18} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No pricing options set yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Set options in the quotation editor first</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Option cards — horizontal scroll on mobile */}
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {priceOptions.map((opt) => {
                    const sel = selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOption(opt.id)}
                        className="flex-shrink-0 snap-start text-left flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-150 focus:outline-none"
                        style={{
                          width: 'calc(50% - 6px)',
                          minWidth: '176px',
                          borderColor: sel ? '#06b6d4' : 'oklch(0.91 0.005 238)',
                          background: sel ? 'oklch(0.975 0.015 195)' : 'oklch(0.975 0.004 238)',
                          boxShadow: sel ? '0 0 0 1px #06b6d4' : 'none',
                        }}
                      >
                        {/* Option number + selected */}
                        <div
                          className="flex items-center justify-between px-3.5 py-2.5"
                          style={{ borderBottom: `1px solid ${sel ? 'rgba(6,182,212,0.2)' : 'oklch(0.92 0.005 238)'}` }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={sel
                                ? { background: '#06b6d4', color: '#fff' }
                                : { background: 'oklch(0.92 0.007 238)', color: 'oklch(0.5 0.01 238)' }
                              }
                            >
                              {opt.id}
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                              {opt.title}
                            </span>
                          </div>
                          {sel && (
                            <div
                              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: '#06b6d4', color: '#fff' }}
                            >
                              <CheckCircle size={8} /> Selected
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        {opt.images.length > 0 && (
                          <div className="relative w-full h-28 overflow-hidden flex-shrink-0">
                            <Image src={opt.images[0]} alt={opt.title} fill className="object-cover" unoptimized />
                          </div>
                        )}

                        {/* Price */}
                        <div className="px-3.5 pt-3 pb-1">
                          <p
                            className="text-xl font-extrabold tracking-tight"
                            style={{ color: sel ? '#06b6d4' : 'oklch(0.2 0.01 238)' }}
                          >
                            {fmt(opt.price)}
                          </p>
                          {opt.perUnit && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{fmt(opt.perUnit)} per unit</p>
                          )}
                        </div>

                        {/* Delivery */}
                        {opt.deliveryTime && (
                          <div className="px-3.5 pb-2 flex items-center gap-1.5">
                            <Clock size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">{opt.deliveryTime}</span>
                          </div>
                        )}

                        {/* Description */}
                        {opt.description && (
                          <p className="px-3.5 pb-3 text-[11px] text-gray-400 leading-relaxed line-clamp-3">{opt.description}</p>
                        )}

                        {/* Pricing note */}
                        {opt.priceDescription && (
                          <div className="mx-3.5 mb-3.5 px-2.5 py-2 rounded-xl" style={{ background: 'rgba(6,182,212,0.07)' }}>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{opt.priceDescription}</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {saveError && (
                  <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <X size={13} /> {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle size={13} /> Saved — quotation approved!
                  </div>
                )}

                {/* Save CTA */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!selectedOption || isSaving || saveSuccess}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{
                      background: saveSuccess ? '#10b981' : '#06b6d4',
                      boxShadow: selectedOption && !isSaving ? '0 4px 14px rgba(6,182,212,0.35)' : 'none',
                    }}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    ) : saveSuccess ? (
                      <><CheckCircle size={15} /> Approved!</>
                    ) : (
                      'Approve & Save Selection'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer: date ── */}
          <p className="text-[11px] text-gray-400 text-center pb-1">
            Submitted {new Date(quotation.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>

        </div>
      </div>
    </Modal>
  );
}
