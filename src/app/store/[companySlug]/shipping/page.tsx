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
import { Package, Clock, Send, CheckCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'processing', 'shipped', 'delivered'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

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
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-center">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No shipments found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Tracking Number
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Receiver
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Location
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Est. Delivery
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Created
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                    {shipment.tracking_number || '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div>
                      <p className="text-gray-800 dark:text-white">{shipment.receiver_name || '-'}</p>
                      {shipment.receiver_phone && (
                        <p className="text-sm text-gray-500">{shipment.receiver_phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {shipment.location || '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4">{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {formatDate(shipment.created_at)}
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
