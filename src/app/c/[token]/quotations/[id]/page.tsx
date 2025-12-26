'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
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
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/c/${token}/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_option: optionNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to select option');
      }

      setQuotation(result.quotation);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to select option');
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error || 'Quotation not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const images = quotation.image_urls || quotation.product_images || (quotation.image_url ? [quotation.image_url] : []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`${basePath}/quotations`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {quotation.product_name || 'Quotation'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {quotation.quotation_id || quotation.id}
              </p>
            </div>
            <span className={`px-3 py-1 inline-flex items-center gap-1 text-sm font-semibold rounded-full ${
              quotation.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              quotation.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {quotation.status || 'Pending'}
            </span>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(0, 4).map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover w-full h-32"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity</h3>
              <p className="text-gray-900 dark:text-white">{quotation.quantity || 1}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</h3>
              <p className="text-gray-900 dark:text-white">
                {quotation.destination_city}, {quotation.destination_country}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Method</h3>
              <p className="text-gray-900 dark:text-white">{quotation.shipping_method || 'TBD'}</p>
            </div>
            {quotation.product_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product URL</h3>
                <a
                  href={quotation.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Product
                </a>
              </div>
            )}
          </div>

          {/* Price Options - Only show when Approved */}
          {quotation.status === 'Approved' && (quotation.total_price_option1 || quotation.total_price_option2 || quotation.total_price_option3) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Options</h3>
              <div className="space-y-4">
                {quotation.total_price_option1 && (() => {
                  // Parse image_option1 (can be JSON string or single URL)
                  let option1Images: string[] = [];
                  if (quotation.image_option1) {
                    try {
                      const parsed = JSON.parse(quotation.image_option1);
                      option1Images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                    } catch {
                      if (quotation.image_option1) option1Images = [quotation.image_option1];
                    }
                  }
                  
                  return (
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        quotation.selected_option === 1
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                      }`}
                      onClick={() => {
                        if (quotation.selected_option !== 1 && !isUpdating) {
                          handleSelectOption(1);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {option1Images.length > 0 && (
                          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image
                              src={option1Images[0]}
                              alt={quotation.title_option1 || 'Option 1'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {quotation.title_option1 || 'Option 1'}
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ${parseFloat(quotation.total_price_option1).toLocaleString()}
                          </p>
                          {quotation.description_option1 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {quotation.description_option1}
                            </p>
                          )}
                          {quotation.delivery_time_option1 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Delivery: {quotation.delivery_time_option1}
                            </p>
                          )}
                        </div>
                        {quotation.status === 'Approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOption(1);
                            }}
                            disabled={isUpdating || quotation.selected_option === 1}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                              quotation.selected_option === 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {quotation.selected_option === 1 ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {quotation.total_price_option2 && (() => {
                  // Parse image_option2 (can be JSON string or single URL)
                  let option2Images: string[] = [];
                  if (quotation.image_option2) {
                    try {
                      const parsed = JSON.parse(quotation.image_option2);
                      option2Images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                    } catch {
                      if (quotation.image_option2) option2Images = [quotation.image_option2];
                    }
                  }
                  
                  return (
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        quotation.selected_option === 2
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                      }`}
                      onClick={() => {
                        if (quotation.selected_option !== 2 && !isUpdating) {
                          handleSelectOption(2);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {option2Images.length > 0 && (
                          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image
                              src={option2Images[0]}
                              alt={quotation.title_option2 || 'Option 2'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {quotation.title_option2 || 'Option 2'}
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ${parseFloat(quotation.total_price_option2).toLocaleString()}
                          </p>
                          {quotation.description_option2 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {quotation.description_option2}
                            </p>
                          )}
                          {quotation.delivery_time_option2 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Delivery: {quotation.delivery_time_option2}
                            </p>
                          )}
                        </div>
                        {quotation.status === 'Approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOption(2);
                            }}
                            disabled={isUpdating || quotation.selected_option === 2}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                              quotation.selected_option === 2
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {quotation.selected_option === 2 ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {quotation.total_price_option3 && (() => {
                  // Parse image_option3 (can be JSON string or single URL)
                  let option3Images: string[] = [];
                  if (quotation.image_option3) {
                    try {
                      const parsed = JSON.parse(quotation.image_option3);
                      option3Images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                    } catch {
                      if (quotation.image_option3) option3Images = [quotation.image_option3];
                    }
                  }
                  
                  return (
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        quotation.selected_option === 3
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                      }`}
                      onClick={() => {
                        if (quotation.selected_option !== 3 && !isUpdating) {
                          handleSelectOption(3);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {option3Images.length > 0 && (
                          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image
                              src={option3Images[0]}
                              alt={quotation.title_option3 || 'Option 3'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {quotation.title_option3 || 'Option 3'}
                          </h4>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ${parseFloat(quotation.total_price_option3).toLocaleString()}
                          </p>
                          {quotation.description_option3 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {quotation.description_option3}
                            </p>
                          )}
                          {quotation.delivery_time_option3 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Delivery: {quotation.delivery_time_option3}
                            </p>
                          )}
                        </div>
                        {quotation.status === 'Approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOption(3);
                            }}
                            disabled={isUpdating || quotation.selected_option === 3}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                              quotation.selected_option === 3
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {quotation.selected_option === 3 ? 'Selected' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Actions */}
          {quotation.status === 'Pending' && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve Quotation
                  </>
                )}
              </button>
            </div>
          )}

          {quotation.status === 'Approved' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-400">
                This quotation has been approved. You can proceed to payment.
              </p>
              <Link
                href={`${basePath}/payments`}
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Payments
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

