"use client";

import { useServiceHealth } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  if (status === "UP") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "DOWN") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
}

/**
 * Client component — polls service health every 30s via its own dedicated query.
 * Separated from entity counts so health can poll more frequently without
 * triggering unnecessary user/device count refetches.
 */
export function HealthBadges() {
  const { data: services, isLoading } = useServiceHealth();

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-32 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {services?.map((svc) => (
        <div
          key={svc.name}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            svc.status === "UP"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
          )}
        >
          <StatusIcon status={svc.status} />
          {svc.name}
          {svc.latencyMs !== undefined && (
            <span className="text-muted-foreground">· {svc.latencyMs}ms</span>
          )}
        </div>
      ))}
    </div>
  );
}
