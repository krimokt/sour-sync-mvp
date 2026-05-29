'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchPayments } from './queries/fetchPayments';

export const paymentKeys = {
  all: (companyId: string) => ['payments', companyId] as const,
};

export function usePaymentsQuery({ companyId }: { companyId: string | undefined }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`rt:payments:${companyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `company_id=eq.${companyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: paymentKeys.all(companyId) });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  return useQuery({
    queryKey: paymentKeys.all(companyId!),
    queryFn: () => fetchPayments({ companyId: companyId! }),
    enabled: !!companyId,
    staleTime: 30_000,
  });
}
