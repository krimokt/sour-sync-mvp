'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import Link from 'next/link';
import { Building2, UserCircle, Award, Circle } from 'lucide-react';

export default function StoreDashboard() {
  const { company, profile, canManage } = useStore();

  if (!company || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Stats Cards */}
        <StatCard
          title="Company"
          value={company.name}
          variant="dark"
          icon={<Building2 className="w-5 h-5" />}
        />

        <StatCard
          title="Your Role"
          value={<span className="capitalize">{profile.role}</span>}
          icon={<UserCircle className="w-5 h-5" />}
        />

        <StatCard
          title="Plan"
          value={<span className="capitalize">{company.plan}</span>}
          icon={<Award className="w-5 h-5" />}
        />

        <StatCard
          title="Status"
          value={
            <div className="flex items-center gap-2">
              <Circle className={`w-3 h-3 ${company.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
              <span className="capitalize">{company.status}</span>
            </div>
          }
          icon={
            <Circle className={`w-5 h-5 ${company.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
          }
        />
      </div>

      {/* Welcome Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to <span className="uppercase tracking-wider text-[#06b6d4]">{company.name}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hello <span className="font-semibold text-gray-900 dark:text-white">{profile.full_name || profile.email}</span>! You are logged in as{' '}
            <span className="text-sm font-semibold uppercase tracking-wider text-[#06b6d4]">{profile.role}</span>.
          </p>
        </div>
        
        {canManage && (
          <div className="bg-gradient-to-r from-[#06b6d4]/10 to-[#0f7aff]/10 dark:from-[#06b6d4]/20 dark:to-[#0f7aff]/20 rounded-xl p-4 mb-6 border border-[#06b6d4]/20 shadow-sm">
            <p className="text-[#06b6d4] dark:text-[#06b6d4] text-sm font-medium">
              <span className="text-sm font-semibold uppercase tracking-wider">Admin Access:</span> You have full management access to this store.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/store/${company.slug}/quotations`}
            className="group flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-[#0f7aff]/5 hover:to-[#06b6d4]/5 dark:hover:from-[#0f7aff]/10 dark:hover:to-[#06b6d4]/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#0f7aff]/30 hover:shadow-md"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4]/10 to-[#0f7aff]/10 group-hover:from-[#06b6d4]/20 group-hover:to-[#0f7aff]/20 transition-all">
              <svg className="fill-[#06b6d4] group-hover:fill-[#0f7aff] transition-colors" width="22" height="22" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-1 group-hover:text-[#0f7aff] transition-colors">Quotations</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage quotation requests</p>
            </div>
          </Link>

          <Link
            href={`/store/${company.slug}/payments`}
            className="group flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-[#0f7aff]/5 hover:to-[#06b6d4]/5 dark:hover:from-[#0f7aff]/10 dark:hover:to-[#06b6d4]/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#0f7aff]/30 hover:shadow-md"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4]/10 to-[#0f7aff]/10 group-hover:from-[#06b6d4]/20 group-hover:to-[#0f7aff]/20 transition-all">
              <svg className="fill-[#06b6d4] group-hover:fill-[#0f7aff] transition-colors" width="22" height="22" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H6a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1v-6a1 1 0 00-1-1zm-7 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-1 group-hover:text-[#0f7aff] transition-colors">Payments</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track payment status</p>
            </div>
          </Link>

          <Link
            href={`/store/${company.slug}/shipping`}
            className="group flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-[#0f7aff]/5 hover:to-[#06b6d4]/5 dark:hover:from-[#0f7aff]/10 dark:hover:to-[#06b6d4]/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#0f7aff]/30 hover:shadow-md"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4]/10 to-[#0f7aff]/10 group-hover:from-[#06b6d4]/20 group-hover:to-[#0f7aff]/20 transition-all">
              <svg className="fill-[#06b6d4] group-hover:fill-[#0f7aff] transition-colors" width="22" height="22" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016 5h-2V4a1 1 0 00-1-1H3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-1 group-hover:text-[#0f7aff] transition-colors">Shipping</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track shipments</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
