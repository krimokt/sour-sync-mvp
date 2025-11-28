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
import { Send, CheckCircle, Clock, X } from 'lucide-react';

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
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          title="Rejected"
          value={metrics.rejected}
          icon={<X className="w-5 h-5 text-red-500" />}
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
    </>
  );
}
