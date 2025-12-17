'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import React from 'react';
import html2pdf from 'html2pdf.js';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useClient } from '@/context/ClientContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import CompanyPaymentMethods from '@/components/payment/CompanyPaymentMethods';
import { List, DollarSign, CheckCircle, Clock, X, Upload, Image as ImageIcon, Package, Eye, MapPin, Building2, CreditCard, FileText, Info, Copy, ChevronDown, ChevronUp, Download } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected', 'completed', 'failed'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

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
  payment_notes?: string;
  metadata?: {
    company_id?: string;
    quotation_id?: string;
    cart_items?: CartItem[];
    address_id?: string;
    payment_method_type?: string;
    payment_method_id?: string;
  };
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

// Payment Method Details Component
const PaymentMethodDetailsSection = ({ 
  paymentMethodType, 
  paymentMethodId, 
  amount, 
  currency,
  referenceNumber 
}: { 
  paymentMethodType?: string; 
  paymentMethodId?: string;
  amount: number;
  currency: string;
  referenceNumber: string;
}) => {
  const { company } = useClient();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentMethodId || !paymentMethodType || !company?.id) {
        setIsLoading(false);
        return;
      }

      try {
        if (paymentMethodType === 'bank') {
          const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('id', paymentMethodId)
            .eq('company_id', company.id)
            .single();

          if (!error && data) {
            setPaymentDetails(data);
          }
        } else if (paymentMethodType === 'crypto') {
          const { data, error } = await supabase
            .from('crypto_wallets')
            .select('*')
            .eq('id', paymentMethodId)
            .eq('company_id', company.id)
            .single();

          if (!error && data) {
            setPaymentDetails(data);
          }
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentMethodId, paymentMethodType, company?.id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Instructions</h3>
        </div>
        <p className="text-sm text-gray-500">Loading payment details...</p>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Instructions</h3>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Payment method details not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Instructions</h3>
        </div>
        <Badge variant="warning" className="text-xs font-semibold">Amount: {formatCurrency(amount, currency)}</Badge>
      </div>

      {paymentMethodType === 'bank' && paymentDetails && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-4 mb-6">
              {paymentDetails.image_url && (
                <div className="relative w-20 h-16 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 p-2">
                  <Image src={paymentDetails.image_url} alt={paymentDetails.bank_name} fill className="object-contain" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{paymentDetails.bank_name}</h4>
                {paymentDetails.account_name && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Holder: <span className="text-gray-900 dark:text-white font-semibold">{paymentDetails.account_name}</span></p>
                )}
                {paymentDetails.currency && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency: <span className="text-gray-900 dark:text-white font-semibold">{paymentDetails.currency}</span></p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentDetails.account_number && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Number</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all">{paymentDetails.account_number}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.account_number, 'account_number')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedField === 'account_number' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentDetails.rib && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">RIB</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all">{paymentDetails.rib}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.rib, 'rib')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedField === 'rib' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentDetails.iban && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">IBAN</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all">{paymentDetails.iban}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.iban, 'iban')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedField === 'iban' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentDetails.swift_code && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">SWIFT Code</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all">{paymentDetails.swift_code}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.swift_code, 'swift')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedField === 'swift' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentDetails.routing_number && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Routing Number</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all">{paymentDetails.routing_number}</p>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.routing_number, 'routing')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedField === 'routing' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentDetails.branch_name && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Branch Name</p>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{paymentDetails.branch_name}</p>
                </div>
              )}
            </div>

            {paymentDetails.instructions && (
              <div className="col-span-full mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2">Special Instructions</p>
                <p className="text-sm text-blue-800 dark:text-blue-400 font-medium whitespace-pre-wrap">{paymentDetails.instructions}</p>
              </div>
            )}

            <div className="col-span-full mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Payment Reference</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">{referenceNumber}</p>
                <button
                  onClick={() => copyToClipboard(referenceNumber, 'reference')}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copiedField === 'reference' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">Please include this reference when making the payment</p>
            </div>
          </div>
        </div>
      )}

      {paymentMethodType === 'crypto' && paymentDetails && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-4 mb-6">
              {paymentDetails.image_url && (
                <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 p-2">
                  <Image src={paymentDetails.image_url} alt={paymentDetails.wallet_name} fill className="object-contain" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{paymentDetails.wallet_name}</h4>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {paymentDetails.cryptocurrency}
                  {paymentDetails.network && <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded text-xs font-bold text-purple-700 dark:text-purple-300">{paymentDetails.network}</span>}
                </p>
              </div>
            </div>

            {paymentDetails.wallet_address && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Wallet Address</p>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono font-bold text-sm text-gray-900 dark:text-white break-all flex-1">{paymentDetails.wallet_address}</p>
                  <button
                    onClick={() => copyToClipboard(paymentDetails.wallet_address, 'wallet_address')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copiedField === 'wallet_address' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-purple-500" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {paymentDetails.qr_code_url && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 text-center">Scan QR Code</p>
                <div className="flex justify-center">
                  <div className="relative w-52 h-52 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-700 p-3 shadow-lg">
                    <Image src={paymentDetails.qr_code_url} alt="QR Code" fill className="object-contain" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Payment Reference</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">{referenceNumber}</p>
                <button
                  onClick={() => copyToClipboard(referenceNumber, 'reference')}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copiedField === 'reference' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-purple-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-400 mt-2 font-medium">Please include this reference when making the payment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Delivery Address Component
const DeliveryAddressSection = ({ addressId, companyId }: { addressId: string; companyId: string }) => {
  const { client } = useClient();
  const [address, setAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId || !client?.user_id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('client_addresses')
          .select('*')
          .eq('id', addressId)
          .eq('user_id', client.user_id)
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
  }, [addressId, client?.user_id, companyId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h3>
        </div>
        <p className="text-sm text-gray-500">Loading address...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h3>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Address ID: <span className="font-mono text-xs">{addressId}</span></p>
          <p className="text-sm text-gray-500 mt-2 italic">Address details not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h3>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-2">
        {address.full_name && (
          <p className="text-base font-bold text-gray-900 dark:text-white">{address.full_name}</p>
        )}
        {address.company_name && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{address.company_name}</p>
        )}
        {address.address_line_1 && (
          <p className="text-sm text-gray-700 dark:text-gray-300">{address.address_line_1}</p>
        )}
        {address.address_line_2 && (
          <p className="text-sm text-gray-700 dark:text-gray-300">{address.address_line_2}</p>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}
        </p>
        {address.country && (
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{address.country}</p>
        )}
        {address.phone && (
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">Phone:</span> {address.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ClientPaymentsPage() {
  const { company, client } = useClient();
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
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadPaymentId, setUploadPaymentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const tableFileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(() => new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());
  const [viewReplaceProof, setViewReplaceProof] = useState<{ paymentId: string; proofUrl: string } | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const replaceFileInputRef = React.useRef<HTMLInputElement>(null);
  const [invoicePreview, setInvoicePreview] = useState<any>(null);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isLoadingInvoicePreview, setIsLoadingInvoicePreview] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!company?.id || !client?.user_id) {
      setError('No company found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch payments for user - we'll filter by company_id client-side to handle both column and metadata
      const { data: allPayments, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching payments:', fetchError);
        throw fetchError;
      }

      // Filter by company_id (check both column and metadata)
      let filteredPayments = (allPayments || []).filter((p: any) => {
        // First check if company_id column exists and matches
        if (p.company_id && p.company_id === company.id) {
          return true;
        }

        // Then check metadata.company_id for backward compatibility
        let metadata = p.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            metadata = {};
          }
        }

        if (metadata && typeof metadata === 'object' && 'company_id' in metadata) {
          return metadata.company_id === company.id;
        }
        
        return false;
      });

      // Apply status filter
      if (selectedStatus !== 'All') {
        filteredPayments = filteredPayments.filter((p: any) => {
          const status = p.status?.toLowerCase();
          if (selectedStatus === 'pending') return status === 'pending';
          if (selectedStatus === 'approved') return status === 'approved' || status === 'accepted' || status === 'completed';
          if (selectedStatus === 'rejected') return status === 'rejected' || status === 'failed';
          return true;
        });
      }

      // Paginate
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;
      const paginatedPayments = filteredPayments.slice(from, to);

      setPayments(paginatedPayments);
      setTotalPages(Math.ceil(filteredPayments.length / ITEMS_PER_PAGE));

      // Metrics - fetch all and filter
      const { data: allMetricsData } = await supabase
        .from('payments')
        .select('status, amount, company_id, metadata')
        .eq('user_id', client.user_id);
      
      const metricsData = (allMetricsData || []).filter((p: any) => {
        // First check company_id column
        if (p.company_id && p.company_id === company.id) {
          return true;
        }

        // Then check metadata.company_id
        let metadata = p.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            metadata = {};
          }
        }

        if (metadata && typeof metadata === 'object' && 'company_id' in metadata) {
          return metadata.company_id === company.id;
        }
        return false;
      });

      if (metricsData) {
        setMetrics({
          total: metricsData.length,
          completed: metricsData.filter((p) => p.status === 'approved' || p.status === 'completed' || p.status === 'Accepted').length,
          pending: metricsData.filter((p) => p.status === 'pending' || p.status === 'Pending').length,
          failed: metricsData.filter((p) => p.status === 'rejected' || p.status === 'failed' || p.status === 'Rejected').length,
          totalAmount: metricsData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        });
      }
    } catch (err) {
      console.error('Error fetching client payments:', err);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, client?.user_id, currentPage, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
      completed: 'success',
      approved: 'success',
      Accepted: 'success',
      pending: 'warning',
      Pending: 'warning',
      failed: 'error',
      rejected: 'error',
      Rejected: 'error',
    };
    return <Badge variant={statusColors[status] || 'warning'}>{status}</Badge>;
  };

  const isPaymentAccepted = (status: string): boolean => {
    const acceptedStatuses = ['Accepted', 'accepted', 'approved', 'completed'];
    return acceptedStatuses.includes(status);
  };

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

  const handleDownloadInvoice = async (paymentId: string) => {
    if (!invoicePreviewRef.current || !invoicePreview) {
      toast.error('Invoice preview not available');
      return;
    }

    try {
      // Show loading state
      toast.loading('Generating invoice PDF...', { id: 'invoice-download' });
      
      // Get the invoice content element
      const element = invoicePreviewRef.current;
      
      // Configure html2pdf options for A4 (210mm x 297mm)
      // A4 dimensions: 210mm x 297mm = 8.27" x 11.69" = 794px x 1123px at 96 DPI
      const opt = {
        margin: [10, 10, 10, 10], // Top, Right, Bottom, Left in mm - reduced for better fit
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

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();
      
      toast.success('Invoice downloaded successfully', { id: 'invoice-download' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice', { id: 'invoice-download' });
    }
  };

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

  const handleUploadProof = async () => {
    if (!uploadPaymentId || !uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `payment_proof_${uploadPaymentId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, uploadFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update the payment_proof_url in the payments table using MCP Supabase
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          payment_proof_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', uploadPaymentId);

      if (updateError) {
        console.error('Error updating payment_proof_url:', updateError);
        throw new Error(`Failed to update payment record: ${updateError.message}`);
      }

      toast.success('Payment proof uploaded successfully');
      
      // Update the payment in the list immediately to show the proof
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === uploadPaymentId 
            ? { ...p, payment_proof_url: urlData.publicUrl }
            : p
        )
      );
      
      // Open the payment details modal to show the uploaded proof
      const updatedPayment = payments.find(p => p.id === uploadPaymentId);
      if (updatedPayment) {
        setSelectedPayment({ ...updatedPayment, payment_proof_url: urlData.publicUrl });
      }
      
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPaymentId(null);
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

  // Replace payment proof
  const handleReplaceProof = async () => {
    if (!viewReplaceProof || !replaceFile) {
      toast.error('Please select a file to replace');
      return;
    }

    setIsReplacing(true);
    try {
      const fileExt = replaceFile.name.split('.').pop();
      const fileName = `payment_proof_${viewReplaceProof.paymentId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, replaceFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          payment_proof_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', viewReplaceProof.paymentId);

      if (updateError) {
        console.error('Error updating payment_proof_url:', updateError);
        throw new Error(`Failed to update payment record: ${updateError.message}`);
      }

      toast.success('Payment proof replaced successfully');
      
      // Update the payment in the list
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === viewReplaceProof.paymentId 
            ? { ...p, payment_proof_url: urlData.publicUrl }
            : p
        )
      );
      
      // Update the view/replace modal with new URL
      setViewReplaceProof({ ...viewReplaceProof, proofUrl: urlData.publicUrl });
      setReplaceFile(null);
      fetchData();
    } catch (error) {
      console.error('Replace error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to replace payment proof');
    } finally {
      setIsReplacing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Payments" />

      {/* Company Payment Methods */}
      {company && <CompanyPaymentMethods companySlug={company.slug} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
        <StatCard title="Total Payments" value={metrics.total} variant="dark" icon={<List className="w-5 h-5" />} />
        <StatCard title="Total Amount" value={formatCurrency(metrics.totalAmount)} icon={<DollarSign className="w-5 h-5 text-green-600" />} />
        <StatCard title="Completed" value={metrics.completed} icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
        <StatCard title="Pending" value={metrics.pending} icon={<Clock className="w-5 h-5 text-yellow-500" />} />
        <StatCard title="Failed" value={metrics.failed} icon={<X className="w-5 h-5 text-red-500" />} />
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
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Error Loading Payments</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading your payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No Payments Found</h3>
            <p className="text-gray-500 dark:text-gray-400">You haven't made any payments yet.</p>
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
                        <Upload className="h-3.5 w-3.5" /> Proof
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
                      // @ts-ignore - TableRow onClick is needed for expand functionality
                      onClick={(e: React.MouseEvent) => {
                        // Don't toggle if clicking on the expand button
                        if ((e.target as HTMLElement).closest('button')) return;
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
                          <span className="capitalize">{payment.payment_method.split(' - ')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400">
                        <span className="text-sm sm:text-base truncate block">{payment.payer_name || payment.payer_email || '-'}</span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {payment.payment_proof_url ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const proofUrl = payment.payment_proof_url!.replace('/payment_proofs/', '/payment-proofs/');
                                setViewReplaceProof({ paymentId: payment.id, proofUrl });
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                              title="View/Replace payment proof"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">View/Replace</span>
                            </button>
                          ) : (
                            <>
                              <input
                                ref={tableFileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setUploadPaymentId(payment.id);
                                    setUploadFile(file);
                                    setIsUploadModalOpen(true);
                                  }
                                  // Reset input so same file can be selected again
                                  if (e.target) {
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadPaymentId(payment.id);
                                  tableFileInputRef.current?.click();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                                title="Upload payment proof"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Upload</span>
                              </button>
                            </>
                          )}
                          {isPaymentAccepted(payment.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewInvoice(payment.id);
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                              title="Preview invoice"
                              disabled={isLoadingInvoicePreview}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Invoice</span>
                            </button>
                          )}
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
        let metadata: any = selectedPayment.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            metadata = {};
          }
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

                  {/* Delivery Address */}
                  {metadata?.address_id && company && (
                    <DeliveryAddressSection addressId={metadata.address_id} companyId={company.id} />
                  )}

                  {/* Payment Instructions */}
                  {(metadata?.payment_method_type || metadata?.payment_method_id) && (
                    <PaymentMethodDetailsSection 
                      paymentMethodType={metadata.payment_method_type} 
                      paymentMethodId={metadata.payment_method_id}
                      amount={selectedPayment.amount}
                      currency={selectedPayment.currency}
                      referenceNumber={selectedPayment.reference_number || selectedPayment.id.slice(0, 8)}
                    />
                  )}

                  {/* Upload Proof Section */}
                  {(selectedPayment.status === 'pending' || selectedPayment.status === 'Pending') && !selectedPayment.payment_proof_url && (
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
                            id="proof-upload-modal"
                          />
                          <label 
                            htmlFor="proof-upload-modal"
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
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  {selectedPayment.payment_proof_url && (
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
                              Your payment proof has been received and is being reviewed.
                            </p>
                            <a 
                              href={selectedPayment.payment_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-300 hover:underline"
                            >
                              <Eye className="w-4 h-4" /> View Document
                            </a>
                          </div>
                        </div>
                        {/* Display proof image */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                          <div className="relative w-full h-96 bg-white dark:bg-gray-900 flex items-center justify-center">
                            {selectedPayment.payment_proof_url.toLowerCase().endsWith('.pdf') ? (
                              <div className="text-center p-8">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">PDF Document</p>
                                <a
                                  href={selectedPayment.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Open PDF
                                </a>
                              </div>
                            ) : (
                              <Image
                                src={selectedPayment.payment_proof_url}
                                alt="Payment Proof"
                                fill
                                className="object-contain p-4"
                                onError={(e) => {
                                  // If image fails to load, show fallback
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="text-center p-8">
                                        <div class="w-16 h-16 text-gray-400 mx-auto mb-4">
                                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                        </div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Unable to load image</p>
                                        <a href="${selectedPayment.payment_proof_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
                            )}
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
                            <a
                              href={selectedPayment.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <Eye className="w-4 h-4" />
                              Open in new tab
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Notes */}
                  {selectedPayment.payment_notes && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Additional Notes</h3>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                        {selectedPayment.payment_notes?.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => {
                          // Check if line starts with a label (Delivery Address, Country, City, Phone, Payment Method)
                          const isLabel = /^(Delivery Address|Country|City|Phone|Payment Method):/i.test(line);
                          const isPaymentMethod = /^Payment Method:/i.test(line);
                          
                          if (isLabel) {
                            const [label, ...valueParts] = line.split(':');
                            const value = valueParts.join(':').trim();
                            
                            return (
                              <div key={index} className={`${isPaymentMethod ? 'pt-2 mt-2 border-t border-gray-200 dark:border-gray-700' : ''}`}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                                  <span className="font-semibold text-gray-900 dark:text-white text-sm min-w-[120px] flex-shrink-0">
                                    {label}:
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 text-sm flex-1 break-words">
                                    {value}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Information */}
                  {(metadata?.quotation_id || metadata?.company_id) && (
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
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Simple Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
        setIsUploadModalOpen(open);
        if (!open) {
          setUploadFile(null);
          setUploadPaymentId(null);
        }
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Payment Proof
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="proof-upload"
                />
                <label 
                  htmlFor="proof-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    uploadFile 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  {uploadFile ? (
                    <div className="text-center px-4">
                      <FileText className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">{uploadFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Click to select file</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPaymentId(null);
                  }}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUploadProof}
                  disabled={!uploadFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Replace Proof Modal */}
      {viewReplaceProof && (
        <Dialog open={viewReplaceProof !== null} onOpenChange={() => {
          setViewReplaceProof(null);
          setReplaceFile(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 border-0 shadow-2xl">
            <div className="bg-white dark:bg-gray-900">
              <DialogHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment Proof
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Image View */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <div className="relative w-full h-[50vh] bg-white dark:bg-gray-900 flex items-center justify-center">
                    {(() => {
                      const isPDF = viewReplaceProof.proofUrl.toLowerCase().endsWith('.pdf') || viewReplaceProof.proofUrl.includes('.pdf');
                      
                      if (isPDF) {
                        return (
                          <div className="text-center p-8">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">PDF Document</p>
                            <div className="flex items-center justify-center gap-3">
                              <a
                                href={viewReplaceProof.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Open PDF
                              </a>
                              <button
                                onClick={() => handleDownloadProof(viewReplaceProof.proofUrl)}
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
                          src={viewReplaceProof.proofUrl}
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
                                  <a href="${viewReplaceProof.proofUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <a
                      href={viewReplaceProof.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      Open in new tab
                    </a>
                    <button
                      onClick={() => handleDownloadProof(viewReplaceProof.proofUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Replace Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Replace Payment Proof</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        ref={replaceFileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="replace-proof-upload"
                      />
                      <label 
                        htmlFor="replace-proof-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                          replaceFile 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        {replaceFile ? (
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 truncate max-w-xs">{replaceFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to change file</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to select replacement file</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (Max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    
                    <Button
                      variant="primary"
                      onClick={handleReplaceProof}
                      disabled={!replaceFile || isReplacing}
                      className="w-full"
                    >
                      {isReplacing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Replacing...</span>
                        </div>
                      ) : (
                        'Replace Proof'
                      )}
                    </Button>
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
                          {invoicePreview.items.map((item: any, index: number) => (
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




