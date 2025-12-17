'use client';

import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useClient } from '@/context/ClientContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import { Package, Clock, Send, CheckCircle, ChevronDown, ChevronUp, FileText, Building2, MapPin, Info, Eye, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

export default function ClientShippingPage() {
  const { company, client } = useClient();
  const [shipments, setShipments] = useState<ShippingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('All');
  const [expandedShipments, setExpandedShipments] = useState<Set<string>>(() => new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());
  const [selectedShipment, setSelectedShipment] = useState<ShippingData | null>(null);
  const [metrics, setMetrics] = useState<ShippingMetrics>({
    total: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  const fetchData = useCallback(async () => {
    if (!company?.id || !client?.user_id) {
      setError('No company found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('shipping')
        .select('*', { count: 'exact' })
        .eq('company_id', company.id)
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'All') {
        query = query.eq('status', selectedStatus);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setShipments(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      const { data: metricsData } = await supabase
        .from('shipping')
        .select('status')
        .eq('company_id', company.id)
        .eq('user_id', client.user_id);

      if (metricsData) {
        setMetrics({
          total: metricsData.length,
          processing: metricsData.filter((s) => s.status === 'processing').length,
          shipped: metricsData.filter((s) => s.status === 'shipped').length,
          delivered: metricsData.filter((s) => s.status === 'delivered').length,
        });
      }
    } catch (err) {
      console.error('Error fetching client shipments:', err);
      setError('Failed to load shipments');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, client?.user_id, currentPage, selectedStatus]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseMetadata = (metadata: any) => {
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

  return (
    <>
      <PageBreadcrumb pageTitle="Shipping" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <StatCard title="Total Shipments" value={metrics.total} variant="dark" icon={<Package className="w-5 h-5" />} />
        <StatCard title="Processing" value={metrics.processing} icon={<Clock className="w-5 h-5 text-yellow-500" />} />
        <StatCard title="Shipped" value={metrics.shipped} icon={<Send className="w-5 h-5 text-blue-500" />} />
        <StatCard title="Delivered" value={metrics.delivered} icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
      </div>

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
            <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any shipments yet.</p>
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
                            <div className="flex items-center gap-2 sm:gap-3 justify-center">
                              {cartItems.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleShipmentExpansion(shipment.id);
                                  }}
                                  className={`p-1 rounded-md transition-all duration-200 flex-shrink-0 ${
                                    isExpanded 
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-800 dark:text-gray-500'
                                  }`}
                                  title={isExpanded ? "Collapse" : "Expand"}
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
        const cartItems = metadata?.cart_items || [];
        const cartTotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.total_price, 0);

        return (
          <Dialog open={selectedShipment !== null} onOpenChange={() => setSelectedShipment(null)}>
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
                    {getStatusBadge(selectedShipment.status)}
                  </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-6">
                  {/* Shipping Information */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Shipping Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tracking Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedShipment.tracking_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                        <div>{getStatusBadge(selectedShipment.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedShipment.location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedShipment.created_at)}
                        </p>
                      </div>
                      {selectedShipment.estimated_delivery && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Delivery</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedShipment.estimated_delivery)}
                          </p>
                        </div>
                      )}
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

                  {/* Shipment Details - Images and Videos */}
                  {((selectedShipment.images_urls && selectedShipment.images_urls.length > 0) || 
                    (selectedShipment.videos_urls && selectedShipment.videos_urls.length > 0)) && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        Shipment Details
                      </h3>
                      
                      {/* Images Section */}
                      {selectedShipment.images_urls && selectedShipment.images_urls.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Images ({selectedShipment.images_urls.length})
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedShipment.images_urls.map((url, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={url}
                                  alt={`Shipment image ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos Section */}
                      {selectedShipment.videos_urls && selectedShipment.videos_urls.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Video className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Videos ({selectedShipment.videos_urls.length})
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedShipment.videos_urls.map((url, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                                <video
                                  src={url}
                                  controls
                                  className="w-full h-full"
                                  preload="metadata"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
    </>
  );
}




