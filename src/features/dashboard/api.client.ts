import { clientFetch } from "@/lib/api/client";
import type { DashboardStats, ServiceHealth } from "./types";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

const SERVICES = [
  { name: "User Service", path: "/api/v1/user" },
  { name: "Device Service", path: "/api/v1/device" },
  { name: "Ingestion Service", path: "/api/v1/ingestion" },
  { name: "Usage Service", path: "/api/v1/usage" },
];

/** Client-side entity counts via Kong — used by TanStack Query */
export async function fetchDashboardStatsClient(): Promise<DashboardStats> {
  const [usersRes, devicesRes] = await Promise.all([
    clientFetch<PageResponse<unknown>>("/api/v1/user?page=0&size=1").catch(() => ({
      totalElements: 0,
      content: [],
    })),
    clientFetch<PageResponse<unknown>>("/api/v1/device?page=0&size=1").catch(() => ({
      totalElements: 0,
      content: [],
    })),
  ]);

  return {
    totalUsers: (usersRes as PageResponse<unknown>).totalElements ?? 0,
    totalDevices: (devicesRes as PageResponse<unknown>).totalElements ?? 0,
    services: [], // health is polled separately via fetchServiceHealthClient
  };
}

/** Client-side service health probe — polled independently at 30s interval */
export async function fetchServiceHealthClient(): Promise<ServiceHealth[]> {
  return Promise.all(
    SERVICES.map(async (svc) => {
      const start = Date.now();
      try {
        await clientFetch(`${svc.path}/actuator/health`);
        return { name: svc.name, status: "UP" as const, latencyMs: Date.now() - start };
      } catch {
        return { name: svc.name, status: "DOWN" as const };
      }
    }),
  );
}
