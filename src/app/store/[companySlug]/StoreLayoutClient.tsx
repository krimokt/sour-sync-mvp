'use client';

import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import StoreSidebar from './StoreSidebar';
import Backdrop from '@/layout/Backdrop';
import React, { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

interface StoreLayoutClientProps {
  children: React.ReactNode;
  companySlug: string;
}

export default function StoreLayoutClient({ children, companySlug }: StoreLayoutClientProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { company } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const basePath = `/store/${companySlug}`;

  const isSubscriptionExpired = useMemo(() => {
    const expiresAt = company?.subscription_expires_at;
    if (!expiresAt) return false; // if not set, don't lock
    const dt = new Date(expiresAt);
    if (Number.isNaN(dt.getTime())) return false;
    return dt.getTime() <= Date.now();
  }, [company?.subscription_expires_at]);

  // Client-side guard: if expired, allow only Dashboard + Subscription, redirect everything else.
  useEffect(() => {
    if (!isSubscriptionExpired) return;
    if (!pathname) return;

    const isAllowed =
      pathname === basePath || pathname === `${basePath}/` || pathname.startsWith(`${basePath}/subscription`);

    if (!isAllowed) {
      router.replace(`${basePath}/subscription`);
    }
  }, [isSubscriptionExpired, pathname, router, basePath]);

  // Dynamic class for main content margin based on sidebar state
  // Must match StoreSidebar widths: 272px expanded, 72px collapsed
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[272px]'
    : 'lg:ml-[72px]';

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <StoreSidebar companySlug={companySlug} />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="min-h-[calc(100vh-64px)] dash-surface dark:bg-gray-900">
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 lg:p-8">
            {isSubscriptionExpired && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200">
                <div className="text-sm font-semibold uppercase tracking-wider">Subscription expired</div>
                <div className="text-sm mt-1">
                  Your subscription has expired. You can view the dashboard and subscription page, but all other
                  sections are locked until renewal.
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

