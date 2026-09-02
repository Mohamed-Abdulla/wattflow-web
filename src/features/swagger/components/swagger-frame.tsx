"use client";

import { useRef } from "react";

interface SwaggerFrameProps {
  /** Full path to the Swagger UI, e.g. /swagger-internal or /api/v1/user/swagger-ui/index.html */
  path: string;
}

/**
 * Renders a Swagger UI iframe for the given service.
 *
 * Note on token injection: Swagger UI running inside an iframe is cross-origin
 * relative to the parent page. The standard `postMessage` approach doesn't work
 * because Swagger UI does not listen for SWAGGER_AUTH_TOKEN messages by default.
 * The correct approach is to proxy all Swagger UI traffic through the BFF
 * (which already validates the session cookie), so no explicit token injection
 * is needed — the iframe fetches through /swagger-internal which the proxy
 * gates behind the session check.
 */
export function SwaggerFrame({ path }: SwaggerFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      ref={iframeRef}
      src={path}
      title="Swagger UI"
      className="h-full w-full rounded-b-lg border-0 bg-white"
      allow="clipboard-write"
    />
  );
}
