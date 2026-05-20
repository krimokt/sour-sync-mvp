'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchQuotations } from '@/hooks/queries/fetchQuotations';
import { fetchShipments } from '@/hooks/queries/fetchShipments';
import { fetchPayments } from '@/hooks/queries/fetchPayments';
import { fetchDashboard } from '@/hooks/queries/fetchDashboard';
import { quotationKeys } from '@/hooks/useQuotationsQuery';
import { shipmentKeys } from '@/hooks/useShipmentsQuery';
import { paymentKeys } from '@/hooks/usePaymentsQuery';
import { dashboardKeys } from '@/hooks/useDashboardQuery';

/**
 * Invisible component mounted in the admin layout.
 * Fires once per companyId and pre-populates React Query cache for every
 * data-heavy page so they render instantly on first navigation.
 */
export function DataPrefetcher({ companyId }: { companyId: string | undefined }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    // All prefetches fire in parallel — user sees no waiting on any page
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: quotationKeys.list(companyId, 1, 'All', ''),
        queryFn: () => fetchQuotations({ companyId, page: 1, status: 'All', search: '' }),
        staleTime: 30_000,
      }),
      queryClient.prefetchQuery({
        queryKey: shipmentKeys.all(),
        queryFn: fetchShipments,
        staleTime: 30_000,
      }),
      queryClient.prefetchQuery({
        queryKey: paymentKeys.all(),
        queryFn: fetchPayments,
        staleTime: 30_000,
      }),
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.all(companyId),
        queryFn: () => fetchDashboard({ companyId }),
        staleTime: 30_000,
      }),
    ]);
  }, [companyId, queryClient]);

  return null;
}
