"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { QuotationData } from "@/types/quotation";
import QuotationEditModal from "@/components/quotation/QuotationEditModal";
import PriceOptionsModal from "@/components/quotation/PriceOptionsModal";
import { VariantGroup } from "@/types/database";
import { useQuotationsQuery } from "@/hooks/useQuotationsQuery";
import { useQueryClient } from "@tanstack/react-query";
import { quotationKeys } from "@/hooks/useQuotationsQuery";
import { ITEMS_PER_PAGE } from "@/hooks/queries/fetchQuotations";

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

interface UserInfo { email: string; fullName: string; role: string; phone: string; country: string; }

const isValidImageUrl = (url: string | null | undefined) =>
  !!url && url.startsWith('https://tlvwyobhndrtidetltcp.supabase.co/');

/**
 * Thumbnail image for table rows.
 * - Renders a grey placeholder immediately so the row lays out with no jank.
 * - Loads the real image lazily (only when scrolled into view).
 * - quality=40 + sizes="40px" tells Next.js to serve the smallest possible
 *   variant (~2-5 KB instead of 100-500 KB).
 * - Fades in once loaded so the transition is smooth.
 */
function TableThumbnail({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      {/* Placeholder shown until image is ready */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        loading="lazy"
        quality={40}
        sizes="40px"
        className={`object-cover w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
          setLoaded(true);
        }}
      />
    </div>
  );
}

export default function QuotationPage() {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentQuotation, setCurrentQuotation] = useState<QuotationData | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [selectedStatus, debouncedSearch]);

  const { data, isLoading, error } = useQuotationsQuery({
    companyId: company?.id,
    page: currentPage,
    status: selectedStatus,
    search: debouncedSearch,
  });

  // Map raw rows to QuotationData shape consumed by modals
  const quotations: QuotationData[] = (data?.rows ?? []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    quotation_id: item.quotation_id || `QT-${item.id}`,
    product: {
      name: item.product_name || "",
      image: item.image_url || "",
      category: "",
      description: item.product_description || "",
    },
    quantity: item.quantity?.toString() || "0",
    date: item.created_at,
    status: item.status || "Pending",
    price: item.total_price_option1?.toString() || "0",
    shippingMethod: item.shipping_method || "",
    destination: item.shipping_city ? `${item.shipping_city}, ${item.shipping_country}` : "",
    hasImage: Boolean(item.image_url),
    Quotation_fees: item.Quotation_fees,
    user: item.profiles ? {
      email: item.profiles.email || "",
      fullName: item.profiles.full_name || "",
      role: item.profiles.role || "",
      phone: item.profiles.phone || "",
      address: "", city: "",
      country: item.profiles.country || "",
    } : undefined,
    service_type: item.service_type,
    title_option1: item.title_option1,
    total_price_option1: item.total_price_option1 !== undefined ? String(item.total_price_option1) : undefined,
    image_option1: item.image_option1,
    price_description_option1: item.price_description_option1,
    delivery_time_option1: item.delivery_time_option1,
    description_option1: item.description_option1,
    title_option2: item.title_option2,
    total_price_option2: item.total_price_option2,
    image_option2: item.image_option2,
    price_description_option2: item.price_description_option2,
    delivery_time_option2: item.delivery_time_option2,
    description_option2: item.description_option2,
    title_option3: item.title_option3,
    total_price_option3: item.total_price_option3,
    image_option3: item.image_option3,
    price_description_option3: item.price_description_option3,
    delivery_time_option3: item.delivery_time_option3,
    description_option3: item.description_option3,
    selected_option: item.selected_option,
    variant_groups: (item as { variant_groups?: VariantGroup[] | null }).variant_groups || undefined,
  }));

  const metrics = data?.metrics ?? { total: 0, approved: 0, pending: 0, rejected: 0 };
  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  const handleEdit = (quotation: QuotationData) => { setCurrentQuotation(quotation); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setCurrentQuotation(null); setIsEditModalOpen(false); };
  const handleQuotationUpdate = () => {
    if (company?.id) queryClient.invalidateQueries({ queryKey: quotationKeys.all(company.id) });
  };

  const UserInfoModal = ({ isOpen, onClose, userInfo }: { isOpen: boolean; onClose: () => void; userInfo: NonNullable<typeof selectedUserInfo> }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Information</h2>
          <div className="space-y-3">
            {[['Full Name', userInfo.fullName], ['Email', userInfo.email], ['Phone', userInfo.phone || 'Not provided'], ['Country', userInfo.country || 'Not provided']].map(([label, value]) => (
              <div key={label}><label className="text-sm text-gray-500 dark:text-gray-400">{label}</label><p className="text-gray-900 dark:text-white">{value}</p></div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Close</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Header */}
      <div className="col-span-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#0D47A1] dark:text-blue-400">Quotation Management</h1>
          <Link href="/admin/quotation/new">
            <Button variant="primary" size="sm" className="bg-[#1E88E5] hover:bg-[#0D47A1] dark:bg-blue-600 dark:hover:bg-blue-700">Create New Quote</Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="col-span-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {[
            { label: 'Total Quotes', value: metrics.total },
            { label: 'Approved Quotes', value: metrics.approved },
            { label: 'Pending Quotes', value: metrics.pending },
            { label: 'Rejected Quotes', value: metrics.rejected },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-[#E3F2FD] dark:bg-blue-900/30 rounded-xl">
                <svg className="text-[#0D47A1] dark:text-blue-400" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="mt-5">
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                <h4 className="mt-2 font-bold text-[#0D47A1] text-title-sm dark:text-blue-400">
                  {isLoading ? <span className="inline-block w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : value}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="col-span-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value as StatusOption); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search quotations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <svg className="absolute left-3 top-2.5 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="col-span-12">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="col-span-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['ID', 'Product', 'Service Type', 'Quantity', 'Date', 'Status', 'Price', 'User', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-4 font-semibold text-gray-700 text-left text-sm dark:text-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {isLoading ? (
                  // Skeleton rows — no blank screen, no spinner
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : quotations.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">No quotations found</td></tr>
                ) : (
                  quotations.map((item, index) => (
                    <tr key={`${item.quotation_id}-${index}`} className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300 text-sm">{item.quotation_id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.product?.image && isValidImageUrl(item.product.image) ? (
                            <TableThumbnail src={item.product.image} alt={item.product?.name || ''} />
                          ) : (
                            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">📷</div>
                          )}
                          <span className="font-medium text-gray-800 text-sm dark:text-white/90">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-sm dark:text-white/90">{item.service_type || '-'}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm dark:text-gray-400">{item.quantity}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm dark:text-gray-400">{item.date ? new Date(item.date).toLocaleDateString() : 'No date'}</td>
                      <td className="px-4 py-4">
                        <Badge color={item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'error'}
                          className={item.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm dark:text-gray-400">{item.price}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm dark:text-gray-400">
                        {item.user ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.user.fullName || 'Unknown'}</span>
                            <span className="text-xs text-blue-500 hover:underline cursor-pointer" onClick={() => setSelectedUserInfo({ email: item.user?.email || '', fullName: item.user?.fullName || '', role: item.user?.role || '', phone: item.user?.phone || '', country: item.user?.country || '' })}>
                              {item.user.email}
                            </span>
                            <div className="flex flex-col mt-1 text-xs text-gray-500">
                              {item.user.phone && <span>📱 {item.user.phone}</span>}
                              {item.user.country && <span>🌍 {item.user.country}</span>}
                            </div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && quotations.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, metrics.total)} of {metrics.total} items
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Previous</Button>
                {pageNumbers.map((n) => (
                  <Button key={n} variant={currentPage === n ? 'primary' : 'outline'} size="sm" onClick={() => setCurrentPage(n)}
                    className={currentPage === n ? 'bg-[#1E88E5] hover:bg-[#0D47A1]' : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'}>
                    {n}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {currentQuotation && (
        <QuotationEditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} quotation={currentQuotation} onUpdate={handleQuotationUpdate} />
      )}
      {currentQuotation && (
        <PriceOptionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} quotationId={currentQuotation.id}
          initialData={{ title_option1: currentQuotation.product.name, image_option1: currentQuotation.product.image, image_option2: null, image_option3: null }}
          onUpdate={handleQuotationUpdate} />
      )}
      {selectedUserInfo && (
        <UserInfoModal isOpen={!!selectedUserInfo} onClose={() => setSelectedUserInfo(null)} userInfo={selectedUserInfo} />
      )}
    </div>
  );
}
