import { QueryClient } from "@tanstack/react-query";

/**
 * Create a QueryClient with production-grade defaults:
 * - staleTime: 30s  — data is fresh for 30 seconds after fetch
 * - gcTime: 5m      — unused data is garbage collected after 5 minutes
 * - retry: 2        — failed queries retry twice before throwing
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Browser singleton — one QueryClient for the entire browser session
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client per request
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
