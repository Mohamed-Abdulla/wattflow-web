import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatsClient, fetchServiceHealthClient } from "./api.client";
import type { DashboardStats, ServiceHealth } from "./types";

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  health: ["dashboard", "health"] as const,
};

/**
 * Core entity counts (users, devices) — background refresh every 60s.
 * Accepts optional initialData from RSC pre-fetch so data is available
 * instantly on first render without a loading state.
 */
export function useDashboardStats(initialData?: Pick<DashboardStats, "totalUsers" | "totalDevices">) {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats,
    queryFn: fetchDashboardStatsClient,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    initialData: initialData
      ? { ...initialData, services: [] }
      : undefined,
    // Don't treat the RSC-provided data as immediately stale —
    // give it 30 s before the first background refresh.
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}

/**
 * Service health statuses — more frequent polling (every 30s) since
 * health is more volatile than entity counts.
 */
export function useServiceHealth() {
  return useQuery<ServiceHealth[]>({
    queryKey: dashboardKeys.health,
    queryFn: fetchServiceHealthClient,
    staleTime: 20 * 1000,
    refetchInterval: 30 * 1000,
  });
}
