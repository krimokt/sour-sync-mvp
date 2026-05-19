'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { CloseIcon } from '@/icons';
import {
  Eye, Package, MapPin, Truck, FileText, Link as LinkIcon,
  Image as ImageIcon, CheckCircle, Loader2, Layers, Pencil, Plus, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/button/Button';
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
    return String.fromCodePoint(
      ...code.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt(0))
    );
  } catch { return '🏳️'; }
};

interface EditableOption {
  title: string;
  totalPrice: string;
  pricePerUnit: string;
  description: string;
  deliveryTime: string;
  imageUrl: string;
  priceDescription: string;
}

const emptyOption = (): EditableOption => ({
  title: '',
  totalPrice: '',
  pricePerUnit: '',
  description: '',
  deliveryTime: '',
  imageUrl: '',
  priceDescription: '',
});

export default function QuotationReviewModal({ isOpen, onClose, quotation }: QuotationReviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Three editable option slots
  const [options, setOptions] = useState<[EditableOption, EditableOption, EditableOption]>([
    emptyOption(), emptyOption(), emptyOption(),
  ]);

  const allImages = [
    ...(quotation.image_url ? [quotation.image_url] : []),
    ...(quotation.product_images || []),
  ].filter(Boolean);

  const fetchOptions = useCallback(async () => {
    if (!quotation.id) return;
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('quotations') as any)
        .select('*')
        .eq('id', quotation.id)
        .single();

      if (error) throw error;

      const d = data as Record<string, string | number | null>;
      const parseImages = (v?: string | null) => {
        if (!v) return '';
        try { const p = JSON.parse(v); return Array.isArray(p) ? p[0] || '' : v; }
        catch { return v; }
      };

      setOptions([
        {
          title: (d.title_option1 as string) || '',
          totalPrice: (d.total_price_option1 as string) || '',
          pricePerUnit: (d.price_per_unit_option1 as string) || '',
          description: (d.description_option1 as string) || '',
          deliveryTime: (d.delivery_time_option1 as string) || '',
          imageUrl: parseImages(d.image_option1 as string),
          priceDescription: (d.price_description_option1 as string) || '',
        },
        {
          title: (d.title_option2 as string) || '',
          totalPrice: (d.total_price_option2 as string) || '',
          pricePerUnit: (d.price_per_unit_option2 as string) || '',
          description: (d.description_option2 as string) || '',
          deliveryTime: (d.delivery_time_option2 as string) || '',
          imageUrl: parseImages(d.image_option2 as string),
          priceDescription: (d.price_description_option2 as string) || '',
        },
        {
          title: (d.title_option3 as string) || '',
          totalPrice: (d.total_price_option3 as string) || '',
          pricePerUnit: (d.price_per_unit_option3 as string) || '',
          description: (d.description_option3 as string) || '',
          deliveryTime: (d.delivery_time_option3 as string) || '',
          imageUrl: parseImages(d.image_option3 as string),
          priceDescription: (d.price_description_option3 as string) || '',
        },
      ]);

      if (d.selected_option) setSelectedOption(d.selected_option as number);
    } catch (e) {
      console.error('Error loading options:', e);
    } finally {
      setIsLoading(false);
    }
  }, [quotation.id]);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      setSaveError('');
      setSaveSuccess(false);
    } else {
      setOptions([emptyOption(), emptyOption(), emptyOption()]);
      setSelectedOption(null);
      setSelectedImageIndex(0);
    }
  }, [isOpen, fetchOptions]);

  const updateOption = (idx: number, field: keyof EditableOption, value: string) => {
    setOptions(prev => {
      const next = [...prev] as [EditableOption, EditableOption, EditableOption];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    if (!quotation.id) return;
    if (!selectedOption) {
      setSaveError('Please select one of the options to present to the client.');
      return;
    }
    setIsSaving(true);
    setSaveError('');

    const [o1, o2, o3] = options;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('quotations') as any)
        .update({
          title_option1: o1.title || null,
          total_price_option1: o1.totalPrice || null,
          price_per_unit_option1: o1.pricePerUnit || null,
          description_option1: o1.description || null,
          delivery_time_option1: o1.deliveryTime || null,
          image_option1: o1.imageUrl || null,
          price_description_option1: o1.priceDescription || null,
          title_option2: o2.title || null,
          total_price_option2: o2.totalPrice || null,
          price_per_unit_option2: o2.pricePerUnit || null,
          description_option2: o2.description || null,
          delivery_time_option2: o2.deliveryTime || null,
          image_option2: o2.imageUrl || null,
          price_description_option2: o2.priceDescription || null,
          title_option3: o3.title || null,
          total_price_option3: o3.totalPrice || null,
          price_per_unit_option3: o3.pricePerUnit || null,
          description_option3: o3.description || null,
          delivery_time_option3: o3.deliveryTime || null,
          image_option3: o3.imageUrl || null,
          price_description_option3: o3.priceDescription || null,
          selected_option: selectedOption,
          status: 'Approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotation.id);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => onClose(), 900);
    } catch (e) {
      setSaveError('Failed to save. Please try again.');
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40 focus:border-[#06b6d4]';
  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-4xl h-auto mx-auto p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 rounded-lg">
            <Eye className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quotation Review</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.quotation_id}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-1 space-y-5">

        {/* ── Product Information ── */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#06b6d4]" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Product Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Product Name</label>
              <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm">
                {quotation.product_name || '—'}
              </div>
            </div>

            {quotation.product_url && (
              <div>
                <label className={labelCls}>Product URL</label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md">
                  <a href={quotation.product_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#06b6d4] hover:underline flex items-center gap-2 text-sm">
                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{quotation.product_url}</span>
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Quantity</label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm">
                  {quotation.quantity || '—'}
                </div>
              </div>
              {quotation.service_type && (
                <div>
                  <label className={labelCls}>Service Type</label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#06b6d4]" />
                    {quotation.service_type}
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            {allImages.length > 0 && (
              <div>
                <label className={labelCls}>Product Images ({allImages.length})</label>
                <div className="space-y-2">
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    {allImages[selectedImageIndex] && (
                      <Image src={allImages[selectedImageIndex]} alt="Product" fill className="object-contain" unoptimized />
                    )}
                    {!allImages[selectedImageIndex] && (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, i) => (
                        <button key={i} onClick={() => setSelectedImageIndex(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === i ? 'border-[#06b6d4]' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          <Image src={img} alt={`Thumb ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {quotation.notes && (
              <div>
                <label className={labelCls}>Client Notes</label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm whitespace-pre-wrap">
                  {quotation.notes}
                </div>
              </div>
            )}

            {quotation.variant_specs && (
              <div>
                <label className={labelCls}>Variant Specs</label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm whitespace-pre-wrap">
                  {quotation.variant_specs}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Variant Groups ── */}
        {quotation.variant_groups && quotation.variant_groups.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Variant Groups</h3>
            </div>
            <div className="space-y-3">
              {quotation.variant_groups.map((group, gi) => (
                <div key={gi} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{group.name || `Group ${gi + 1}`}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.values?.map((v, vi) => (
                      <div key={vi} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {v.images?.[0] && (
                          <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
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

        {/* ── Shipping ── */}
        {(quotation.destination_country || quotation.destination_city || quotation.shipping_method) && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Shipping Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quotation.destination_country && (
                <div>
                  <label className={labelCls}>Country</label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm flex items-center gap-2">
                    <span>{getCountryEmoji(quotation.destination_country)}</span>
                    <span>{getCountryName(quotation.destination_country)}</span>
                  </div>
                </div>
              )}
              {quotation.destination_city && (
                <div>
                  <label className={labelCls}>City</label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm">
                    {quotation.destination_city}
                  </div>
                </div>
              )}
              {quotation.shipping_method && (
                <div>
                  <label className={labelCls}>Method</label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-white text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#06b6d4]" />
                    {quotation.shipping_method}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Editable Price Options ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#06b6d4]" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Price Options</h3>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              <span className="text-xs text-gray-400">Select one to present to the client</span>
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((opt, idx) => {
                  const num = idx + 1;
                  const isSelected = selectedOption === num;
                  const hasContent = opt.title || opt.totalPrice;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-[#06b6d4] shadow-[0_0_0_1px_#06b6d4]'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Option header */}
                      <div
                        className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
                          isSelected
                            ? 'border-[#06b6d4]/20 bg-[#06b6d4]/5'
                            : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold"
                            style={isSelected
                              ? { background: '#06b6d4', color: '#fff' }
                              : { background: '#e5e7eb', color: '#6b7280' }
                            }
                          >
                            {num}
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Option {num}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOption(isSelected ? null : num)}
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full transition-all ${
                            isSelected
                              ? 'bg-[#06b6d4] text-white'
                              : hasContent
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-300 cursor-not-allowed'
                          }`}
                          disabled={!hasContent && !isSelected}
                        >
                          {isSelected ? <><CheckCircle size={9} /> Selected</> : <><Plus size={9} /> Select</>}
                        </button>
                      </div>

                      {/* Editable fields */}
                      <div className="p-3.5 space-y-2.5">
                        {/* Image preview */}
                        {opt.imageUrl && (
                          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-1">
                            <Image src={opt.imageUrl} alt={`Option ${num}`} fill className="object-cover" unoptimized />
                            <button
                              type="button"
                              onClick={() => updateOption(idx, 'imageUrl', '')}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}

                        <div>
                          <label className={labelCls}>Image URL</label>
                          <input
                            type="url"
                            value={opt.imageUrl}
                            onChange={e => updateOption(idx, 'imageUrl', e.target.value)}
                            placeholder="https://..."
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Title *</label>
                          <input
                            type="text"
                            value={opt.title}
                            onChange={e => updateOption(idx, 'title', e.target.value)}
                            placeholder={`Option ${num} title`}
                            className={inputCls}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelCls}>Total Price</label>
                            <input
                              type="text"
                              value={opt.totalPrice}
                              onChange={e => updateOption(idx, 'totalPrice', e.target.value)}
                              placeholder="e.g. 4500"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Per Unit</label>
                            <input
                              type="text"
                              value={opt.pricePerUnit}
                              onChange={e => updateOption(idx, 'pricePerUnit', e.target.value)}
                              placeholder="e.g. 9.00"
                              className={inputCls}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Delivery Time</label>
                          <input
                            type="text"
                            value={opt.deliveryTime}
                            onChange={e => updateOption(idx, 'deliveryTime', e.target.value)}
                            placeholder="e.g. 15–20 days"
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Description</label>
                          <textarea
                            rows={2}
                            value={opt.description}
                            onChange={e => updateOption(idx, 'description', e.target.value)}
                            placeholder="Details about this option..."
                            className={`${inputCls} resize-none`}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Pricing Note</label>
                          <input
                            type="text"
                            value={opt.priceDescription}
                            onChange={e => updateOption(idx, 'priceDescription', e.target.value)}
                            placeholder="e.g. Includes customs"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
            {saveError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <X size={14} /> {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle size={14} /> Saved — quotation approved!
              </div>
            )}

            {/* Actions */}
            {!isLoading && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  variant="primary"
                  className="flex-1"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : saveSuccess ? (
                    <><CheckCircle className="w-4 h-4 mr-2" />Approved!</>
                  ) : (
                    'Save Options & Approve'
                  )}
                </Button>
                <Button onClick={onClose} variant="outline">Cancel</Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pb-2">
          <span>Submitted {new Date(quotation.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          {quotation.status && (
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {quotation.status}
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
