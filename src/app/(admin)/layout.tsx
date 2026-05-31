"use client";

import { useSidebar, SidebarProvider } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { useAuth, AuthProvider } from "@/context/AuthContext";
import { DataPrefetcher } from "@/components/DataPrefetcher";
import { QueryProvider } from "@/providers/QueryProvider";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { company } = useAuth();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <DataPrefetcher companyId={company?.id} />
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="min-h-[calc(100vh-64px)] dash-surface dark:bg-gray-900">
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <SidebarProvider>
          <AdminShell>{children}</AdminShell>
        </SidebarProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
