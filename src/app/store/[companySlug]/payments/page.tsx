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
import { List, DollarSign, CheckCircle, Clock, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'pending', 'completed', 'failed'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  reference_number?: string;
  created_at: string;
  payer_name?: string;
  payer_email?: string;
}

interface PaymentMetrics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
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

export default function PaymentsPage() {
  const { company } = useStore();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('All');
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
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
        .from('payments')
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

      setPayments(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from('payments')
        .select('status, amount')
        .eq('company_id', company.id);

      if (metricsData) {
        setMetrics({
          total: metricsData.length,
          completed: metricsData.filter((p) => p.status === 'completed').length,
          pending: metricsData.filter((p) => p.status === 'pending').length,
          failed: metricsData.filter((p) => p.status === 'failed').length,
          totalAmount: metricsData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        });
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, currentPage, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      Accepted: 'success',
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Payments" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
        <StatCard
          title="Total Payments"
          value={metrics.total}
          variant="dark"
          icon={<List className="w-5 h-5" />}
        />
        <StatCard
          title="Total Amount"
          value={formatCurrency(metrics.totalAmount)}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Completed"
          value={metrics.completed}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          title="Failed"
          value={metrics.failed}
          icon={<X className="w-5 h-5 text-red-500" />}
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
          <div className="p-6 text-center">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payments found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Reference
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Method
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500">
                  Payer
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
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                    {payment.reference_number || payment.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 dark:text-white font-semibold">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {payment.payment_method}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {payment.payer_name || payment.payer_email || '-'}
                  </TableCell>
                  <TableCell className="px-5 py-4">{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {formatDate(payment.created_at)}
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
