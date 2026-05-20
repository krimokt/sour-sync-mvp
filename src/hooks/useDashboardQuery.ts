'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchDashboard } from './queries/fetchDashboard';

export const dashboardKeys = {
  all: (companyId: string) => ['dashboard', companyId] as const,
};

export function useDashboardQuery({ companyId }: { companyId: string | undefined }) {
  const queryClient = useQueryClient();

  // Live updates: any change to quotations, shipping, or payments refreshes the dashboard
  useEffect(() => {
    if (!companyId) return;
    const invalidate = () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all(companyId) });
    const ch1 = supabase.channel('rt:dash:quotations').on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, invalidate).subscribe();
    const ch2 = supabase.channel('rt:dash:shipping').on('postgres_changes', { event: '*', schema: 'public', table: 'shipping' }, invalidate).subscribe();
    const ch3 = supabase.channel('rt:dash:payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, invalidate).subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
    };
  }, [companyId, queryClient]);

  return useQuery({
    queryKey: dashboardKeys.all(companyId!),
    queryFn: () => fetchDashboard({ companyId: companyId! }),
    enabled: !!companyId,
    staleTime: 30_000,
  });
}
