'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InviteClientModal from '@/components/clients/InviteClientModal';
import Image from 'next/image';

interface Client {
  id: string;
  company_name?: string | null;
  tax_id?: string | null;
  status?: string | null;
  created_at?: string;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface ClientsPageClientProps {
  clients: Client[];
  companySlug: string;
}

export default function ClientsPageClient({ clients, companySlug }: ClientsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh(); // Refresh to show new client
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Clients" />
        <Button
          className="bg-brand-500 hover:bg-brand-600 text-white gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Invite Client
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client / Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {client.profile?.avatar_url ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={client.profile.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {(client.profile?.first_name?.[0] || client.company_name?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.company_name || 'Individual'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.profile?.first_name} {client.profile?.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{client.profile?.email}</div>
                    <div className="text-sm text-gray-500">{client.tax_id || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      client.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300">Edit</a>
                  </td>
                </tr>
              ))}
              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No clients yet</p>
                    <p className="text-sm mb-6">Invite your first client to get started.</p>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Invite Client
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companySlug={companySlug}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

