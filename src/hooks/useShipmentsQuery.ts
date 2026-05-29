'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchShipments } from './queries/fetchShipments';

export const shipmentKeys = {
  all: (companyId: string) => ['shipments', companyId] as const,
};

export function useShipmentsQuery({ companyId }: { companyId: string | undefined }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`rt:shipping:${companyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipping', filter: `company_id=eq.${companyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: shipmentKeys.all(companyId) });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  return useQuery({
    queryKey: shipmentKeys.all(companyId!),
    queryFn: () => fetchShipments({ companyId: companyId! }),
    enabled: !!companyId,
    staleTime: 30_000,
  });
}
