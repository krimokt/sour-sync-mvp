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
import { supabase } from '@/lib/supabase';
import { useStore } from '@/context/StoreContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import { Package, Clock, Send, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, Building2, MapPin, Info, Upload, Image as ImageIcon, Video, X } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Input from '@/components/form/input/InputField';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'processing', 'shipped', 'delivered'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image: string | null;
}

interface ShippingData {
  id: string;
  tracking_number?: string;
  status: string;
  location?: string;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  images_urls?: string[] | null;
  videos_urls?: string[] | null;
  metadata?: {
    cart_items?: CartItem[];
    address_id?: string;
    payment_method_type?: string;
    payment_method_id?: string;
  } | string;
}

interface ShippingMetrics {
  total: number;
  processing: number;
  shipped: number;
  delivered: number;
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

export default function ShippingPage() {
  const { company } = useStore();
  const [shipments, setShipments] = useState<ShippingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('All');
  const [expandedShipments, setExpandedShipments] = useState<Set<string>>(() => new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());
  const [selectedShipment, setSelectedShipment] = useState<ShippingData | null>(null);
  const [uploadShipment, setUploadShipment] = useState<ShippingData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Edit state for shipment details
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState('');
  const [isSavingShipment, setIsSavingShipment] = useState(false);
  const [shipmentEditError, setShipmentEditError] = useState<string | null>(null);
  const [shipmentEditSuccess, setShipmentEditSuccess] = useState(false);
  const [metrics, setMetrics] = useState<ShippingMetrics>({
    total: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

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
        .from('shipping')
        .select('*', { count: 'exact' })
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (selectedStatus !== 'All') {
        query = query.eq('status', selectedStatus);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setShipments(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from('shipping')
        .select('status')
        .eq('company_id', company.id);

      if (metricsData) {
        setMetrics({
          total: metricsData.length,
          processing: metricsData.filter((s) => s.status === 'processing').length,
          shipped: metricsData.filter((s) => s.status === 'shipped').length,
          delivered: metricsData.filter((s) => s.status === 'delivered').length,
        });
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to load shipments');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, currentPage, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, 'success' | 'warning' | 'error' | 'light'> = {
      processing: 'warning',
      shipped: 'light',
      delivered: 'success',
    };
    return <Badge variant={statusColors[status] || 'light'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const toggleShipmentExpansion = (shipmentId: string) => {
    setExpandedShipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  const parseMetadata = (metadata: unknown) => {
    if (!metadata) return null;
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch (e) {
        return null;
      }
    }
    return metadata;
  };

  // Function to get video duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Function to handle file uploads (optimized with parallel uploads)
  const handleFileUpload = async (files: FileList, type: 'images' | 'videos') => {
    if (!uploadShipment?.id) {
      setUploadError("Please select a shipment first");
      return;
    }

    if (files.length === 0) {
      setUploadError("Please select files to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    
    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      let completedCount = 0;
      
      // Validate all files first (quick validation)
      const maxSize = type === 'videos' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      for (const file of fileArray) {
        if (file.size > maxSize) {
          throw new Error(`${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        }
        if (type === 'images' && !file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          throw new Error(`${file.name} is not a supported image type. Supported types: JPEG, PNG, GIF, WEBP`);
        }
        if (type === 'videos' && !file.type.match(/^video\/(mp4|webm|quicktime|mov)$/)) {
          throw new Error(`${file.name} is not a supported video type. Supported types: MP4, WebM, MOV`);
        }
      }

      // Validate video durations in parallel
      if (type === 'videos') {
        const durationPromises = fileArray.map(file => 
          getVideoDuration(file).catch(() => null)
        );
        const durations = await Promise.all(durationPromises);
        
        for (let i = 0; i < fileArray.length; i++) {
          const duration = durations[i];
          if (duration !== null && (duration < 10 || duration > 25)) {
            throw new Error(`${fileArray[i].name} duration is ${duration.toFixed(1)}s. Videos must be between 10-25 seconds.`);
          }
        }
      }

      // Upload all files in parallel
      const uploadPromises = fileArray.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 15)}`;
        const fileName = `shipment-${uploadShipment.id}/${type}/${uniqueId}.${fileExt}`;
        
        try {
          // Upload the file to shipment_updates bucket
          const { error: uploadError, data } = await supabase.storage
            .from('shipment_updates')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            if (uploadError.message.includes('storage/bucket-not-found')) {
              throw new Error('Storage bucket not found. Please contact your administrator.');
            }
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
          
          if (!data?.path) {
            throw new Error(`Failed to get upload path for ${file.name}`);
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('shipment_updates')
            .getPublicUrl(data.path);
              
          if (!publicUrl) {
            throw new Error(`Failed to get public URL for ${file.name}`);
          }

          // Update progress
          completedCount++;
          const progress = (completedCount / totalFiles) * 100;
          setUploadProgress(Math.round(progress));

          return publicUrl;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (uploadedUrls.length === 0) {
        throw new Error("No files were uploaded successfully");
      }

      // Update the shipping record with new URLs
      const existingUrls = type === 'images' 
        ? (uploadShipment.images_urls || [])
        : (uploadShipment.videos_urls || []);
      
      const { error: updateError } = await supabase
        .from('shipping')
        .update({
          [`${type}_urls`]: [...existingUrls, ...uploadedUrls]
        } as never)
        .eq('id', uploadShipment.id);
        
      if (updateError) {
        throw new Error(`Failed to update shipping record: ${updateError.message}`);
      }
      
      // Update local state
      const updatedShipment = {
        ...uploadShipment,
        [`${type}_urls`]: [...existingUrls, ...uploadedUrls]
      };
      
      setUploadShipment(updatedShipment);
      setShipments(prevShipments =>
        prevShipments.map(shipment =>
          shipment.id === uploadShipment.id ? updatedShipment : shipment
        )
      );
      
      setUploadSuccess(true);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 3000);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files. Please try again.';
      setUploadError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to delete a media item
  const handleDeleteMedia = async (url: string, type: 'images' | 'videos') => {
    if (!uploadShipment?.id) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Remove the URL from the array
      const existingUrls = type === 'images' 
        ? (uploadShipment.images_urls || [])
        : (uploadShipment.videos_urls || []);
      
      const filteredUrls = existingUrls.filter(u => u !== url);

      // Update the shipping record
      const { error: updateError } = await supabase
        .from('shipping')
        .update({
          [`${type}_urls`]: filteredUrls
        } as never)
        .eq('id', uploadShipment.id);
        
      if (updateError) {
        throw new Error(`Failed to delete ${type.slice(0, -1)}: ${updateError.message}`);
      }

      // Try to delete the file from storage (optional - don't fail if this doesn't work)
      try {
        // Extract the file path from the URL
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/shipment_updates\/(.+)/);
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          await supabase.storage
            .from('shipment_updates')
            .remove([filePath]);
        }
      } catch (storageError) {
        // Log but don't fail - the database update succeeded
        console.warn('Failed to delete file from storage:', storageError);
      }
      
      // Update local state
      const updatedShipment = {
        ...uploadShipment,
        [`${type}_urls`]: filteredUrls
      };
      
      setUploadShipment(updatedShipment);
      setShipments(prevShipments =>
        prevShipments.map(shipment =>
          shipment.id === uploadShipment.id ? updatedShipment : shipment
        )
      );
      
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete media. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize edit values when shipment changes
  useEffect(() => {
    if (selectedShipment) {
      setEditLocation(selectedShipment.location || 'china');
      setEditStatus(selectedShipment.status);
      setEditEstimatedDelivery(
        selectedShipment.estimated_delivery 
          ? new Date(selectedShipment.estimated_delivery).toISOString().split('T')[0]
          : ''
      );
    }
  }, [selectedShipment]);

  // Function to save shipment edits (with parameters for auto-save)
  const handleSaveShipmentEdits = async (
    newStatus?: string,
    newLocation?: string,
    newEstimatedDelivery?: string
  ) => {
    if (!selectedShipment?.id) return;

    const statusToSave = newStatus !== undefined ? newStatus : editStatus;
    const locationToSave = newLocation !== undefined ? newLocation : editLocation;
    const estimatedDeliveryToSave = newEstimatedDelivery !== undefined ? newEstimatedDelivery : editEstimatedDelivery;

    setIsSavingShipment(true);
    setShipmentEditError(null);
    setShipmentEditSuccess(false);

    try {
      const updateData: {
        location?: string;
        status?: string;
        estimated_delivery?: string | null;
      } = {};

      // Default to 'china' if location is empty
      const finalLocation = locationToSave.trim() || 'china';
      if (finalLocation !== (selectedShipment.location || 'china')) {
        updateData.location = finalLocation;
      }
      if (statusToSave !== selectedShipment.status) {
        updateData.status = statusToSave;
      }
      const currentDate = selectedShipment.estimated_delivery 
        ? new Date(selectedShipment.estimated_delivery).toISOString().split('T')[0]
        : '';
      if (estimatedDeliveryToSave !== currentDate) {
        updateData.estimated_delivery = estimatedDeliveryToSave 
          ? new Date(estimatedDeliveryToSave).toISOString()
          : null;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('shipping')
          .update(updateData)
          .eq('id', selectedShipment.id);

        if (updateError) {
          throw new Error(`Failed to update shipment: ${updateError.message}`);
        }

        // Update local state
        const updatedShipment = {
          ...selectedShipment,
          ...updateData,
          estimated_delivery: updateData.estimated_delivery !== undefined 
            ? updateData.estimated_delivery || undefined
            : selectedShipment.estimated_delivery
        };

        setSelectedShipment(updatedShipment);
        setShipments(prevShipments =>
          prevShipments.map(shipment =>
            shipment.id === selectedShipment.id ? updatedShipment : shipment
          )
        );

        // Update edit state to reflect saved values
        if (updateData.location !== undefined) {
          setEditLocation(updatedShipment.location || '');
        }
        if (updateData.status !== undefined) {
          setEditStatus(updatedShipment.status);
        }
        if (updateData.estimated_delivery !== undefined) {
          setEditEstimatedDelivery(
            updatedShipment.estimated_delivery 
              ? new Date(updatedShipment.estimated_delivery).toISOString().split('T')[0]
              : ''
          );
        }

        setShipmentEditSuccess(true);
        setTimeout(() => {
          setShipmentEditSuccess(false);
        }, 2000);
      }
    } catch (error: unknown) {
      console.error('Save shipment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes. Please try again.';
      setShipmentEditError(errorMessage);
      setTimeout(() => {
        setShipmentEditError(null);
      }, 3000);
    } finally {
      setIsSavingShipment(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Shipping" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <StatCard
          title="Total Shipments"
          value={metrics.total}
          variant="dark"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Processing"
          value={metrics.processing}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          title="Shipped"
          value={metrics.shipped}
          icon={<Send className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Delivered"
          value={metrics.delivered}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
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
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50 overflow-hidden">
        {error ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Error Loading Shipments</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No Shipments Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No shipments found for this company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                    <TableCell isHeader className="w-[200px] min-w-[180px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Tracking Number
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[140px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" /> Receiver
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> Location
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5" /> Status
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Est. Delivery
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Created
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" /> Actions
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {shipments.map((shipment) => {
                const isExpanded = expandedShipments.has(shipment.id);
                const metadata = parseMetadata(shipment.metadata);
                const cartItems = metadata?.cart_items || [];

                return (
                  <React.Fragment key={shipment.id}>
                    <TableRow 
                      className={`cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
                        isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        toggleShipmentExpansion(shipment.id);
                      }}
                    >
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {shipment.tracking_number || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="text-gray-800 dark:text-white">{shipment.receiver_name || '-'}</p>
                          {shipment.receiver_phone && (
                            <p className="text-sm text-gray-500">{shipment.receiver_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400">
                        {shipment.location || '-'}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '-'}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        {formatDate(shipment.created_at)}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-2">
                          {cartItems.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleShipmentExpansion(shipment.id);
                              }}
                              className={`p-2 rounded-md transition-all duration-200 flex-shrink-0 ${
                                isExpanded 
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-800 dark:text-gray-500'
                              }`}
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadShipment(shipment);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            title="Upload images/videos"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShipment(shipment);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="View full details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && cartItems.length > 0 && (
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                        <TableCell colSpan={7} className="px-0 py-0">
                          <div className="p-6 bg-white dark:bg-gray-900">
                            {/* Invoice-style Table */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {cartItems.map((item: CartItem, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                            {item.image && item.image.trim() && !imageErrors.has(`${shipment.id}-${idx}`) ? (
                                              <Image 
                                                src={item.image} 
                                                alt={item.product_name} 
                                                fill 
                                                className="object-contain p-1" 
                                                onError={() => {
                                                  setImageErrors(prev => new Set(prev).add(`${shipment.id}-${idx}`));
                                                }}
                                              />
                                            ) : (
                                              <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                              {item.product_name}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-900 dark:text-white">
                                          {item.quantity}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {formatCurrency(item.unit_price)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {formatCurrency(item.total_price)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                                  <tr>
                                    <td colSpan={3} className="px-4 py-4 text-right">
                                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Total Amount:</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(cartItems.reduce((sum: number, item: CartItem) => sum + item.total_price, 0))}
                                      </span>
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
            </div>
          </div>
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

      {/* Shipment Details Modal */}
      {selectedShipment && (() => {
        const metadata = parseMetadata(selectedShipment.metadata);
        const cartItems = (metadata?.cart_items || []) as CartItem[];
        const cartTotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.total_price, 0);
        
        return (
          <Dialog 
            open={selectedShipment !== null} 
            onOpenChange={() => {
              setSelectedShipment(null);
              setShipmentEditError(null);
              setShipmentEditSuccess(false);
            }}
          >
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
              <div className="bg-white dark:bg-gray-900">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        Shipment Details
                      </DialogTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tracking: {selectedShipment.tracking_number || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(editStatus || selectedShipment.status)}
                    </div>
                  </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-6">
                  {/* Success/Error Messages */}
                  {shipmentEditSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">Shipment updated successfully!</p>
                    </div>
                  )}
                  {shipmentEditError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{shipmentEditError}</p>
                    </div>
                  )}

                  {/* Shipping Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tracking Number */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tracking Number
                        </label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {selectedShipment.tracking_number || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="china (default)"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created Date
                        </label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {formatDate(selectedShipment.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estimated Delivery
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="date"
                            value={editEstimatedDelivery}
                            onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => handleSaveShipmentEdits(editStatus, editLocation, editEstimatedDelivery)}
                        disabled={isSavingShipment}
                        className="min-w-[120px]"
                      >
                        {isSavingShipment ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {(selectedShipment.receiver_name || selectedShipment.receiver_address) && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                        {selectedShipment.receiver_name && (
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name:</span>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{selectedShipment.receiver_name}</p>
                          </div>
                        )}
                        {selectedShipment.receiver_phone && (
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone:</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{selectedShipment.receiver_phone}</p>
                          </div>
                        )}
                        {selectedShipment.receiver_address && (
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address:</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{selectedShipment.receiver_address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  {cartItems.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Order Items ({cartItems.length})</h3>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cartItems.map((item: CartItem, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                      {item.image && item.image.trim() && !imageErrors.has(`${selectedShipment.id}-${idx}`) ? (
                                        <Image 
                                          src={item.image} 
                                          alt={item.product_name} 
                                          fill 
                                          className="object-contain p-1" 
                                          onError={() => {
                                            setImageErrors(prev => new Set(prev).add(`${selectedShipment.id}-${idx}`));
                                          }}
                                        />
                                      ) : (
                                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                                        {item.product_name}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-900 dark:text-white">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(item.unit_price)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(item.total_price)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-right">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Total Amount:</span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(cartTotal)}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Upload Media Modal */}
      {uploadShipment && (
        <Dialog open={uploadShipment !== null} onOpenChange={() => setUploadShipment(null)}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Media for Shipment
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tracking: {uploadShipment.tracking_number || 'N/A'}
              </p>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {uploadError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">Files uploaded successfully!</p>
                </div>
              )}

              {/* Images Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Upload Images
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files, 'images');
                      }
                    }}
                    disabled={isUploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPEG, PNG, GIF or WEBP (max. 10MB each)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Videos Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-500" />
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Upload Videos
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mov"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files, 'videos');
                      }
                    }}
                    disabled={isUploading}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Video className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload videos
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        MP4, WebM or MOV (10-25 seconds, max. 50MB each)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="text-gray-600 dark:text-gray-400">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Existing Media Preview */}
              {(uploadShipment.images_urls && uploadShipment.images_urls.length > 0) || 
               (uploadShipment.videos_urls && uploadShipment.videos_urls.length > 0) ? (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Media</h4>
                  
                  {uploadShipment.images_urls && uploadShipment.images_urls.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Images ({uploadShipment.images_urls.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadShipment.images_urls.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image
                              src={url}
                              alt={`Shipment image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => handleDeleteMedia(url, 'images')}
                              disabled={isUploading}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadShipment.videos_urls && uploadShipment.videos_urls.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Videos ({uploadShipment.videos_urls.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadShipment.videos_urls.map((url, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                            <video
                              src={url}
                              controls
                              className="w-full h-full"
                            />
                            <button
                              onClick={() => handleDeleteMedia(url, 'videos')}
                              disabled={isUploading}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed z-10"
                              title="Delete video"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadShipment(null);
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                disabled={isUploading}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
