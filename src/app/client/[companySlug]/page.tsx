'use client';

import React from 'react';
import { useClient } from '@/context/ClientContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import StatCard from '@/components/common/StatCard';
import Link from 'next/link';
import { Building2, UserCircle, Award, Circle, Package, Send } from 'lucide-react';

export default function ClientDashboard() {
  const { company, profile, client } = useClient();

  if (!company || !profile || !client) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Client Dashboard" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Stats Cards */}
        <StatCard
          title="Company"
          value={company.name}
          variant="dark"
          icon={<Building2 className="w-5 h-5" />}
        />

        <StatCard
          title="Your Status"
          value={<span className="capitalize">{client.status}</span>}
          icon={<UserCircle className="w-5 h-5" />}
        />

        <StatCard
          title="Client Name"
          value={client.company_name || profile.full_name || 'N/A'}
          icon={<Award className="w-5 h-5" />}
        />

        <StatCard
          title="Account Status"
          value={
            <div className="flex items-center gap-2">
              <Circle className={`w-3 h-3 ${client.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
              <span className="capitalize">{client.status}</span>
            </div>
          }
          icon={
            <Circle className={`w-5 h-5 ${client.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
          }
        />
      </div>

      {/* Welcome Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to <span className="uppercase tracking-wider text-[#06b6d4]">{company.name}</span> Client Portal
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hello <span className="font-semibold text-gray-900 dark:text-white">{profile.full_name || profile.email}</span>! You are logged in as a{' '}
            <span className="text-sm font-semibold uppercase tracking-wider text-[#06b6d4]">Client</span>.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-[#06b6d4]/10 to-[#0f7aff]/10 dark:from-[#06b6d4]/20 dark:to-[#0f7aff]/20 rounded-xl p-4 mb-6 border border-[#06b6d4]/20 shadow-sm">
          <p className="text-[#06b6d4] dark:text-[#06b6d4] text-sm font-medium">
            <span className="text-sm font-semibold uppercase tracking-wider">Client Access:</span> You have access to view products and manage your quotations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/client/${company.slug}/products`}
            className="group flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-[#0f7aff]/5 hover:to-[#06b6d4]/5 dark:hover:from-[#0f7aff]/10 dark:hover:to-[#06b6d4]/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#0f7aff]/30 hover:shadow-md"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4]/10 to-[#0f7aff]/10 group-hover:from-[#06b6d4]/20 group-hover:to-[#0f7aff]/20 transition-all">
              <Package className="w-6 h-6 text-[#06b6d4] group-hover:text-[#0f7aff] transition-colors" />
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-1 group-hover:text-[#0f7aff] transition-colors">Products</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Browse available products</p>
            </div>
          </Link>

          <Link
            href={`/client/${company.slug}/quotations`}
            className="group flex items-center p-5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-[#0f7aff]/5 hover:to-[#06b6d4]/5 dark:hover:from-[#0f7aff]/10 dark:hover:to-[#06b6d4]/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-[#0f7aff]/30 hover:shadow-md"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#06b6d4]/10 to-[#0f7aff]/10 group-hover:from-[#06b6d4]/20 group-hover:to-[#0f7aff]/20 transition-all">
              <Send className="w-6 h-6 text-[#06b6d4] group-hover:text-[#0f7aff] transition-colors" />
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-1 group-hover:text-[#0f7aff] transition-colors">Quotations</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and manage your quotations</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}














