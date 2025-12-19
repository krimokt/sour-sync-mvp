'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Ban, CheckCircle, Link2 } from 'lucide-react';
import InviteClientModal from '@/components/clients/InviteClientModal';
import GenerateMagicLinkModal from '@/components/clients/GenerateMagicLinkModal';
import Image from 'next/image';

interface Client {
  id: string;
  company_name?: string | null;
  tax_id?: string | null;
  status?: string | null;
  created_at?: string;
  phone_e164?: string | null;
  profiles?: {
    full_name?: string | null;
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
  const [isMagicLinkModalOpen, setIsMagicLinkModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [banningClientId, setBanningClientId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  const handleSuccess = (clientData?: { id: string; email?: string; fullName?: string; phone?: string }) => {
    router.refresh(); // Refresh to show new client
    
    // If client data is provided and we should generate magic link, open the modal
    if (clientData) {
      // Wait a bit for the refresh to complete, then open magic link modal
      setTimeout(() => {
        setSelectedClient({
          id: clientData.id,
          profiles: {
            email: clientData.email || null,
            full_name: clientData.fullName || null,
          },
          phone_e164: clientData.phone || null,
        } as Client);
        setIsMagicLinkModalOpen(true);
      }, 500);
    }
  };

  const handleBanClient = async (clientId: string, currentStatus: string) => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'inactive' ? 'activate' : 'ban'} this client?`)) {
      return;
    }

    setBanningClientId(clientId);
    try {
      const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
      const response = await fetch(`/api/store/${companySlug}/clients/${clientId}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update client status');
      }

      router.refresh(); // Refresh to show updated status
      setOpenMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setBanningClientId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Clients" />
        <Button
          className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 text-white dark:text-white gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create New Client
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
                        {client.profiles?.avatar_url ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={client.profiles.avatar_url}
                            alt=""
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {(client.profiles?.full_name?.[0]?.trim() || client.company_name?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.company_name || 'Individual'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.profiles?.full_name || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{client.profiles?.email}</div>
                    <div className="text-sm text-gray-500">{client.tax_id || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      client.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      client.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {client.status === 'inactive' ? 'Banned' : client.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={banningClientId === client.id}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === client.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsMagicLinkModalOpen(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Link2 className="w-4 h-4 text-blue-600" />
                                Generate Magic Link
                              </button>
                              {client.status === 'inactive' ? (
                                <button
                                  onClick={() => handleBanClient(client.id, client.status || 'active')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  disabled={banningClientId === client.id}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Activate Client
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanClient(client.id, client.status || 'active')}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  disabled={banningClientId === client.id}
                                >
                                  <Ban className="w-4 h-4" />
                                  {banningClientId === client.id ? 'Banning...' : 'Ban Client'}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No clients yet</p>
                    <p className="text-sm mb-6">Create your first client to get started.</p>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Create New Client
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

      {selectedClient && (
        <GenerateMagicLinkModal
          isOpen={isMagicLinkModalOpen}
          onClose={() => {
            setIsMagicLinkModalOpen(false);
            setSelectedClient(null);
          }}
          companySlug={companySlug}
          clientId={selectedClient.id}
          clientName={selectedClient.profiles?.full_name || selectedClient.company_name || undefined}
          clientPhone={selectedClient.phone_e164 || undefined}
          clientEmail={selectedClient.profiles?.email || undefined}
        />
      )}
    </div>
  );
}

