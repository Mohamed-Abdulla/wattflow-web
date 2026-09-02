import { fetchUserCount, fetchDeviceCount } from "@/features/dashboard/api.server";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { HealthBadges } from "@/features/dashboard/components/health-badge";
import { Activity, ShieldCheck, Database, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // RSC prefetch of user and device counts
  const [totalUsers, totalDevices] = await Promise.all([
    fetchUserCount(),
    fetchDeviceCount(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Platform Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time metrics, active microservices, and system telemetry.
        </p>
      </div>

      {/* System Health Heartbeat */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Microservices Health
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Polls every 30s</span>
        </div>
        <HealthBadges />
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Core Metrics
        </h2>
        <StatsGrid
          initialTotalUsers={totalUsers}
          initialTotalDevices={totalDevices}
        />
      </div>

      {/* Architecture & Infrastructure Quick Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            OAuth2 / Keycloak
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Keycloak 26.3.3 OIDC realm active with PKCE S256 authorization code grant and role-based access control.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
            <Database className="h-4 w-4 text-amber-500" />
            Persistence & Cache
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            MySQL 8 relational store, InfluxDB 2 time-series storage, and Redis 7 distributed token store.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
            <Cpu className="h-4 w-4 text-purple-500" />
            Ingestion Pipeline
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Kafka streaming broker with batch parallel simulator delivering sub-second smart meter telemetry.
          </p>
        </div>
      </div>
    </div>
  );
}
