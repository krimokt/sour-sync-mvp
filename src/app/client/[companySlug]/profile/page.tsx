'use client';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useClient } from '@/context/ClientContext';

export default function ClientProfilePage() {
  const { company, profile, client } = useClient();

  return (
    <>
      <PageBreadcrumb pageTitle="Profile" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Profile
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Full name</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {profile?.full_name || '-'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {profile?.email || '-'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-900 dark:text-white font-medium">
                Client
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Company</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {company?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Client company name</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {client?.company_name || '-'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Status</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {client?.status || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}





