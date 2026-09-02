import { serverFetch } from "@/lib/api/server";
import type { DashboardStats, ServiceHealth } from "./types";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

/** Fetch total user count — called from Server Components */
export async function fetchUserCount(): Promise<number> {
  try {
    const data = await serverFetch<PageResponse<unknown>>("/api/v1/user?page=0&size=1");
    return data.totalElements ?? 0;
  } catch {
    return 0;
  }
}

/** Fetch total device count — called from Server Components */
export async function fetchDeviceCount(): Promise<number> {
  try {
    const data = await serverFetch<PageResponse<unknown>>("/api/v1/device?page=0&size=1");
    return data.totalElements ?? 0;
  } catch {
    return 0;
  }
}

const SERVICES = [
  { name: "User Service", path: "/api/v1/user" },
  { name: "Device Service", path: "/api/v1/device" },
  { name: "Ingestion Service", path: "/api/v1/ingestion" },
  { name: "Usage Service", path: "/api/v1/usage" },
];

/** Probe all service health endpoints — used server-side for initial load */
export async function fetchServicesHealth(): Promise<ServiceHealth[]> {
  return Promise.all(
    SERVICES.map(async (svc) => {
      const start = Date.now();
      try {
        await serverFetch(`${svc.path}/actuator/health`);
        return { name: svc.name, status: "UP" as const, latencyMs: Date.now() - start };
      } catch {
        return { name: svc.name, status: "DOWN" as const };
      }
    }),
  );
}

/** Aggregate — prefetch everything for the dashboard page */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [totalUsers, totalDevices, services] = await Promise.all([
    fetchUserCount(),
    fetchDeviceCount(),
    fetchServicesHealth(),
  ]);
  return { totalUsers, totalDevices, services };
}
