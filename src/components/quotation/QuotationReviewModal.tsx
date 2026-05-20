'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { CloseIcon } from '@/icons';
import {
  Eye, Package, MapPin, Truck, FileText, Link as LinkIcon,
  Image as ImageIcon, CheckCircle, Loader2, Layers, X,
  Clock, ExternalLink, DollarSign, Weight, AlignLeft, Tag,
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
  title: '', totalPrice: '', pricePerUnit: '',
  description: '', deliveryTime: '', imageUrl: '', priceDescription: '',
});

const OPTION_THEMES = [
  { label: 'Standard', accent: '#6366f1', light: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-700', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
  { label: 'Popular',  accent: '#06b6d4', light: 'bg-cyan-50 dark:bg-cyan-950/30',    border: 'border-cyan-200 dark:border-cyan-700',     badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
  { label: 'Premium',  accent: '#f59e0b', light: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-700',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
];

export default function QuotationReviewModal({ isOpen, onClose, quotation }: QuotationReviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'product' | 'pricing'>('product');

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
        .select('*').eq('id', quotation.id).single();
      if (error) throw error;
      const d = data as Record<string, string | number | null>;
      const parseImages = (v?: string | null) => {
        if (!v) return '';
        try { const p = JSON.parse(v); return Array.isArray(p) ? p[0] || '' : v; }
        catch { return v; }
      };
      setOptions([
        { title: (d.title_option1 as string) || '', totalPrice: (d.total_price_option1 as string) || '', pricePerUnit: (d.price_per_unit_option1 as string) || '', description: (d.description_option1 as string) || '', deliveryTime: (d.delivery_time_option1 as string) || '', imageUrl: parseImages(d.image_option1 as string), priceDescription: (d.price_description_option1 as string) || '' },
        { title: (d.title_option2 as string) || '', totalPrice: (d.total_price_option2 as string) || '', pricePerUnit: (d.price_per_unit_option2 as string) || '', description: (d.description_option2 as string) || '', deliveryTime: (d.delivery_time_option2 as string) || '', imageUrl: parseImages(d.image_option2 as string), priceDescription: (d.price_description_option2 as string) || '' },
        { title: (d.title_option3 as string) || '', totalPrice: (d.total_price_option3 as string) || '', pricePerUnit: (d.price_per_unit_option3 as string) || '', description: (d.description_option3 as string) || '', deliveryTime: (d.delivery_time_option3 as string) || '', imageUrl: parseImages(d.image_option3 as string), priceDescription: (d.price_description_option3 as string) || '' },
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
      setActiveTab('product');
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
      setSaveError('Please select one option to present to the client.');
      return;
    }
    setIsSaving(true);
    setSaveError('');
    const [o1, o2, o3] = options;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('quotations') as any).update({
        title_option1: o1.title || null, total_price_option1: o1.totalPrice || null, price_per_unit_option1: o1.pricePerUnit || null, description_option1: o1.description || null, delivery_time_option1: o1.deliveryTime || null, image_option1: o1.imageUrl || null, price_description_option1: o1.priceDescription || null,
        title_option2: o2.title || null, total_price_option2: o2.totalPrice || null, price_per_unit_option2: o2.pricePerUnit || null, description_option2: o2.description || null, delivery_time_option2: o2.deliveryTime || null, image_option2: o2.imageUrl || null, price_description_option2: o2.priceDescription || null,
        title_option3: o3.title || null, total_price_option3: o3.totalPrice || null, price_per_unit_option3: o3.pricePerUnit || null, description_option3: o3.description || null, delivery_time_option3: o3.deliveryTime || null, image_option3: o3.imageUrl || null, price_description_option3: o3.priceDescription || null,
        selected_option: selectedOption, status: 'Approved', updated_at: new Date().toISOString(),
      }).eq('id', quotation.id);
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

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-colors';
  const labelCls = 'block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5';

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-5xl mx-auto p-0 overflow-hidden rounded-2xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
            <Eye className="w-4.5 h-4.5 text-[#06b6d4]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Quotation Review</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{quotation.quotation_id}</p>
          </div>
          {quotation.status && (
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[quotation.status] || 'bg-gray-100 text-gray-600'}`}>
              {quotation.status}
            </span>
          )}
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 px-6">
        {[
          { key: 'product', label: 'Product Information', icon: Package },
          { key: 'pricing', label: 'Price Options', icon: DollarSign },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'product' | 'pricing')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-[#06b6d4] text-[#06b6d4]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === 'pricing' && selectedOption && (
              <span className="ml-1 w-4 h-4 rounded-full bg-[#06b6d4] text-white text-[9px] font-bold flex items-center justify-center">
                {selectedOption}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto bg-gray-50 dark:bg-gray-900/50">

        {/* ════════════════════ PRODUCT INFO TAB ════════════════════ */}
        {activeTab === 'product' && (
          <div className="p-6 space-y-5">

            {/* Product hero card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex flex-col md:flex-row">

                {/* Image gallery */}
                {allImages.length > 0 ? (
                  <div className="md:w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col gap-3">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <Image src={allImages[selectedImageIndex]} alt="Product" fill className="object-contain" unoptimized />
                    </div>
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allImages.map((img, i) => (
                          <button key={i} onClick={() => setSelectedImageIndex(i)}
                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === i
                                ? 'border-[#06b6d4] shadow-sm shadow-[#06b6d4]/20'
                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}>
                            <Image src={img} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-center text-[11px] text-gray-400">{allImages.length} image{allImages.length !== 1 ? 's' : ''}</p>
                  </div>
                ) : (
                  <div className="md:w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400">No images</p>
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 p-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Product Name</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{quotation.product_name || '—'}</h3>
                  </div>

                  {quotation.product_url && (
                    <a href={quotation.product_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#06b6d4] hover:text-[#0891b2] font-medium transition-colors">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[260px]">{quotation.product_url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <Package className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Qty: {quotation.quantity}</span>
                    </div>
                    {quotation.service_type && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                        <FileText className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{quotation.service_type}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400">Submitted {new Date(quotation.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Shipping */}
                  {(quotation.destination_country || quotation.destination_city || quotation.shipping_method) && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {quotation.destination_country && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{getCountryEmoji(quotation.destination_country)}</span>
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Destination</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {getCountryName(quotation.destination_country)}{quotation.destination_city ? `, ${quotation.destination_city}` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      {quotation.shipping_method && (
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Shipping</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{quotation.shipping_method}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Variant Groups */}
            {quotation.variant_groups && quotation.variant_groups.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Variant Groups</h3>
                </div>
                <div className="space-y-3">
                  {quotation.variant_groups.map((group, gi) => (
                    <div key={gi}>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{group.name || `Group ${gi + 1}`}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.values?.map((v, vi) => (
                          <div key={vi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            {v.images?.[0] && (
                              <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                <Image src={v.images[0]} alt={v.name} fill className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{v.name}</span>
                            {v.moq && <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full">MOQ {v.moq}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Specs */}
            {(quotation.notes || quotation.variant_specs) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quotation.notes && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlignLeft className="w-4 h-4 text-gray-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Client Notes</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
                  </div>
                )}
                {quotation.variant_specs && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Variant Specs</h4>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{quotation.variant_specs}</p>
                  </div>
                )}
              </div>
            )}

            {/* CTA to move to pricing tab */}
            <div className="flex justify-end pt-1">
              <Button onClick={() => setActiveTab('pricing')} variant="primary" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Set Price Options
              </Button>
            </div>
          </div>
        )}

        {/* ════════════════════ PRICING TAB ════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="p-6 space-y-5">

            {/* Instruction banner */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10 border border-[#06b6d4]/20 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Fill in up to <strong className="text-gray-900 dark:text-white">3 price options</strong> and select one to present to the client.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#06b6d4]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((opt, idx) => {
                  const num = idx + 1;
                  const isSelected = selectedOption === num;
                  const hasContent = !!(opt.title || opt.totalPrice);
                  const theme = OPTION_THEMES[idx];

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 bg-white dark:bg-gray-900 flex flex-col ${
                        isSelected
                          ? `border-[${theme.accent}] shadow-lg`
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                      style={isSelected ? { borderColor: theme.accent, boxShadow: `0 0 0 1px ${theme.accent}20, 0 4px 20px ${theme.accent}15` } : {}}
                    >
                      {/* Card header */}
                      <div
                        className={`px-4 py-3 flex items-center justify-between ${isSelected ? theme.light : 'bg-gray-50 dark:bg-gray-800/50'}`}
                        style={isSelected ? { borderBottom: `2px solid ${theme.accent}30` } : { borderBottom: '1px solid #e5e7eb' }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: isSelected ? theme.accent : '#9ca3af' }}
                          >
                            {num}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Option {num}</p>
                            <p className="text-[10px] text-gray-400">{theme.label}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOption(isSelected ? null : num)}
                          disabled={!hasContent && !isSelected}
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                            isSelected
                              ? 'text-white shadow-sm'
                              : hasContent
                              ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
                          }`}
                          style={isSelected ? { backgroundColor: theme.accent } : {}}
                        >
                          {isSelected
                            ? <><CheckCircle className="w-2.5 h-2.5" /> Selected</>
                            : <>Select</>
                          }
                        </button>
                      </div>

                      {/* Image area */}
                      <div className="relative mx-4 mt-4 h-32 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                        {opt.imageUrl ? (
                          <>
                            <Image src={opt.imageUrl} alt={`Option ${num}`} fill className="object-cover" unoptimized />
                            <button
                              type="button"
                              onClick={() => updateOption(idx, 'imageUrl', '')}
                              className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                            <ImageIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                            <p className="text-[11px] text-gray-400">No image</p>
                          </div>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="p-4 space-y-3 flex-1">

                        {/* Title */}
                        <div>
                          <label className={labelCls}>Title *</label>
                          <input type="text" value={opt.title} onChange={e => updateOption(idx, 'title', e.target.value)}
                            placeholder={`e.g. ${theme.label}`} className={inputCls} />
                        </div>

                        {/* Price row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelCls}>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Total Price</span>
                            </label>
                            <input type="text" value={opt.totalPrice} onChange={e => updateOption(idx, 'totalPrice', e.target.value)}
                              placeholder="e.g. 4500" className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Per Unit</label>
                            <input type="text" value={opt.pricePerUnit} onChange={e => updateOption(idx, 'pricePerUnit', e.target.value)}
                              placeholder="e.g. 9.00" className={inputCls} />
                          </div>
                        </div>

                        {/* Delivery */}
                        <div>
                          <label className={labelCls}>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Delivery Time</span>
                          </label>
                          <input type="text" value={opt.deliveryTime} onChange={e => updateOption(idx, 'deliveryTime', e.target.value)}
                            placeholder="e.g. 15–20 days" className={inputCls} />
                        </div>

                        {/* Image URL */}
                        <div>
                          <label className={labelCls}>Image URL</label>
                          <input type="url" value={opt.imageUrl} onChange={e => updateOption(idx, 'imageUrl', e.target.value)}
                            placeholder="https://..." className={inputCls} />
                        </div>

                        {/* Description */}
                        <div>
                          <label className={labelCls}>
                            <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />Description</span>
                          </label>
                          <textarea rows={2} value={opt.description} onChange={e => updateOption(idx, 'description', e.target.value)}
                            placeholder="Details about this option..." className={`${inputCls} resize-none`} />
                        </div>

                        {/* Pricing note */}
                        <div>
                          <label className={labelCls}>
                            <span className="flex items-center gap-1"><Weight className="w-3 h-3" />Pricing Note</span>
                          </label>
                          <input type="text" value={opt.priceDescription} onChange={e => updateOption(idx, 'priceDescription', e.target.value)}
                            placeholder="e.g. Includes customs" className={inputCls} />
                        </div>
                      </div>

                      {/* Card footer: price summary */}
                      {(opt.totalPrice || opt.pricePerUnit) && (
                        <div
                          className="px-4 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between"
                          style={{ background: isSelected ? `${theme.accent}08` : undefined }}
                        >
                          {opt.totalPrice && (
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
                              <p className="text-base font-bold" style={{ color: theme.accent }}>${opt.totalPrice}</p>
                            </div>
                          )}
                          {opt.pricePerUnit && (
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Per Unit</p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">${opt.pricePerUnit}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
            {saveError && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <X className="w-4 h-4 flex-shrink-0" /> {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> Saved — quotation approved!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {selectedOption ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#06b6d4]" />
              <span>Option <strong className="text-[#06b6d4]">{selectedOption}</strong> selected</span>
            </span>
          ) : (
            <span className="text-gray-400">No option selected yet</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onClose} variant="outline" size="sm">Cancel</Button>
          {activeTab === 'product' ? (
            <Button onClick={() => setActiveTab('pricing')} variant="primary" size="sm" className="gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Set Prices
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving || saveSuccess} variant="primary" size="sm" className="gap-1.5 min-w-[140px]">
              {isSaving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><CheckCircle className="w-3.5 h-3.5" /> Approved!</>
              ) : (
                <><CheckCircle className="w-3.5 h-3.5" /> Save & Approve</>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
