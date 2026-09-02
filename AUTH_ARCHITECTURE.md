# Wattflow Web Frontend Authentication Architecture & Technical Guide

This document describes how `wattflow-web` (Next.js 16 App Router) integrates with `web-bff`, Kong Gateway, and Keycloak for secure authentication, role-based route guarding, session caching, and logout.

---

## 1. Architectural Model

`wattflow-web` operates as a **Pure BFF Consumer**:
- **No Token Storage**: The application never touches or decodes JWTs in the browser.
- **Opaque Cookies**: Only the `wattflow_session` cookie is used for state.
- **Next.js 16 Proxy**: Implemented in `src/proxy.ts` (the Next.js 16 successor to `middleware.ts`).
- **Node.js Runtime Proxy**: In Next.js 16, `proxy.ts` runs on the Node.js runtime by default, enabling persistent in-process caching across requests within the worker.

---

## 2. Request Flow & Proxy Pipeline (`src/proxy.ts`)

```
Incoming Request
      │
      ├─► /api/v1/*, /oauth2/*, /login/*
      │     └─► Rewrite transparently to BACKEND_URL (Kong Gateway)
      │         (If /api/v1/auth/logout: evict cache & delete cookies)
      │
      ├─► /swagger-internal/*
      │     └─► Require wattflow_session cookie -> Rewrite to SWAGGER_URL
      │
      └─► /admin/*
            │
            ├─► No cookie?
            │     └─► 302 /api/v1/auth/login?redirect_after=<current_path>
            │
            ├─► In sessionCache (<60s TTL)?
            │     ├─► Has ADMIN role -> Next()
            │     └─► No ADMIN role  -> 302 /unauthorized
            │
            └─► Cache Miss:
                  ├─► Fetch BACKEND_URL/api/v1/auth/me (Cookie forwarded)
                  ├─► Parse roles, store in sessionCache
                  ├─► If 401/403 -> Evict cache, 302 /api/v1/auth/login
                  └─► If valid ADMIN -> Next()
```

### Key Implementation Details:
1. **TTL Session Cache**: Caches session verification results (`Map<string, { roles: string[], expiresAt: number }>`) for 60 seconds to avoid a blocking network round-trip to `web-bff` on every route change.
2. **Dynamic Destination Preservation**: When unauthenticated users attempt to access `/admin/...`, the proxy captures `pathname` and redirects to `/api/v1/auth/login?redirect_after=${pathname}`, allowing the user to land directly on their intended page after authenticating.
3. **Instant Logout Cleanup**: When `/api/v1/auth/logout` is hit, the proxy immediately evicts the session from `sessionCache` and deletes the client cookies on the response.

---

## 3. Server Components & Deduplication (`src/lib/api/server.ts`)

Server Components (`Topbar`, Layouts, Pages) resolve the current user via `getServerSession()`:
- **React `cache()`**: `getServerSession` is wrapped with React's request-scoped `cache()`. If both `AdminLayout` and `Topbar` call `getServerSession()` during the same server render pass, only **one** network request is sent to `web-bff`.
- **Cookie Forwarding**: `serverFetch()` automatically extracts cookies from `next/headers` and forwards them to `BACKEND_URL`.

```ts
export const getServerSession = cache(async (): Promise<User | null> => {
  try {
    const data = await serverFetch<MeResponse>("/api/v1/auth/me");
    return {
      sub: data.subject,
      name: data.name,
      email: data.email,
      roles: data.claims?.realm_access?.roles ?? [],
    };
  } catch {
    return null;
  }
});
```

---

## 4. Client Components & Data Fetching

- **`clientFetch()` (`src/lib/api/client.ts`)**: Browser fetches use `credentials: "include"` so the browser automatically sends `wattflow_session` on every request.
- **TanStack Query Initial Data**: The dashboard (`StatsGrid`) receives server-prefetched data from RSC props and seeds the TanStack Query cache via `initialData`, preventing loading skeletons on first page paint.
- **Separated Queries**:
  - `useDashboardStats`: Entity counts, refetched every 60 seconds.
  - `useServiceHealth`: Service uptime badges, refetched every 30 seconds.
