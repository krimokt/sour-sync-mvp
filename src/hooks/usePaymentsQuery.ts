'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchPayments } from './queries/fetchPayments';

export const paymentKeys = {
  all: () => ['payments'] as const,
};

export function usePaymentsQuery() {
  const queryClient = useQueryClient();

  // Live updates: payment status changes appear instantly
  useEffect(() => {
    const channel = supabase
      .channel('rt:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: paymentKeys.all() });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: paymentKeys.all(),
    queryFn: fetchPayments,
    staleTime: 30_000,
  });
}
