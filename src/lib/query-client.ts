import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60_000,    // 3 min — no re-fetch on VPN where every round-trip costs
      gcTime: 15 * 60_000,      // 15 min in memory — survive tab switches
      retry: 1,
      retryDelay: 2000,         // wait 2s before retry (VPN may have brief drops)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // don't hammer on VPN reconnect
    },
  },
});
