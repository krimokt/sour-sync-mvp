"use client";

import React, { useState } from "react";
import { BoxIconLine, GroupIcon, PaperPlaneIcon, DollarLineIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import DashboardShippingTracking from "@/components/shipping/DashboardShippingTracking";
import dynamic from "next/dynamic";
const QuotationFormModal = dynamic(() => import("@/components/quotation/QuotationFormModal"), { ssr: false });
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/hooks/useDashboardQuery";

export default function DashboardHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { company } = useAuth();
  const queryClient = useQueryClient();

  // Data is already prefetched in AdminLayout — renders instantly on first visit
  const { data, isLoading } = useDashboardQuery({ companyId: company?.id });

  const metrics = data?.metrics ?? { pendingQuotations: 0, activeShipments: 0, deliveredProducts: 0, totalSpend: 0 };
  const recentQuotations = data?.recentQuotations ?? [];
  const recentShipments = data?.recentShipments ?? [];

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all(company?.id ?? '') });

  const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
      <div className="flex items-center justify-center w-12 h-12 bg-[#E3F2FD] rounded-xl">{icon}</div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 font-bold text-[#0D47A1] text-title-sm dark:text-white/90">
            {isLoading ? <span className="inline-block w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : value}
          </h4>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Metric Cards */}
      <div className="col-span-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <MetricCard icon={<PaperPlaneIcon className="text-[#0D47A1] size-6" />} label="Quotation Pending" value={metrics.pendingQuotations} />
          <MetricCard icon={<BoxIconLine className="text-[#0D47A1] size-6" />} label="Active Shipments" value={metrics.activeShipments} />
          <MetricCard icon={<GroupIcon className="text-[#0D47A1] size-6" />} label="Delivered Products" value={metrics.deliveredProducts} />
          <MetricCard icon={<DollarLineIcon className="text-[#0D47A1] size-6" />} label="Total Spend" value={`$${metrics.totalSpend.toLocaleString()}`} />
        </div>
      </div>

      {/* Recent Quotations */}
      <div className="col-span-12">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
            <h3 className="font-semibold text-[#0D47A1] text-base dark:text-white/90">Recent Quotation Requests</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" className="bg-[#1E88E5] hover:bg-[#0D47A1]" onClick={() => setIsModalOpen(true)}>Create New Quote</Button>
              <Button variant="outline" size="sm" className="text-[#1E88E5] border-[#64B5F6] hover:bg-[#E3F2FD]" onClick={handleRefresh}>Refresh</Button>
              <Button variant="outline" size="sm" className="text-[#1E88E5] border-[#64B5F6] hover:bg-[#E3F2FD]" onClick={() => router.push('/quotation')}>View All</Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {['ID', 'Product', 'Quantity', 'Date', 'Status'].map(h => (
                    <TableHead key={h} className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : recentQuotations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="px-5 py-4 text-center text-gray-500">No quotations found</TableCell></TableRow>
                ) : (
                  recentQuotations.map(item => (
                    <TableRow key={item.id} className="transition-all duration-300 hover:bg-[#E3F2FD] cursor-pointer">
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-white/90">{item.id}</TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-lg relative">
                            {item.image_url ? (
                              <Image width={40} height={40} src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-xs text-gray-500">No img</div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-white/90">{item.quantity}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-white/90">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={item.status === 'Approved' ? 'success' : item.status === 'Processing' ? 'warning' : 'primary'}>{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Shipment Tracking */}
      <div className="col-span-12">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
            <h3 className="font-semibold text-[#0D47A1] text-base dark:text-white/90">Recent Shipment Tracking</h3>
            <Button variant="outline" size="sm" className="text-[#1E88E5] border-[#64B5F6] hover:bg-[#E3F2FD]" onClick={() => router.push('/shipment-tracking')}>View All Shipments</Button>
          </div>
          <DashboardShippingTracking passedShipmentData={recentShipments as never} />
        </div>
      </div>

      <QuotationFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
