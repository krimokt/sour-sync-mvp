'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchShipments } from './queries/fetchShipments';

export const shipmentKeys = {
  all: () => ['shipments'] as const,
};

export function useShipmentsQuery() {
  const queryClient = useQueryClient();

  // Live updates: any change to shipping table refreshes the list
  useEffect(() => {
    const channel = supabase
      .channel('rt:shipping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipping' }, () => {
        queryClient.invalidateQueries({ queryKey: shipmentKeys.all() });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: shipmentKeys.all(),
    queryFn: fetchShipments,
    staleTime: 30_000,
  });
}
