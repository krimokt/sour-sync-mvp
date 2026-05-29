'use client';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchQuotations } from './queries/fetchQuotations';

export const quotationKeys = {
  all: (companyId: string) => ['quotations', companyId] as const,
  list: (companyId: string, page: number, status: string, search: string) =>
    ['quotations', companyId, page, status, search] as const,
};

export function useQuotationsQuery({
  companyId,
  page = 1,
  status = 'All',
  search = '',
}: {
  companyId: string | undefined;
  page?: number;
  status?: string;
  search?: string;
}) {
  const queryClient = useQueryClient();

  // Supabase Realtime — new/updated rows appear instantly without manual refresh
  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`rt:quotations:${companyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations', filter: `company_id=eq.${companyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: quotationKeys.all(companyId) });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  return useQuery({
    queryKey: quotationKeys.list(companyId!, page, status, search),
    queryFn: () => fetchQuotations({ companyId: companyId!, page, status, search }),
    enabled: !!companyId,
    staleTime: 30_000,
    placeholderData: keepPreviousData, // smooth pagination — old data shows while new loads
  });
}
