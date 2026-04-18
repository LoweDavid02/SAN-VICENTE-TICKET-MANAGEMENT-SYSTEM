/**
 * React Query client — tuned for php artisan serve (single-threaded).
 *
 * php artisan serve handles one request at a time. When multiple queries
 * fire simultaneously they queue up, causing 500ms+ delays that look like
 * failures. These settings prevent the error state from showing:
 *
 * - retry: 3              — retry 3 times before giving up
 * - retryDelay: 1000ms    — wait 1s between retries (gives server time to clear)
 * - staleTime: 30s        — don't refetch data that's less than 30s old
 * - placeholderData       — show previous data while refetching (no loading flash)
 * - refetchOnWindowFocus  — disabled (prevents burst of requests on tab switch)
 */

import { QueryClient, keepPreviousData } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 30,      // 30 seconds — data stays fresh
      retry:                3,              // retry 3 times before error state
      retryDelay:           (attempt) => Math.min(1000 * (attempt + 1), 5000), // 1s, 2s, 3s
      refetchOnWindowFocus: false,
      placeholderData:      keepPreviousData, // show old data while refetching
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
