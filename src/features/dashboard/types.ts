/** A single stat card data point */
export interface StatItem {
  label: string;
  value: number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
}

/** Status of a single backend service */
export type ServiceStatus = "UP" | "DOWN" | "UNKNOWN";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  /** Latency in milliseconds, if measurable */
  latencyMs?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalDevices: number;
  services: ServiceHealth[];
}
