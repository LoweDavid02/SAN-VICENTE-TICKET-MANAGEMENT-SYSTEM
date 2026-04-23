/**
 * React Query client — optimized for production performance.
 *
 * - staleTime: 60s — data stays fresh longer, fewer refetches
 * - gcTime: 5min — keep unused data in cache for fast back-navigation
 * - retry: 2 — fail faster in production
 * - refetchOnWindowFocus: false — prevents burst on tab switch
 */

import { QueryClient, keepPreviousData } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60,      // 60 seconds — data stays fresh
      gcTime:               1000 * 60 * 5,  // 5 minutes — keep in cache
      retry:                2,
      retryDelay:           (attempt) => Math.min(1000 * (attempt + 1), 4000),
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
      placeholderData:      keepPreviousData,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
