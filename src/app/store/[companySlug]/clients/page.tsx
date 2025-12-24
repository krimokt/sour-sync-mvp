'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/ui/button';
import { Plus, Ban, CheckCircle, Loader2, Link2, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Client {
  id: string;
  company_id: string;
  user_id: string;
  status: string;
  company_name: string | null;
  tax_id: string | null;
  notes: string | null;
  tags: string[] | null;
  name: string | null;
  phone_e164: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export default function ClientsPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [magicLinkModalOpen, setMagicLinkModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [magicLinkForm, setMagicLinkForm] = useState({
    name: '',
    phone_e164: '',
    email: '',
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [companySlug]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      // Get Company ID
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', companySlug)
        .single();

      if (!company) {
        toast.error('Company not found');
        return;
      }

      // Fetch Clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Fetch profiles for all user_ids
      const userIds = clientsData?.map(c => c.user_id).filter(Boolean) || [];
      let profilesMap: Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError);
        } else {
          profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = {
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
            };
            return acc;
          }, {} as Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }>);
        }
      }

      // Merge clients with their profiles
      const clientsWithProfiles = (clientsData || []).map(client => ({
        ...client,
        profile: profilesMap[client.user_id] || null,
      }));

      setClients(clientsWithProfiles);
    } catch (error) {
      console.error('Error fetching clients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      toast.error(`Failed to load clients: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanToggle = async (clientId: string, currentStatus: string) => {
    try {
      setBanningId(clientId);
      const newStatus = currentStatus === 'banned' ? 'active' : 'banned';

      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      // Update local state
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus }
          : client
      ));

      toast.success(
        newStatus === 'banned' 
          ? 'Client has been banned' 
          : 'Client has been unbanned'
      );
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
    } finally {
      setBanningId(null);
    }
  };

  const openMagicLinkModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setMagicLinkForm({
        name: client.name || client.profile?.full_name || '',
        phone_e164: client.phone_e164 || '',
        email: client.email || client.profile?.email || '',
      });
    } else {
      setSelectedClient(null);
      setMagicLinkForm({ name: '', phone_e164: '', email: '' });
    }
    setGeneratedLink(null);
    setLinkCopied(false);
    setMagicLinkModalOpen(true);
  };

  const closeMagicLinkModal = () => {
    setMagicLinkModalOpen(false);
    setSelectedClient(null);
    setGeneratedLink(null);
    setLinkCopied(false);
  };

  const handleGenerateMagicLink = async () => {
    if (!magicLinkForm.name || !magicLinkForm.phone_e164) {
      toast.error('Name and phone number are required');
      return;
    }

    try {
      setGeneratingLink(true);
      
      // Get current user for staffUserId
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`/api/store/${companySlug}/clients/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: magicLinkForm.name,
          phone_e164: magicLinkForm.phone_e164,
          email: magicLinkForm.email || undefined,
          staffUserId: user?.id || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate magic link');
      }

      setGeneratedLink(data.magicLink.url);
      toast.success('Magic link generated successfully!');
    } catch (error) {
      console.error('Error generating magic link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate magic link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Clients" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Clients" />
        <Button 
          onClick={() => openMagicLinkModal()}
          className="bg-brand-500 hover:bg-brand-600 text-white gap-2"
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
                          <img className="h-10 w-10 rounded-full object-cover" src={client.profile.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {(client.profile?.full_name?.[0] || client.company_name?.[0] || '?').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.company_name || 'Individual'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.profile?.full_name || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{client.profile?.email || '-'}</div>
                    <div className="text-sm text-gray-500">{client.tax_id || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      client.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      client.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMagicLinkModal(client)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Magic Link
                      </Button>
                      {client.status === 'banned' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanToggle(client.id, client.status)}
                          disabled={banningId === client.id}
                          className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                        >
                          {banningId === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Unban
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanToggle(client.id, client.status)}
                          disabled={banningId === client.id}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          {banningId === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No clients yet</p>
                    <p className="text-sm mb-6">Invite your first client to get started.</p>
                    <Button 
                      onClick={() => openMagicLinkModal()}
                      variant="outline" 
                      className="gap-2"
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

      {/* Magic Link Modal */}
      <Modal
        isOpen={magicLinkModalOpen}
        onClose={closeMagicLinkModal}
        className="max-w-[600px] p-6 lg:p-8"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generate Magic Link
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedClient 
                ? 'Generate a secure link for this client to access their portal.'
                : 'Enter client information to generate a magic link.'}
            </p>
          </div>

          {!generatedLink ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block text-gray-900 dark:text-white">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={magicLinkForm.name}
                  onChange={(e) => setMagicLinkForm({ ...magicLinkForm, name: e.target.value })}
                  placeholder="Client name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block text-gray-900 dark:text-white">
                  Phone Number (E.164) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={magicLinkForm.phone_e164}
                  onChange={(e) => setMagicLinkForm({ ...magicLinkForm, phone_e164: e.target.value })}
                  placeholder="+1234567890"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: +[country code][number] (e.g., +1234567890)
                </p>
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block text-gray-900 dark:text-white">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={magicLinkForm.email}
                  onChange={(e) => setMagicLinkForm({ ...magicLinkForm, email: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={closeMagicLinkModal}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateMagicLink}
                  disabled={generatingLink || !magicLinkForm.name || !magicLinkForm.phone_e164}
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                >
                  {generatingLink ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                  Magic link generated successfully!
                </p>
                <p className="text-xs text-green-700 dark:text-green-500 mb-3">
                  Share this link with your client. It will expire in 30 days.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="flex-1 font-mono text-xs bg-white dark:bg-gray-800"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="shrink-0 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={closeMagicLinkModal}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedLink(null);
                    setMagicLinkForm({ name: '', phone_e164: '', email: '' });
                  }}
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                >
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
