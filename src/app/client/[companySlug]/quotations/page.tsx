'use client';

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useClient } from '@/context/ClientContext';
import StatCard from '@/components/common/StatCard';
import { Send, CheckCircle, Clock, X, Package, Plus, ChevronUp, ChevronDown, Eye, Download, ZoomIn, ZoomOut, RotateCw, Layers, Truck } from 'lucide-react';
import QuotationFormModal from '@/components/quotation/QuotationFormModal';
import Button from '@/components/ui/button/Button';
import { VariantGroup } from '@/types/database';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

// Constants
const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

interface QuotationData {
  id: string;
  quotation_id: string;
  product_name: string;
  quantity: number;
  status: string;
  created_at: string;
  destination_country: string;
  destination_city: string;
  shipping_method: string;
  service_type: string;
  image_url?: string;
  product_images?: string[];
  total_price_option1?: string;
  price_per_unit_option1?: string;
  title_option1?: string;
  description_option1?: string;
  delivery_time_option1?: string;
  image_option1?: string;
  price_description_option1?: string;
  total_price_option2?: string;
  price_per_unit_option2?: string;
  title_option2?: string;
  description_option2?: string;
  delivery_time_option2?: string;
  image_option2?: string;
  price_description_option2?: string;
  total_price_option3?: string;
  price_per_unit_option3?: string;
  title_option3?: string;
  description_option3?: string;
  delivery_time_option3?: string;
  image_option3?: string;
  price_description_option3?: string;
  selected_option?: number;
  quotation_fees?: string;
  user_id?: string;
  variant_groups?: VariantGroup[];
  notes?: string;
}

interface QuotationMetrics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'approved') {
    return <Badge variant="success">Approved</Badge>;
  } else if (statusLower === 'pending') {
    return <Badge variant="warning">Pending</Badge>;
  } else if (statusLower === 'rejected') {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge>{status}</Badge>;
};

export default function ClientQuotationsPage() {
  const { company, client } = useClient();
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [fullQuotationData, setFullQuotationData] = useState<QuotationData | null>(null);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);
  const [selectedOptionDetail, setSelectedOptionDetail] = useState<{
    optionNumber: number;
    title: string;
    totalPrice: string;
    pricePerUnit: string;
    description: string;
    deliveryTime: string;
    images: string[];
    priceDescription: string;
  } | null>(null);
  const [isOptionDetailModalOpen, setIsOptionDetailModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; index: number; total: number } | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const fetchData = useCallback(async () => {
    if (!company?.id || !client?.user_id) {
      setError('No company or client found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query - clients can only see their own quotations
      let query = supabase
        .from('quotations')
        .select('*', { count: 'exact' })
        .eq('company_id', company.id)
        .eq('user_id', client.user_id) // Only show client's own quotations
        .order('created_at', { ascending: false });

      // Apply status filter
      if (selectedStatus !== 'All') {
        query = query.eq('status', selectedStatus.toLowerCase());
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

      // Fetch metrics (only for this client)
      const { data: metricsData } = await supabase
        .from('quotations')
        .select('status')
        .eq('company_id', company.id)
        .eq('user_id', client.user_id);

      if (metricsData) {
        const typedMetricsData = metricsData as Array<{ status?: string | null }>;
        setMetrics({
          total: typedMetricsData.length,
          approved: typedMetricsData.filter((q) => q.status?.toLowerCase() === 'approved').length,
          pending: typedMetricsData.filter((q) => q.status?.toLowerCase() === 'pending').length,
          rejected: typedMetricsData.filter((q) => q.status?.toLowerCase() === 'rejected').length,
        });
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, client?.user_id, currentPage, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<QuotationData>[] = [
    {
      header: 'Image',
      accessorKey: 'image_url',
      cell: ({ row }) => {
        const quotation = row.original;
        return (
          <div className="w-12 h-12">
            {quotation.image_url || (quotation.product_images && quotation.product_images[0]) ? (
              <Image
                src={quotation.image_url || quotation.product_images![0]}
                alt={quotation.product_name}
                width={50}
                height={50}
                className="rounded-lg object-cover w-full h-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 80,
    },
    {
      header: 'Quotation ID',
      accessorKey: 'quotation_id',
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue('quotation_id')}</div>
      ),
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Product',
      accessorKey: 'product_name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('product_name')}</div>
      ),
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }) => row.getValue('quantity'),
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Destination',
      accessorKey: 'destination_city',
      cell: ({ row }) => {
        const quotation = row.original;
        return (
          <div>
            {quotation.destination_city}, {quotation.destination_country}
          </div>
        );
      },
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return <div>{date.toLocaleDateString()}</div>;
      },
      sortUndefined: 'last',
      sortDescFirst: false,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: ({ row }) => {
        const quotation = row.original;
        return (
          <button
            onClick={async () => {
              setSelectedQuotation(quotation);
              setIsViewModalOpen(true);
              // Fetch full quotation data including price options
              setIsLoadingFullData(true);
              try {
                const { data, error } = await supabase
                  .from('quotations')
                  .select('*, variant_groups')
                  .eq('id', quotation.id)
                  .single();
                if (error) throw error;
                // Ensure variant_groups is properly typed
                const quotationData = {
                  ...data,
                  variant_groups: (data as any).variant_groups || null
                } as QuotationData;
                setFullQuotationData(quotationData);
              } catch (err) {
                console.error('Error fetching full quotation data:', err);
                setFullQuotationData(quotation);
              } finally {
                setIsLoadingFullData(false);
              }
            }}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="View quotation details"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </button>
        );
      },
      enableSorting: false,
      size: 100,
    },
  ];

  const table = useReactTable({
    data: quotations,
    columns,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
      size: 150,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: false,
  });

  return (
    <>
      {/* Header with Create Quote Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Quotations</h1>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Quotations"
          value={metrics.total}
          icon={<Send className="w-5 h-5" />}
        />
        <StatCard
          title="Approved"
          value={metrics.approved}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Rejected"
          value={metrics.rejected}
          icon={<X className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-[#06b6d4] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading quotations...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No quotations found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                className="table-fixed"
                style={{
                  width: table.getCenterTotalSize(),
                }}
              >
              <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900/50">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              "relative h-10 select-none border-t dark:border-gray-700 [&>.cursor-col-resize]:last:opacity-0",
                              "px-3 text-left align-middle font-medium text-gray-700 dark:text-gray-200"
                            )}
                            aria-sort={
                              header.column.getIsSorted() === 'asc'
                                ? 'ascending'
                                : header.column.getIsSorted() === 'desc'
                                  ? 'descending'
                                  : 'none'
                            }
                            {...{
                              colSpan: header.colSpan,
                              style: {
                                width: header.getSize(),
                              },
                            }}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={cn(
                                  header.column.getCanSort() &&
                                    'flex h-full cursor-pointer select-none items-center justify-between gap-2',
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                                onKeyDown={(e) => {
                                  // Enhanced keyboard handling for sorting
                                  if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    header.column.getToggleSortingHandler()?.(e);
                                  }
                                }}
                                tabIndex={header.column.getCanSort() ? 0 : undefined}
                              >
                                <span className="truncate">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {{
                                  asc: (
                                    <ChevronUp
                                      className="shrink-0 opacity-60"
                                      size={16}
                                      strokeWidth={2}
                                      aria-hidden="true"
                                    />
                                  ),
                                  desc: (
                                    <ChevronDown
                                      className="shrink-0 opacity-60"
                                      size={16}
                                      strokeWidth={2}
                                      aria-hidden="true"
                                    />
                                  ),
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                            {header.column.getCanResize() && (
                              <div
                                {...{
                                  onDoubleClick: () => header.column.resetSize(),
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                  className:
                                    'absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-gray-200 dark:before:bg-gray-700 before:translate-x-px',
                                }}
                              />
                            )}
                          </TableHead>
                        );
                      })}
                </TableRow>
                  ))}
              </TableHeader>
              <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="truncate px-3 py-3 text-gray-700 dark:text-gray-300"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No results.
                    </TableCell>
                  </TableRow>
                  )}
              </TableBody>
            </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Quote Modal */}
      <QuotationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchData(); // Refresh quotations after creating
        }}
      />

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedQuotation(null);
            setFullQuotationData(null);
          }}
          className="max-w-4xl mx-auto p-4 sm:p-6"
        >
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-1 py-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quotation Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedQuotation.quotation_id}
              </p>
            </div>

            {isLoadingFullData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading quotation details...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Product Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Product Information
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="relative w-full h-56 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {selectedQuotation.image_url || (selectedQuotation.product_images && selectedQuotation.product_images[0]) ? (
                          <Image
                            src={selectedQuotation.image_url || selectedQuotation.product_images![0]}
                            alt={selectedQuotation.product_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 space-y-4">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Product Name</span>
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white mt-1">
                          {selectedQuotation.product_name}
                        </h4>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Quantity</span>
                        <p className="text-gray-800 dark:text-gray-200 mt-1">
                          {selectedQuotation.quantity}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Service Type</span>
                        <p className="text-gray-800 dark:text-gray-200 mt-1">
                          {selectedQuotation.service_type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                        <div className="mt-1">
                          {getStatusBadge(selectedQuotation.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variant Groups */}
                {fullQuotationData?.variant_groups && fullQuotationData.variant_groups.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#06b6d4]" />
                      Variant Groups
                    </h3>
                    <div className="space-y-4">
                      {fullQuotationData.variant_groups.map((group, groupIndex) => (
                        <div key={groupIndex} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
                            {group.name || `Group ${groupIndex + 1}`}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.values && group.values.length > 0 ? (
                              group.values.map((value, valueIndex) => (
                                <div key={valueIndex} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                  {value.images && value.images.length > 0 && (
                                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                                      <Image 
                                        src={value.images[0]} 
                                        alt={value.name} 
                                        fill 
                                        className="object-cover" 
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                      {value.name || `Value ${valueIndex + 1}`}
                                    </p>
                                    {value.moq && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        MOQ: {value.moq}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic p-3">
                                No values in this group
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#06b6d4]" />
                    Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Destination</span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {selectedQuotation.destination_city}, {selectedQuotation.destination_country}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Shipping Method</span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {selectedQuotation.shipping_method || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {fullQuotationData && fullQuotationData.selected_option && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#06b6d4]" />
                      Delivery Information
                    </h3>
                    <div className="space-y-3">
                      {fullQuotationData[`delivery_time_option${fullQuotationData.selected_option}` as keyof QuotationData] && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery Time</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-1 font-medium">
                            {fullQuotationData[`delivery_time_option${fullQuotationData.selected_option}` as keyof QuotationData] as string}
                          </p>
                        </div>
                      )}
                      {fullQuotationData[`description_option${fullQuotationData.selected_option}` as keyof QuotationData] && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Delivery Details</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                            {fullQuotationData[`description_option${fullQuotationData.selected_option}` as keyof QuotationData] as string}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {fullQuotationData?.notes && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {fullQuotationData.notes}
                    </p>
                  </div>
                )}

                {/* Price Options */}
                {fullQuotationData && (fullQuotationData.title_option1 || fullQuotationData.title_option2 || fullQuotationData.title_option3) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Available Price Options
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((optionNum) => {
                        const title = fullQuotationData[`title_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const totalPrice = fullQuotationData[`total_price_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const pricePerUnit = fullQuotationData[`price_per_unit_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const description = fullQuotationData[`description_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const deliveryTime = fullQuotationData[`delivery_time_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const imageField = fullQuotationData[`image_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const priceDescription = fullQuotationData[`price_description_option${optionNum}` as keyof QuotationData] as string | undefined;
                        const isSelected = fullQuotationData.selected_option === optionNum;

                        if (!title && !totalPrice) return null;

                        // Parse images (can be JSON string or single URL)
                        let images: string[] = [];
                        if (imageField) {
                          try {
                            const parsed = JSON.parse(imageField);
                            images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                          } catch {
                            if (imageField) images = [imageField];
                          }
                        }

                        const formatPrice = (price: string | undefined) => {
                          if (!price) return 'N/A';
                          const numPrice = parseFloat(price);
                          if (isNaN(numPrice)) return price;
                          return `$${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        };

                        return (
                          <div
                            key={optionNum}
                            onClick={() => {
                              setSelectedOptionDetail({
                                optionNumber: optionNum,
                                title: title || `Option ${optionNum}`,
                                totalPrice: totalPrice || '',
                                pricePerUnit: pricePerUnit || '',
                                description: description || '',
                                deliveryTime: deliveryTime || '',
                                images: images,
                                priceDescription: priceDescription || '',
                              });
                              setIsOptionDetailModalOpen(true);
                            }}
                            className={`relative p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#06b6d4] text-white rounded-full p-1">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            )}
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                {title || `Option ${optionNum}`}
                              </h4>
                              {totalPrice && (
                                <p className="text-lg font-bold text-[#06b6d4]">
                                  {formatPrice(totalPrice)}
                                </p>
                              )}
                              {pricePerUnit && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatPrice(pricePerUnit)} per unit
                                </p>
                              )}
                            </div>
                            {images.length > 0 && (
                              <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                <Image
                                  src={images[0]}
                                  alt={title || `Option ${optionNum}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {description}
                              </p>
                            )}
                            {deliveryTime && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Delivery: {deliveryTime}
                              </p>
                            )}
                            {priceDescription && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                {priceDescription}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {fullQuotationData.quotation_fees && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Additional Fees:</span> {fullQuotationData.quotation_fees}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Price Option Detail Modal */}
      {selectedOptionDetail && (
        <Modal
          isOpen={isOptionDetailModalOpen}
          onClose={() => {
            setIsOptionDetailModalOpen(false);
            setSelectedOptionDetail(null);
          }}
          className="max-w-3xl mx-auto p-4 sm:p-6"
        >
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-1 py-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedOptionDetail.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quotation Option {selectedOptionDetail.optionNumber}
              </p>
            </div>

            <div className="space-y-6">
              {/* Price Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOptionDetail.totalPrice && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Price</span>
                      <p className="text-2xl font-bold text-[#06b6d4] mt-1">
                        {(() => {
                          const numPrice = parseFloat(selectedOptionDetail.totalPrice);
                          if (isNaN(numPrice)) return selectedOptionDetail.totalPrice;
                          return `$${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })()}
                      </p>
                    </div>
                  )}
                  {selectedOptionDetail.pricePerUnit && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price Per Unit</span>
                      <p className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                        {(() => {
                          const numPrice = parseFloat(selectedOptionDetail.pricePerUnit);
                          if (isNaN(numPrice)) return selectedOptionDetail.pricePerUnit;
                          return `$${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        })()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedOptionDetail.priceDescription && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedOptionDetail.priceDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Images Gallery */}
              {selectedOptionDetail.images.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Images ({selectedOptionDetail.images.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOptionDetail.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedImage({
                            url: imageUrl,
                            index: index,
                            total: selectedOptionDetail.images.length,
                          });
                          setIsImageViewerOpen(true);
                          setImageZoom(1);
                          setImageRotation(0);
                        }}
                        className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-[#06b6d4] hover:shadow-md transition-all duration-200 group"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${selectedOptionDetail.title} - Image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedOptionDetail.description && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedOptionDetail.description}
                  </p>
                </div>
              )}

              {/* Delivery Information */}
              {selectedOptionDetail.deliveryTime && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#06b6d4]" />
                    Delivery Information
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Estimated Delivery Time: <span className="font-semibold">{selectedOptionDetail.deliveryTime}</span>
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {fullQuotationData && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quotation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Quotation ID:</span>
                      <p className="text-gray-800 dark:text-white font-mono mt-1">
                        {selectedQuotation?.quotation_id}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                      <p className="text-gray-800 dark:text-white mt-1">
                        {selectedQuotation?.quantity} units
                      </p>
                    </div>
                    {fullQuotationData.quotation_fees && (
                      <div className="md:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Additional Fees:</span>
                        <p className="text-gray-800 dark:text-white mt-1">
                          {fullQuotationData.quotation_fees}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <Modal
          isOpen={isImageViewerOpen}
          onClose={() => {
            setIsImageViewerOpen(false);
            setSelectedImage(null);
            setImageZoom(1);
            setImageRotation(0);
          }}
          className="max-w-7xl mx-auto p-4 sm:p-6"
        >
          <div className="relative bg-black/95 dark:bg-gray-900 rounded-xl overflow-hidden">
            {/* Header with controls */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm font-medium">
                  Image {selectedImage.index + 1} of {selectedImage.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = `quotation-image-${selectedImage.index + 1}.${selectedImage.url.split('.').pop()?.split('?')[0] || 'jpg'}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsImageViewerOpen(false);
                    setSelectedImage(null);
                    setImageZoom(1);
                    setImageRotation(0);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image container */}
            <div className="flex items-center justify-center min-h-[60vh] max-h-[80vh] p-4 pt-20 pb-20 overflow-auto">
              <div
                className="relative transition-transform duration-200"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <Image
                  src={selectedImage.url}
                  alt={`Image ${selectedImage.index + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>

            {/* Navigation arrows */}
            {selectedOptionDetail && selectedOptionDetail.images.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const prevIndex = selectedImage.index > 0 
                      ? selectedImage.index - 1 
                      : selectedOptionDetail.images.length - 1;
                    setSelectedImage({
                      url: selectedOptionDetail.images[prevIndex],
                      index: prevIndex,
                      total: selectedOptionDetail.images.length,
                    });
                    setImageZoom(1);
                    setImageRotation(0);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors z-10"
                  title="Previous Image"
                >
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
                <button
                  onClick={() => {
                    const nextIndex = selectedImage.index < selectedOptionDetail.images.length - 1
                      ? selectedImage.index + 1
                      : 0;
                    setSelectedImage({
                      url: selectedOptionDetail.images[nextIndex],
                      index: nextIndex,
                      total: selectedOptionDetail.images.length,
                    });
                    setImageZoom(1);
                    setImageRotation(0);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors z-10"
                  title="Next Image"
                >
                  <ChevronDown className="w-6 h-6 -rotate-90" />
                </button>
              </>
            )}

            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg text-white text-sm">
              {Math.round(imageZoom * 100)}%
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
