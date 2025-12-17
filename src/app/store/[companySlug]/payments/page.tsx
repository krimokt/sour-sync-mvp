'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { List, DollarSign, CheckCircle, Clock, X, ChevronDown, ChevronUp, Package, Eye, Loader2, FileText, Building2, CreditCard, Info, Upload, MapPin, Download } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected', 'completed', 'failed'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

// Database allows: 'Pending', 'Accepted', 'Rejected', 'pending', 'processing', 'completed', 'failed'
// We'll use lowercase versions and map 'approved' to 'Accepted' in the API
const PAYMENT_STATUSES = ['pending', 'approved', 'rejected', 'completed', 'failed'] as const;

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image: string | null;
}

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
  payment_proof_url?: string;
  metadata?: {
    company_id?: string;
    quotation_id?: string;
    cart_items?: CartItem[];
    address_id?: string;
    payment_method_type?: string;
    payment_method_id?: string;
  } | string;
}

interface PaymentMetrics {
  total: number;
  approved: number;
  pending: number;
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

interface ClientAddress {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string | null;
  company_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Delivery Address Component for Store Side
const DeliveryAddressSection = ({ addressId, companyId }: { addressId: string; companyId: string }) => {
  const [address, setAddress] = useState<ClientAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId || !companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('client_addresses')
          .select('*')
          .eq('id', addressId)
          .eq('company_id', companyId)
          .single();

        if (!error && data) {
          setAddress(data);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddress();
  }, [addressId, companyId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Delivery Address
        </h3>
        <p className="text-sm text-gray-500">Loading address...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Delivery Address
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Address ID: <span className="font-mono text-xs">{addressId}</span></p>
          <p className="text-sm text-gray-500 mt-2 italic">Address details not found</p>
        </div>
      </div>
    );
  }

  // Build address lines
  const addressLines = [
    address.address_line_1,
    address.address_line_2,
  ].filter(Boolean).join(', ');

  const locationParts = [
    address.city,
    address.state,
    address.postal_code,
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        Delivery Address
      </h3>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {address.full_name && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name:</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{address.full_name}</p>
          </div>
        )}
        {address.company_name && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{address.company_name}</p>
          </div>
        )}
        {addressLines && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{addressLines}</p>
          </div>
        )}
        {locationParts.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{locationParts.join(', ')}</p>
          </div>
        )}
        {address.country && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country:</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{address.country}</p>
          </div>
        )}
        {address.phone && (
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{address.phone}</p>
          </div>
        )}
      </div>
    </div>
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
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(() => new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  interface InvoiceItem {
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image?: string;
  }

  interface InvoicePreview {
    payment: {
      currency: string;
      amount: number;
      reference_number: string;
      [key: string]: unknown;
    };
    company: {
      name: string;
      logo_url?: string;
      email?: string;
      phone?: string;
      address?: string;
      [key: string]: unknown;
    };
    items: InvoiceItem[];
  }

  const [invoicePreview, setInvoicePreview] = useState<InvoicePreview | null>(null);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isLoadingInvoicePreview, setIsLoadingInvoicePreview] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle payment proof upload
  const handleUploadProof = async () => {
    if (!selectedPayment || !uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `payment_proof_${selectedPayment.id}_${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, uploadFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update payment record using Supabase client
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          payment_proof_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);

      if (updateError) {
        console.error('Error updating payment_proof_url:', updateError);
        throw new Error(`Failed to update payment record: ${updateError.message}`);
      }

      toast.success('Payment proof uploaded successfully');
      
      // Update local state
      const updatedPayment = { ...selectedPayment, payment_proof_url: urlData.publicUrl };
      setSelectedPayment(updatedPayment);
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, payment_proof_url: urlData.publicUrl }
            : p
        )
      );
      
      // Clear upload state
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload payment proof');
    } finally {
      setIsUploading(false);
    }
  };

  // Download payment proof
  const handleDownloadProof = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1] || 'payment-proof';
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      toast.success('Payment proof downloaded successfully');
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Failed to download payment proof');
    }
  };
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    total: 0,
    approved: 0,
    pending: 0,
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
          approved: metricsData.filter((p) => p.status === 'Accepted' || p.status === 'approved' || p.status === 'completed').length,
          pending: metricsData.filter((p) => p.status === 'pending' || p.status === 'Pending').length,
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

  const togglePaymentExpansion = (paymentId: string) => {
    setExpandedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const parseMetadata = (metadata: unknown): Record<string, unknown> | null => {
    if (!metadata) return null;
    if (typeof metadata === 'string') {
      try {
        const parsed = JSON.parse(metadata);
        return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
      } catch (e) {
        return null;
      }
    }
    if (typeof metadata === 'object' && metadata !== null) {
      return metadata as Record<string, unknown>;
    }
    return null;
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    if (!company?.slug) {
      toast.error('Company not found');
      return;
    }

    setUpdatingStatus(paymentId);
    try {
      const response = await fetch(`/api/store/${company.slug}/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      const result = await response.json();
      const dbStatus = result.status; // Get the actual status from database

      // Update local state with the database status
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: dbStatus } : p))
      );

      // Display user-friendly status name
      const displayStatus = dbStatus === 'Accepted' ? 'approved' : dbStatus.toLowerCase();
      toast.success(`Payment status updated to ${displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}`);
      fetchData(); // Refresh to update metrics
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update payment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    // Normalize status for display
    const normalizedStatus = status.toLowerCase();
    const displayStatus = normalizedStatus === 'accepted' ? 'approved' : normalizedStatus;
    
    const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
      completed: 'success',
      approved: 'success',
      accepted: 'success',
      pending: 'warning',
      failed: 'error',
      rejected: 'error',
      Accepted: 'success',
      Pending: 'warning',
      Rejected: 'error',
    };
    return <Badge variant={statusColors[normalizedStatus] || statusColors[status] || 'warning'}>{displayStatus}</Badge>;
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

  // Check if payment status is accepted
  const isPaymentAccepted = (status: string) => {
    const acceptedStatuses = ['Accepted', 'accepted', 'approved', 'completed'];
    return acceptedStatuses.includes(status);
  };

  // Handle invoice preview
  const handlePreviewInvoice = async (paymentId: string) => {
    if (!company?.slug) {
      toast.error('Company information not available');
      return;
    }

    setIsLoadingInvoicePreview(true);
    try {
      const response = await fetch(`/api/client/${company.slug}/payments/${paymentId}/invoice-preview`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load invoice preview' }));
        throw new Error(errorData.error || 'Failed to load invoice preview');
      }

      const invoiceData = await response.json();
      setInvoicePreview(invoiceData);
      setIsInvoicePreviewOpen(true);
    } catch (error) {
      console.error('Error loading invoice preview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load invoice preview');
    } finally {
      setIsLoadingInvoicePreview(false);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (paymentId: string) => {
    if (!invoicePreviewRef.current || !invoicePreview) {
      toast.error('Invoice preview not available');
      return;
    }

    try {
      toast.loading('Generating invoice PDF...', { id: 'invoice-download' });
      
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = invoicePreviewRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `invoice-${invoicePreview.payment.reference_number || paymentId.slice(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          precision: 16
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['tr', 'td', 'table']
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await html2pdf().set(opt as any).from(element).save();
      
      toast.success('Invoice downloaded successfully', { id: 'invoice-download' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice', { id: 'invoice-download' });
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Payments" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
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
          title="Approved"
          value={metrics.approved}
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
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
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Error Loading Payments</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No Payments Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No payments found for this company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                    <TableCell isHeader className="w-[200px] min-w-[180px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Reference
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" /> Amount
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[140px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" /> Method
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" /> Payer
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5" /> Status
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Date
                      </div>
                    </TableCell>
                    <TableCell isHeader className="min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" /> Actions
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const isExpanded = expandedPayments.has(payment.id);
                const metadata = parseMetadata(payment.metadata);
                const cartItems = metadata?.cart_items || [];

                return (
                  <React.Fragment key={payment.id}>
                    <TableRow 
                      className={`cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
                        isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select')) return;
                        togglePaymentExpansion(payment.id);
                      }}
                    >
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePaymentExpansion(payment.id);
                            }}
                            className={`p-1 rounded-md transition-all duration-200 flex-shrink-0 ${
                              isExpanded 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-800 dark:text-gray-500'
                            }`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white block text-sm sm:text-base truncate">
                              {payment.reference_number || payment.id.slice(0, 8).toUpperCase()}
                            </span>
                            {payment.id && !payment.reference_number && (
                              <span className="text-xs text-gray-500 font-mono truncate block">ID: {payment.id.slice(0, 8)}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          {payment.payment_method.toLowerCase().includes('bank') ? (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          ) : payment.payment_method.toLowerCase().includes('crypto') ? (
                            <CreditCard className="w-4 h-4 text-purple-400" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="capitalize text-sm sm:text-base">{payment.payment_method.split(' - ')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm sm:text-base truncate block text-gray-700 dark:text-gray-300">{payment.payer_name || payment.payer_email || '-'}</span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={payment.status === 'Accepted' ? 'approved' : payment.status.toLowerCase()}
                            onChange={async (e) => {
                              e.stopPropagation();
                              await handleStatusUpdate(payment.id, e.target.value);
                            }}
                            disabled={updatingStatus === payment.id}
                            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {PAYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          {updatingStatus === payment.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {isPaymentAccepted(payment.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewInvoice(payment.id);
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                              title="Download invoice PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Invoice</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (payment.payment_proof_url) {
                                // Normalize URL - handle old bucket names
                                const proofUrl = payment.payment_proof_url.replace('/payment_proofs/', '/payment-proofs/');
                                setSelectedProofUrl(proofUrl);
                              }
                            }}
                            disabled={!payment.payment_proof_url}
                            className={`p-2 rounded-full transition-colors ${
                              payment.payment_proof_url
                                ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 cursor-pointer'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-50 cursor-not-allowed'
                            }`}
                            title={payment.payment_proof_url ? "View payment proof" : "No proof uploaded"}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
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
                                            {item.image && item.image.trim() && !imageErrors.has(`${payment.id}-${idx}`) ? (
                                              <Image 
                                                src={item.image} 
                                                alt={item.product_name} 
                                                fill 
                                                className="object-contain p-1" 
                                                onError={() => {
                                                  setImageErrors(prev => new Set(prev).add(`${payment.id}-${idx}`));
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
                                          {formatCurrency(item.unit_price, payment.currency)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {formatCurrency(item.total_price, payment.currency)}
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
                                        {formatCurrency(payment.amount, payment.currency)}
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

      {/* Payment Detail Modal */}
      {selectedPayment && (() => {
        // Parse metadata if it's a string
        let metadata: Record<string, unknown> = parseMetadata(selectedPayment.metadata) || {};
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            metadata = {};
          }
        }
        if (!metadata || typeof metadata !== 'object') {
          metadata = {};
        }

        const cartItems = (metadata?.cart_items || []) as CartItem[];
        const cartTotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.total_price, 0);

        return (
          <Dialog open={selectedPayment !== null} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
              <div className="bg-white dark:bg-gray-900">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        Payment Details
                      </DialogTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Order #{selectedPayment.reference_number || selectedPayment.id.slice(0, 8)}
                      </p>
                    </div>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </DialogHeader>

                <div className="px-6 py-6 space-y-6">
                  {/* Payment Information */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reference Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPayment.reference_number || selectedPayment.id.slice(0, 8)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPayment.payment_method.split(' - ')[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedPayment.created_at)}
                        </p>
                      </div>
                      {selectedPayment.payer_name && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payer</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedPayment.payer_name || selectedPayment.payer_email || '-'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {metadata && typeof metadata === 'object' && metadata.address_id && company?.id && (
                    <DeliveryAddressSection addressId={metadata.address_id} companyId={company.id} />
                  )}

                  {/* Cart Items */}
                  {cartItems.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                        Cart Items ({cartItems.length})
                      </h3>
                      <div className="space-y-3">
                        {cartItems.map((item: CartItem, idx: number) => (
                          <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                            {item.image && (
                              <div className="relative w-16 h-16 bg-white dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                <Image src={item.image} alt={item.product_name} fill className="object-contain p-1" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                {item.product_name}
                              </p>
                              {item.product_id && (
                                <p className="text-xs text-gray-500 font-mono mb-2">ID: {item.product_id}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>Qty: <span className="font-medium text-gray-900 dark:text-white">{item.quantity}</span></span>
                                <span>•</span>
                                <span>Unit: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.unit_price)}</span></span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(item.total_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subtotal</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(cartTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Information */}
                  {metadata && typeof metadata === 'object' && (metadata.quotation_id || metadata.company_id) && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Order Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {metadata.quotation_id && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quotation ID</p>
                            <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{metadata.quotation_id}</p>
                          </div>
                        )}
                        {metadata.company_id && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company ID</p>
                            <p className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300 break-all">{metadata.company_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Payment Proof Section */}
                  {selectedPayment && (selectedPayment.status === 'pending' || selectedPayment.status === 'Pending') && !selectedPayment.payment_proof_url && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Upload Payment Proof</h3>
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="proof-upload-store"
                          />
                          <label 
                            htmlFor="proof-upload-store"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                              uploadFile 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                          >
                            {uploadFile ? (
                              <div className="text-center">
                                <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 truncate max-w-xs">{uploadFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Click to change</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload proof</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (Max 10MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                        
                        <Button
                          variant="primary"
                          onClick={handleUploadProof}
                          disabled={!uploadFile || isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            'Submit Proof'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Payment Proof Uploaded */}
                  {selectedPayment && selectedPayment.payment_proof_url && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        Payment Proof
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Proof Submitted</h3>
                            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                              Payment proof has been received and is being reviewed.
                            </p>
                            <button
                              onClick={() => {
                                const proofUrl = selectedPayment.payment_proof_url?.replace('/payment_proofs/', '/payment-proofs/');
                                if (proofUrl) {
                                  setSelectedProofUrl(proofUrl);
                                  setSelectedPayment(null);
                                }
                              }}
                              className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-300 hover:underline"
                            >
                              <Eye className="w-4 h-4" />
                              View Proof
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Payment Proof Only Modal */}
      {selectedProofUrl && (
        <Dialog open={selectedProofUrl !== null} onOpenChange={() => setSelectedProofUrl(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
            <div className="bg-white dark:bg-gray-900">
              <DialogHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment Proof
                </DialogTitle>
              </DialogHeader>

              <div className="p-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <div className="relative w-full h-[70vh] bg-white dark:bg-gray-900 flex items-center justify-center">
                    {(() => {
                      const isPDF = selectedProofUrl.toLowerCase().endsWith('.pdf') || selectedProofUrl.includes('.pdf');
                      
                      if (isPDF) {
                        return (
                          <div className="text-center p-8">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">PDF Document</p>
                            <div className="flex items-center justify-center gap-3">
                              <a
                                href={selectedProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Open PDF
                              </a>
                              <button
                                onClick={() => handleDownloadProof(selectedProofUrl)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <Image
                          src={selectedProofUrl}
                          alt="Payment Proof"
                          fill
                          className="object-contain p-4"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-container')) {
                              parent.innerHTML = `
                                <div class="fallback-container text-center p-8">
                                  <div class="w-16 h-16 text-gray-400 mx-auto mb-4">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-16 h-16">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Unable to load image</p>
                                  <a href="${selectedProofUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    Open in new tab
                                  </a>
                                </div>
                              `;
                            }
                          }}
                        />
                      );
                    })()}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-4">
                    <a
                      href={selectedProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      Open in new tab
                    </a>
                    <button
                      onClick={() => handleDownloadProof(selectedProofUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice Preview Modal */}
      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
          <div className="bg-white dark:bg-gray-900">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                <span>Invoice Preview</span>
                <div className="flex items-center gap-2">
                  {invoicePreview && (
                    <button
                      onClick={() => handleDownloadInvoice(invoicePreview.payment.id)}
                      className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-6 space-y-6">
              {isLoadingInvoicePreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading invoice preview...</p>
                  </div>
                </div>
              ) : invoicePreview ? (
                <div 
                  ref={invoicePreviewRef} 
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  style={{
                    width: '210mm',
                    minHeight: 'auto',
                    maxWidth: '100%',
                    margin: '0 auto',
                    boxSizing: 'border-box',
                    padding: '20mm',
                    fontSize: '11px',
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      {invoicePreview.company.logo_url && (
                        <img
                          src={invoicePreview.company.logo_url}
                          alt={invoicePreview.company.name}
                          className="object-contain"
                          style={{ width: '60px', height: '60px', maxWidth: '60px', maxHeight: '60px' }}
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {invoicePreview.company.name}
                        </h2>
                        {invoicePreview.company.email && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">Email: {invoicePreview.company.email}</p>
                        )}
                        {invoicePreview.company.phone && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">Phone: {invoicePreview.company.phone}</p>
                        )}
                        {invoicePreview.company.address && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{invoicePreview.company.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">INVOICE</h1>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white">Invoice Details</p>
                        <p className="text-gray-600 dark:text-gray-400">Invoice #: {invoicePreview.payment.reference_number}</p>
                        <p className="text-gray-600 dark:text-gray-400">Date: {invoicePreview.payment.date}</p>
                        <p className="text-gray-600 dark:text-gray-400">Payment Method: {invoicePreview.payment.payment_method}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bill To */}
                  {(invoicePreview.payment.payer_name || invoicePreview.payment.payer_email) && (
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h3>
                      {invoicePreview.payment.payer_name && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{invoicePreview.payment.payer_name}</p>
                      )}
                      {invoicePreview.payment.payer_email && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{invoicePreview.payment.payer_email}</p>
                      )}
                    </div>
                  )}

                  {/* Products Table */}
                  {invoicePreview.items && invoicePreview.items.length > 0 ? (
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-3">
                      <table className="w-full" style={{ fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700" style={{ width: '45%' }}>PRODUCT</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700" style={{ width: '15%' }}>QUANTITY</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700" style={{ width: '20%' }}>UNIT PRICE</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700" style={{ width: '20%' }}>TOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {invoicePreview.items.map((item: InvoiceItem, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-xs text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">{item.product_name}</td>
                              <td className="px-3 py-3 text-xs text-center text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">{item.quantity}</td>
                              <td className="px-3 py-3 text-xs text-right text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                {invoicePreview.payment.currency} {item.unit_price.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-xs text-right font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">
                                {invoicePreview.payment.currency} {item.total_price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No items in this invoice</p>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="flex justify-end mb-3">
                    <div className="w-64 space-y-2">
                      {invoicePreview.items && invoicePreview.items.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal:</span>
                          <span className="text-gray-900 dark:text-white">
                            {invoicePreview.payment.currency} {invoicePreview.subtotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold border-t-2 border-gray-300 dark:border-gray-600 pt-2">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">
                          {invoicePreview.payment.currency} {invoicePreview.payment.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoicePreview.payment.payment_notes && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Notes:</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {invoicePreview.payment.payment_notes}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This is an automatically generated invoice.
                    </p>
                  </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No invoice data available</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
