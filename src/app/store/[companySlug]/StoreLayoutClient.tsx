'use client';

import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import StoreSidebar from './StoreSidebar';
import Backdrop from '@/layout/Backdrop';
import React from 'react';

interface StoreLayoutClientProps {
  children: React.ReactNode;
  companySlug: string;
}

export default function StoreLayoutClient({ children, companySlug }: StoreLayoutClientProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[290px]'
    : 'lg:ml-[90px]';

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
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

