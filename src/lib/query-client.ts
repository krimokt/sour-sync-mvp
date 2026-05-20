import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // data stays fresh 30s — no spinner on revisit
      gcTime: 5 * 60_000,       // keep unused data in cache 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
