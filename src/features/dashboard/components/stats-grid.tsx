"use client";

import { useDashboardStats } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";
import { Users, Cpu, Activity } from "lucide-react";

const icons = {
  users: Users,
  devices: Cpu,
  activity: Activity,
};

interface StatsCardProps {
  label: string;
  value: number | undefined;
  icon: keyof typeof icons;
  unit?: string;
  isLoading?: boolean;
}

function StatsCard({ label, value, icon, unit, isLoading }: StatsCardProps) {
  const Icon = icons[icon];
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm flex items-start gap-4">
      <div className="rounded-lg bg-primary/10 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">
            {value?.toLocaleString() ?? "—"}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

interface StatsGridProps {
  /** Initial data from RSC prefetch — shown instantly, refreshed in background */
  initialTotalUsers: number;
  initialTotalDevices: number;
  /** Initial active services count from RSC prefetch */
  initialActiveServices?: number;
  initialTotalServices?: number;
}

/**
 * Client component — receives server-prefetched data as initialData for
 * TanStack Query so values are shown immediately without a loading skeleton,
 * then refreshed in the background every 60s.
 */
export function StatsGrid({
  initialTotalUsers,
  initialTotalDevices,
}: StatsGridProps) {
  const { data, isLoading } = useDashboardStats({
    totalUsers: initialTotalUsers,
    totalDevices: initialTotalDevices,
  });

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-2")}>
      <StatsCard
        label="Total Users"
        value={data?.totalUsers ?? initialTotalUsers}
        icon="users"
        // Only show skeleton if we have no initial data AND still loading
        isLoading={isLoading && initialTotalUsers === 0}
      />
      <StatsCard
        label="Total Devices"
        value={data?.totalDevices ?? initialTotalDevices}
        icon="devices"
        isLoading={isLoading && initialTotalDevices === 0}
      />
    </div>
  );
}
