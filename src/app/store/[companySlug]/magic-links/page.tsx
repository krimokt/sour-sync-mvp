'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MagicLink {
  id: string;
  company_id: string;
  client_id: string;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  client: {
    id: string;
    name: string | null;
    phone_e164: string | null;
    email: string | null;
  } | null;
}

export default function MagicLinksPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'expired' | 'revoked'>('all');

  useEffect(() => {
    fetchMagicLinks();
  }, [companySlug, filterStatus]);

  const fetchMagicLinks = async () => {
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

      // Fetch Magic Links
      const query = supabase
        .from('client_magic_links')
        .select(`
          *,
          client:clients!client_id (
            id,
            name,
            phone_e164,
            email
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      const { data: linksData, error: linksError } = await query;

      if (linksError) throw linksError;

      // Filter by status
      const now = new Date();
      type SupabaseMagicLinkResponse = Omit<MagicLink, 'client'> & {
        client: MagicLink['client'] | null;
      };
      let filteredLinks: MagicLink[] = (linksData as SupabaseMagicLinkResponse[] || []).map((link) => ({
        ...link,
        client: link.client || null,
      }));

      if (filterStatus !== 'all') {
        filteredLinks = filteredLinks.filter((link: MagicLink) => {
          const expiresAt = new Date(link.expires_at);
          const isExpired = expiresAt < now;
          const isRevoked = !!link.revoked_at;
          const isUsed = !!link.used_at;

          if (filterStatus === 'active') {
            return !isExpired && !isRevoked && !isUsed;
          } else if (filterStatus === 'used') {
            return isUsed;
          } else if (filterStatus === 'expired') {
            return isExpired && !isRevoked;
          } else if (filterStatus === 'revoked') {
            return isRevoked;
          }
          return true;
        });
      }

      setMagicLinks(filteredLinks);
    } catch (error) {
      console.error('Error fetching magic links:', error);
      toast.error('Failed to load magic links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    try {
      setRevokingId(linkId);
      
      const { error } = await supabase
        .from('client_magic_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', linkId);

      if (error) throw error;

      // Update local state
      setMagicLinks(magicLinks.map(link => 
        link.id === linkId 
          ? { ...link, revoked_at: new Date().toISOString() }
          : link
      ));

      toast.success('Magic link revoked successfully');
    } catch (error) {
      console.error('Error revoking magic link:', error);
      toast.error('Failed to revoke magic link');
    } finally {
      setRevokingId(null);
    }
  };

  const getStatus = (link: MagicLink) => {
    const now = new Date();
    const expiresAt = new Date(link.expires_at);
    
    if (link.revoked_at) return { label: 'Revoked', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    if (link.used_at) return { label: 'Used', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    if (expiresAt < now) return { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Magic Links" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Magic Links" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'used', 'expired', 'revoked'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Used
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {magicLinks.map((link) => {
                const status = getStatus(link);
                return (
                  <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {link.client?.name || 'Unknown Client'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {link.client?.phone_e164 || link.client?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(link.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {link.used_at ? new Date(link.used_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!link.revoked_at && status.label === 'Active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(link.id)}
                            disabled={revokingId === link.id}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            {revokingId === link.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!magicLinks || magicLinks.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No magic links found</p>
                    <p className="text-sm">Generate magic links from the Clients page.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




