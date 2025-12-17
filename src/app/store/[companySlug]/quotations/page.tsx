'use client';

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/context/StoreContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import { Send, CheckCircle, Clock, X, Eye, Edit, Save, Loader2, Upload, Trash2 } from 'lucide-react';
import QuotationReviewModal from '@/components/quotation/QuotationReviewModal';
import { Modal } from '@/components/ui/modal';

// Constants
const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

interface QuotationData {
  id: string;
  quotation_id: string;
  product_name: string;
  product_url?: string;
  quantity: number;
  status: string;
  created_at: string;
  destination_country: string;
  destination_city: string;
  shipping_method: string;
  service_type: string;
  image_url?: string;
  product_images?: string[];
  variant_specs?: string;
  notes?: string;
  total_price_option1?: string;
  user_id?: string;
}

interface QuotationMetrics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface CustomTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  isHeader?: boolean;
}

const TableCell = ({ className, children, colSpan, isHeader, ...props }: CustomTableCellProps) => {
  if (isHeader) {
    return (
      <th className={className} colSpan={colSpan} {...props}>
        {children}
      </th>
    );
  }
  return (
    <td className={className} colSpan={colSpan} {...props}>
      {children}
    </td>
  );
};

export default function QuotationsPage() {
  const { company } = useStore();
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('All');
  const [metrics, setMetrics] = useState<QuotationMetrics>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPriceOptionsModalOpen, setIsPriceOptionsModalOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!company?.id) {
      setError('No company found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query with company filter
      let query = supabase
        .from('quotations')
        .select('*', { count: 'exact' })
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (selectedStatus !== 'All') {
        query = query.eq('status', selectedStatus);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`product_name.ilike.%${searchQuery}%,quotation_id.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setQuotations(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from('quotations')
        .select('status')
        .eq('company_id', company.id);

      if (metricsData) {
        setMetrics({
          total: metricsData.length,
          approved: metricsData.filter((q) => q.status === 'Approved').length,
          pending: metricsData.filter((q) => q.status === 'Pending').length,
          rejected: metricsData.filter((q) => q.status === 'Rejected').length,
        });
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, currentPage, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
      Approved: 'success',
      Pending: 'warning',
      Rejected: 'error',
    };
    return <Badge variant={statusColors[status] || 'warning'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditPriceOptions = (quotation: QuotationData) => {
    setEditingQuotationId(quotation.id);
    setIsPriceOptionsModalOpen(true);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Quotations" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <StatCard
          title="Total Quotations"
          value={metrics.total}
          variant="dark"
          icon={<Send className="w-5 h-5" />}
        />
        <StatCard
          title="Approved"
          value={metrics.approved}
          icon={<CheckCircle className="w-5 h-5 text-green-500" style={{ color: 'rgba(0, 130, 54, 1)' }} />}
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          title="Rejected"
          value={metrics.rejected}
          icon={<X className="w-5 h-5 text-red-500" style={{ color: 'rgba(0, 144, 242, 1)' }} />}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </Button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search quotations..."
          className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-center">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No quotations found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Product
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Quotation ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Quantity
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Destination
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {quotation.image_url || quotation.product_images?.[0] ? (
                        <Image
                          src={quotation.image_url || quotation.product_images?.[0] || ''}
                          alt={quotation.product_name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg dark:bg-gray-700" />
                      )}
                      <span className="font-medium text-gray-800 dark:text-white">
                        {quotation.product_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {quotation.quotation_id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {quotation.quantity}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {quotation.destination_city}, {quotation.destination_country}
                  </TableCell>
                  <TableCell className="px-5 py-4">{getStatusBadge(quotation.status)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {formatDate(quotation.created_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuotation(quotation);
                          setIsReviewModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-[#06b6d4] dark:hover:text-[#06b6d4]"
                        title="Review quotation details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPriceOptions(quotation)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-green-600 dark:hover:text-green-500"
                        title="Edit price options"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Quotation Review Modal */}
      {selectedQuotation && (
        <QuotationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedQuotation(null);
          }}
          quotation={selectedQuotation}
        />
      )}

      {/* Price Options Modal */}
      {editingQuotationId && (
        <PriceOptionsEditModal
          isOpen={isPriceOptionsModalOpen}
          onClose={() => {
            setIsPriceOptionsModalOpen(false);
            setEditingQuotationId(null);
          }}
          quotationId={editingQuotationId}
          onSave={() => {
            fetchData();
            setIsPriceOptionsModalOpen(false);
            setEditingQuotationId(null);
          }}
        />
      )}
    </>
  );
}

// Price Options Edit Modal Component
interface PriceOptionsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  onSave: () => void;
}

function PriceOptionsEditModal({ isOpen, onClose, quotationId, onSave }: PriceOptionsEditModalProps) {
  const { company } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [quantity, setQuantity] = useState<number>(0);
  const [formData, setFormData] = useState({
    title_option1: '',
    total_price_option1: '',
    price_per_unit_option1: '',
    delivery_time_option1: '',
    description_option1: '',
    image_option1: '',
    price_description_option1: '',
    title_option2: '',
    total_price_option2: '',
    price_per_unit_option2: '',
    delivery_time_option2: '',
    description_option2: '',
    image_option2: '',
    price_description_option2: '',
    title_option3: '',
    total_price_option3: '',
    price_per_unit_option3: '',
    delivery_time_option3: '',
    description_option3: '',
    image_option3: '',
    price_description_option3: '',
    selected_option: '',
    quotation_fees: '',
  });

  // Fetch existing data
  useEffect(() => {
    if (isOpen && quotationId) {
      fetchQuotationData();
    }
  }, [isOpen, quotationId]);

  const fetchQuotationData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId)
        .single();

      if (error) throw error;

      if (data) {
        // Get quantity from quotation
        const quotationQuantity = data.quantity ? Number(data.quantity) : 0;
        setQuantity(quotationQuantity);

        // Parse image fields - they might be JSON arrays or single URLs
        const parseImages = (imageField: string | null | undefined): string[] => {
          if (!imageField) return [];
          try {
            const parsed = JSON.parse(imageField);
            return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
          } catch {
            return imageField ? [imageField] : [];
          }
        };

        setFormData({
          title_option1: data.title_option1 || '',
          total_price_option1: data.total_price_option1 || '',
          price_per_unit_option1: data.price_per_unit_option1 || '',
          delivery_time_option1: data.delivery_time_option1 || '',
          description_option1: data.description_option1 || '',
          image_option1: JSON.stringify(parseImages(data.image_option1)),
          price_description_option1: data.price_description_option1 || '',
          title_option2: data.title_option2 || '',
          total_price_option2: data.total_price_option2 || '',
          price_per_unit_option2: data.price_per_unit_option2 || '',
          delivery_time_option2: data.delivery_time_option2 || '',
          description_option2: data.description_option2 || '',
          image_option2: JSON.stringify(parseImages(data.image_option2)),
          price_description_option2: data.price_description_option2 || '',
          title_option3: data.title_option3 || '',
          total_price_option3: data.total_price_option3 || '',
          price_per_unit_option3: data.price_per_unit_option3 || '',
          delivery_time_option3: data.delivery_time_option3 || '',
          description_option3: data.description_option3 || '',
          image_option3: JSON.stringify(parseImages(data.image_option3)),
          price_description_option3: data.price_description_option3 || '',
          selected_option: data.selected_option?.toString() || '',
          quotation_fees: data.quotation_fees || '',
        });
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('Failed to load quotation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Optimized: Only parse and include fields that have values
      const parseImageField = (field: string): string | null => {
        if (!field || field.trim() === '') return null;
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return JSON.stringify(parsed);
          }
          return parsed || null;
        } catch {
          return field || null;
        }
      };

      // Build update data object - only include non-empty fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        updated_at: new Date().toISOString(),
        status: 'Approved',
      };

      // Helper to add field only if it has a value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addField = (key: string, value: any) => {
        if (value !== null && value !== undefined && value !== '') {
          updateData[key] = value;
        }
      };

      // Process each option
      for (let i = 1; i <= 3; i++) {
        addField(`title_option${i}`, formData[`title_option${i}` as keyof typeof formData]);
        addField(`total_price_option${i}`, formData[`total_price_option${i}` as keyof typeof formData]);
        addField(`price_per_unit_option${i}`, formData[`price_per_unit_option${i}` as keyof typeof formData]);
        addField(`delivery_time_option${i}`, formData[`delivery_time_option${i}` as keyof typeof formData]);
        addField(`description_option${i}`, formData[`description_option${i}` as keyof typeof formData]);
        addField(`price_description_option${i}`, formData[`price_description_option${i}` as keyof typeof formData]);
        
        // Parse image field only if it exists
        const imageField = formData[`image_option${i}` as keyof typeof formData];
        if (imageField) {
          const parsed = parseImageField(imageField);
          if (parsed) addField(`image_option${i}`, parsed);
        }
      }

      addField('quotation_fees', formData.quotation_fees);
      
      // Handle selected_option
      if (formData.selected_option) {
        const selected = parseInt(formData.selected_option, 10);
        if (!isNaN(selected) && selected >= 1 && selected <= 3) {
          updateData.selected_option = selected;
        }
      }

      // Use API route with service role key (bypasses RLS)
      const companySlug = company?.slug || 'default';
      
      // Optimized: Use AbortController for timeout and faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch(`/api/store/${companySlug}/quotations/${quotationId}/price-options`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const result = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(result.error || 'Failed to save price options');
        }

        // Optimistic UI update - close modal immediately
        onSave();
        
        // Show success message after a brief delay
        setTimeout(() => {
          alert('Price options saved successfully!');
        }, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error saving price options:', error);
      alert(`Failed to save price options: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Image compression helper
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (files: FileList, optionNumber: 1 | 2 | 3) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    const fieldKey = `image_option${optionNumber}` as keyof typeof formData;
    const currentImages = (() => {
      try {
        const parsed = JSON.parse(formData[fieldKey] || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    setUploadingImages({ ...uploadingImages, [`option${optionNumber}`]: true });

    try {
      // Compress images in parallel
      const compressedFiles = await Promise.all(
        imageFiles.map(file => compressImage(file))
      );

      // Upload all images in parallel
      const uploadPromises = compressedFiles.map(async (file, index) => {
        try {
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `quotation-${quotationId}/option${optionNumber}/${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('price_option_images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback: convert to base64 (only if upload fails)
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            return base64;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('price_option_images')
              .getPublicUrl(fileName);
            return publicUrl;
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          // Fallback to base64 on error
          const reader = new FileReader();
          return new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
      });

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);

      // Update form data with all new images at once
      const newImages = [...currentImages, ...uploadedUrls];
      const key = `image_option${optionNumber}` as keyof typeof formData;
      setFormData(prev => ({ ...prev, [key]: JSON.stringify(newImages) }));
    } catch (error) {
      console.error('Error in image upload process:', error);
      alert('Some images failed to upload. Please try again.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [`option${optionNumber}`]: false }));
    }
  };

  const removeImage = (optionNumber: 1 | 2 | 3, index: number) => {
    const fieldKey = `image_option${optionNumber}` as keyof typeof formData;
    const currentImages = (() => {
      try {
        const parsed = JSON.parse(formData[fieldKey] || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, [fieldKey]: JSON.stringify(newImages) });
  };

  const calculateTotalPrice = (pricePerUnit: string, qty: number): string => {
    const price = parseFloat(pricePerUnit) || 0;
    if (qty > 0 && price > 0) {
      return (price * qty).toFixed(2);
    }
    return '';
  };

  const calculatePricePerUnit = (totalPrice: string, qty: number): string => {
    const total = parseFloat(totalPrice) || 0;
    if (qty > 0 && total > 0) {
      return (total / qty).toFixed(2);
    }
    return '';
  };

  const handleTotalPriceChange = (value: string, optionNumber: 1 | 2 | 3) => {
    const key = `total_price_option${optionNumber}` as keyof typeof formData;
    const unitKey = `price_per_unit_option${optionNumber}` as keyof typeof formData;
    
    // Auto-calculate price per unit when total price changes
    if (quantity > 0 && value && !isNaN(parseFloat(value))) {
      const calculatedUnit = calculatePricePerUnit(value, quantity);
      setFormData(prev => ({ ...prev, [key]: value, [unitKey]: calculatedUnit }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handlePricePerUnitChange = (value: string, optionNumber: 1 | 2 | 3) => {
    const key = `price_per_unit_option${optionNumber}` as keyof typeof formData;
    const totalKey = `total_price_option${optionNumber}` as keyof typeof formData;
    
    // Auto-calculate total price when price per unit changes
    if (quantity > 0 && value && !isNaN(parseFloat(value))) {
      const calculatedTotal = calculateTotalPrice(value, quantity);
      setFormData(prev => ({ ...prev, [key]: value, [totalKey]: calculatedTotal }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const renderOptionFields = (optionNumber: 1 | 2 | 3) => {
    const getFieldValue = (field: string) => {
      const key = `${field}_option${optionNumber}` as keyof typeof formData;
      return formData[key] || '';
    };

    const setFieldValue = (field: string, value: string) => {
      const key = `${field}_option${optionNumber}` as keyof typeof formData;
      setFormData({ ...formData, [key]: value });
    };

    const getImages = (): string[] => {
      try {
        const parsed = JSON.parse(getFieldValue('image'));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const images = getImages();
    const isUploading = uploadingImages[`option${optionNumber}`] || false;

    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Option {optionNumber}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={getFieldValue('title')}
              onChange={(e) => setFieldValue('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              placeholder={`Option ${optionNumber} title`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Price {quantity > 0 && <span className="text-xs text-gray-500">(Qty: {quantity})</span>}
            </label>
            <input
              type="number"
              step="0.01"
              value={getFieldValue('total_price')}
              onChange={(e) => handleTotalPriceChange(e.target.value, optionNumber)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            {quantity > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculates: Price Per Unit = Total Price ÷ {quantity}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price Per Unit {quantity > 0 && <span className="text-xs text-gray-500">(Qty: {quantity})</span>}
            </label>
            <input
              type="number"
              step="0.01"
              value={getFieldValue('price_per_unit')}
              onChange={(e) => handlePricePerUnitChange(e.target.value, optionNumber)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            {quantity > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculates: Total Price = Price Per Unit × {quantity}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Time
            </label>
            <input
              type="text"
              value={getFieldValue('delivery_time')}
              onChange={(e) => setFieldValue('delivery_time', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              placeholder="e.g., 7-14 days"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images ({images.length})
            </label>
            
            {/* Image Upload Area */}
            <div className="mb-4">
              <label
                htmlFor={`image-upload-${optionNumber}`}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploading
                    ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#06b6d4] hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  id={`image-upload-${optionNumber}`}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleImageUpload(e.target.files, optionNumber);
                    }
                  }}
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-2 animate-spin text-[#06b6d4]" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Multiple images supported</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <Image
                        src={imageUrl}
                        alt={`Option ${optionNumber} image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        onClick={() => removeImage(optionNumber, index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={getFieldValue('description')}
              onChange={(e) => setFieldValue('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              rows={3}
              placeholder="Option description"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price Description
            </label>
            <textarea
              value={getFieldValue('price_description')}
              onChange={(e) => setFieldValue('price_description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              rows={2}
              placeholder="Price description"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl mx-auto p-4 sm:p-6"
    >
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Price Options
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
          </div>
        ) : (
          <div className="space-y-6">
            {renderOptionFields(1)}
            {renderOptionFields(2)}
            {renderOptionFields(3)}

            {/* Additional Fields */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Additional Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Selected Option (1, 2, or 3)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={formData.selected_option}
                    onChange={(e) => setFormData({ ...formData, selected_option: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                    placeholder="1, 2, or 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quotation Fees
                  </label>
                  <input
                    type="text"
                    value={formData.quotation_fees}
                    onChange={(e) => setFormData({ ...formData, quotation_fees: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Price Options
                  </>
                )}
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
