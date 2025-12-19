'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { CloseIcon } from '@/icons';
import { Eye, Package, MapPin, Truck, FileText, Link as LinkIcon, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/button/Button';

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
  };
}

// Helper function to get country name from code
const getCountryName = (code: string): string => {
  if (!code) return code;
  
  // Filter out subdivision codes (codes with hyphens like "GB-ENG", "ES-CT")
  // These are ISO 3166-2 subdivision codes, not ISO 3166-1 country codes
  if (code.includes('-')) {
    // Extract the country part (before the hyphen)
    const countryCode = code.split('-')[0];
    code = countryCode;
  }
  
  // Validate it's a 2-letter country code
  if (code.length !== 2) {
    return code;
  }
  
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const name = displayNames.of(code.toUpperCase());
    return name || code;
  } catch {
    return code;
  }
};

// Helper function to get emoji flag from country code
const getCountryEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🏳️';
  }
};

interface PriceOption {
  id: number;
  title: string;
  price: string;
  description?: string;
  deliveryTime?: string;
  image?: string;
}

export default function QuotationReviewModal({ isOpen, onClose, quotation }: QuotationReviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPriceOptions, setShowPriceOptions] = useState(false);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Collect all images
  const allImages = [
    ...(quotation.image_url ? [quotation.image_url] : []),
    ...(quotation.product_images || [])
  ].filter(Boolean);

  // Fetch quotation with price options
  const fetchQuotationWithOptions = async () => {
    if (!quotation.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotation.id)
        .single();

      if (error) throw error;

      const typedData = data as {
        title_option1?: string | null;
        total_price_option1?: string | null;
        description_option1?: string | null;
        delivery_time_option1?: string | null;
        image_option1?: string | null;
        title_option2?: string | null;
        total_price_option2?: string | null;
        description_option2?: string | null;
        delivery_time_option2?: string | null;
        image_option2?: string | null;
        title_option3?: string | null;
        total_price_option3?: string | null;
        description_option3?: string | null;
        delivery_time_option3?: string | null;
        image_option3?: string | null;
        selected_option?: number | null;
        [key: string]: unknown;
      };

      // Build price options array
      const options: PriceOption[] = [];
      
      if (typedData.title_option1 || typedData.total_price_option1) {
        options.push({
          id: 1,
          title: typedData.title_option1 || 'Option 1',
          price: typedData.total_price_option1 || '0',
          description: typedData.description_option1 || undefined,
          deliveryTime: typedData.delivery_time_option1 || undefined,
          image: typedData.image_option1 || undefined,
        });
      }
      
      if (typedData.title_option2 || typedData.total_price_option2) {
        options.push({
          id: 2,
          title: typedData.title_option2 || 'Option 2',
          price: typedData.total_price_option2 || '0',
          description: typedData.description_option2 || undefined,
          deliveryTime: typedData.delivery_time_option2 || undefined,
          image: typedData.image_option2 || undefined,
        });
      }
      
      if (typedData.title_option3 || typedData.total_price_option3) {
        options.push({
          id: 3,
          title: typedData.title_option3 || 'Option 3',
          price: typedData.total_price_option3 || '0',
          description: typedData.description_option3 || undefined,
          deliveryTime: typedData.delivery_time_option3 || undefined,
          image: typedData.image_option3 || undefined,
        });
      }

      setPriceOptions(options);
      if (typedData.selected_option) {
        setSelectedOption(typedData.selected_option);
      }
      setShowPriceOptions(true);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('Failed to load quotation options. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save selected option
  const handleSaveOption = async () => {
    if (!selectedOption || !quotation.id) return;

    setIsSaving(true);
    try {
      const { error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('quotations') as any
      )
        .update({
          selected_option: selectedOption,
          status: 'Approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotation.id);

      if (error) throw error;

      alert('Quotation option saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving option:', error);
      alert('Failed to save quotation option. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPriceOptions(false);
      setSelectedOption(null);
      setPriceOptions([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-4xl h-auto mx-auto p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 rounded-lg">
            <Eye className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quotation Review</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{quotation.quotation_id}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-1 py-2">
        <div className="space-y-6">
          {/* Product Information Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Product Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white">
                  {quotation.product_name || '-'}
                </div>
              </div>

              {quotation.product_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product URL
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md">
                    <a
                      href={quotation.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#06b6d4] hover:underline flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {quotation.product_url}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity Required
                </label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white">
                  {quotation.quantity || '-'}
                </div>
              </div>

              {/* Product Images */}
              {allImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Images ({allImages.length})
                  </label>
                  <div className="space-y-3">
                    {/* Main Image Display */}
                    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {allImages[selectedImageIndex] ? (
                        <Image
                          src={allImages[selectedImageIndex]}
                          alt={`Product image ${selectedImageIndex + 1}`}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index
                                ? 'border-[#06b6d4]'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {quotation.variant_specs && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant/Specs
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white whitespace-pre-wrap">
                    {quotation.variant_specs}
                  </div>
                </div>
              )}

              {quotation.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white whitespace-pre-wrap">
                    {quotation.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Shipping Information</h3>
            </div>
            
            <div className="space-y-4">
              {quotation.destination_country && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination Country
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="text-xl">{getCountryEmoji(quotation.destination_country)}</span>
                    <span>{getCountryName(quotation.destination_country)}</span>
                  </div>
                </div>
              )}

              {quotation.destination_city && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination City
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white">
                    {quotation.destination_city}
                  </div>
                </div>
              )}

              {quotation.shipping_method && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Shipping Method
                  </label>
                  <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#06b6d4]" />
                    <span>{quotation.shipping_method}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Details Section */}
          {quotation.service_type && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#06b6d4]" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Service Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Type
                </label>
                <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white">
                  {quotation.service_type}
                </div>
              </div>
            </div>
          )}

          {/* Price Options Section */}
          {showPriceOptions && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Price Options</h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
                </div>
              ) : priceOptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {priceOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                          selectedOption === option.id
                            ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {option.image && (
                          <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                            <Image
                              src={option.image}
                              alt={option.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {option.title}
                        </h4>
                        <p className="text-xl font-bold text-[#06b6d4] mb-2">
                          ${parseFloat(option.price || '0').toLocaleString()}
                        </p>
                        {option.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {option.description}
                          </p>
                        )}
                        {option.deliveryTime && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Delivery: {option.deliveryTime}
                          </p>
                        )}
                        {selectedOption === option.id && (
                          <div className="mt-3 flex items-center gap-2 text-[#06b6d4]">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleSaveOption}
                      disabled={!selectedOption || isSaving}
                      variant="primary"
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Selection'
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPriceOptions(false);
                        setSelectedOption(null);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No price options available for this quotation.
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span>Created: {new Date(quotation.created_at).toLocaleString()}</span>
            <div className="flex items-center gap-3">
              {quotation.status && (
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  Status: {quotation.status}
                </span>
              )}
              {!showPriceOptions && (
                <Button
                  onClick={fetchQuotationWithOptions}
                  disabled={isLoading}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Start Making Quotation
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

