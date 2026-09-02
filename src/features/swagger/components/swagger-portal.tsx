"use client";

import { useState } from "react";
import { SWAGGER_SERVICES } from "@/features/swagger/constants";
import { SwaggerFrame } from "./swagger-frame";
import { cn } from "@/lib/utils";

/**
 * Tab-based Swagger portal.
 * Each tab renders one service's Swagger UI in a full-height iframe.
 *
 * Iframes are lazy-mounted: a tab's iframe is only created the first time
 * that tab is activated. Once mounted it stays in the DOM (display:none when
 * inactive) so Swagger UI doesn't reload on tab switch.
 * This avoids loading 5× Swagger bundles simultaneously on page mount.
 */
export function SwaggerPortal() {
  const [activeId, setActiveId] = useState<string>(SWAGGER_SERVICES[0].id);
  // Track which tabs have been activated at least once
  const [mounted, setMounted] = useState<Set<string>>(
    new Set([SWAGGER_SERVICES[0].id]),
  );

  function activateTab(id: string) {
    setActiveId(id);
    setMounted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b overflow-x-auto">
        {SWAGGER_SERVICES.map((svc) => (
          <button
            key={svc.id}
            onClick={() => activateTab(svc.id)}
            className={cn(
              "whitespace-nowrap px-5 py-2.5 text-sm font-medium transition-colors",
              activeId === svc.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {svc.label}
          </button>
        ))}
      </div>

      {/* Iframe panels — only render once first activated, then keep mounted */}
      <div className="flex-1 min-h-0">
        {SWAGGER_SERVICES.map((svc) => (
          <div
            key={svc.id}
            className={cn("h-full", activeId === svc.id ? "block" : "hidden")}
          >
            {mounted.has(svc.id) && <SwaggerFrame path={svc.path} />}
          </div>
        ))}
      </div>
    </div>
  );
}
