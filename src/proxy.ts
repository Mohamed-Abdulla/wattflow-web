import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// BACKEND_URL points to Kong Gateway (e.g. http://kong:8000 in Docker, http://localhost:8000 on host)
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const SWAGGER_URL = process.env.SWAGGER_INTERNAL_URL ?? "http://localhost:8084";

interface MeResponse {
  subject?: string;
  name?: string;
  email?: string;
  claims?: {
    realm_access?: { roles?: string[] };
    roles?: string[];
  };
}

/**
 * Module-level session cache (Node.js runtime — persistent per worker process).
 * Caches validated session results for SESSION_CACHE_TTL_MS to avoid hitting
 * the BFF on every single admin page request.
 *
 * Note: This cache lives in a single Node.js process. It is *not* shared across
 * multiple instances; in a multi-instance deployment the worst case is that each
 * instance makes its own BFF call on the first request, which is acceptable.
 */
interface CacheEntry {
  roles: string[];
  expiresAt: number;
}
const sessionCache = new Map<string, CacheEntry>();
const SESSION_CACHE_TTL_MS = 60_000; // 60 seconds

function getCachedSession(sessionId: string): string[] | null {
  const entry = sessionCache.get(sessionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    sessionCache.delete(sessionId);
    return null;
  }
  return entry.roles;
}

function setCachedSession(sessionId: string, roles: string[]) {
  // Evict stale entries if cache grows large (simple LRU-lite: clear all expired on insert)
  if (sessionCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of sessionCache.entries()) {
      if (now > val.expiresAt) sessionCache.delete(key);
    }
  }
  sessionCache.set(sessionId, { roles, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
}

/**
 * Proxy (formerly middleware) — runs before routes are rendered.
 *
 * 1. Rewrites /api/v1/, /oauth2/, /login/ → Kong Gateway (transparent BFF proxy)
 * 2. Rewrites /swagger-internal → internal Swagger UI (session-gated)
 * 3. Guards /admin routes: validates session cookie, checks ADMIN role
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Transparent proxy for backend APIs, OAuth2 callbacks, and login initiation.
  //    Cookies are forwarded automatically because NextResponse.rewrite preserves
  //    the incoming request headers (including Cookie) on the upstream call.
  if (pathname.startsWith("/api/v1/") || pathname.startsWith("/oauth2/") || pathname.startsWith("/login/")) {
    if (pathname === "/api/v1/auth/logout") {
      const sessionCookie = request.cookies.get("wattflow_session");
      if (sessionCookie) {
        sessionCache.delete(sessionCookie.value);
      }
      const targetUrl = new URL(pathname + request.nextUrl.search, BACKEND_URL);
      const res = NextResponse.rewrite(targetUrl);
      res.cookies.delete("wattflow_session");
      res.cookies.delete("XSRF-TOKEN");
      return res;
    }

    const targetUrl = new URL(pathname + request.nextUrl.search, BACKEND_URL);
    return NextResponse.rewrite(targetUrl);
  }

  // 2. Proxy for internal Swagger UI — requires a valid session cookie.
  if (pathname.startsWith("/swagger-internal")) {
    const sessionCookie = request.cookies.get("wattflow_session");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/api/v1/auth/login", request.url));
    }
    const subPath = pathname.replace(/^\/swagger-internal/, "") || "/";
    const targetUrl = new URL(subPath + request.nextUrl.search, SWAGGER_URL);
    return NextResponse.rewrite(targetUrl);
  }

  // 3. Protect /admin routes with role verification.
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("wattflow_session");

    // No session cookie → redirect to login, preserving the intended destination.
    if (!sessionCookie) {
      const loginUrl = new URL("/api/v1/auth/login", request.url);
      loginUrl.searchParams.set("redirect_after", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sessionId = sessionCookie.value;

    // Fast path: serve from cache if still fresh.
    const cachedRoles = getCachedSession(sessionId);
    if (cachedRoles !== null) {
      if (!cachedRoles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return NextResponse.next();
    }

    // Slow path: validate session with web-bff via Kong.
    try {
      const cookieHeader = request.headers.get("cookie") ?? `wattflow_session=${sessionId}`;
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: {
          Cookie: cookieHeader,
          Accept: "application/json",
        },
        // no cache — we maintain our own TTL-based cache above
        cache: "no-store",
      });

      if (!response.ok) {
        // Session expired or invalid — evict cache entry and send to login.
        sessionCache.delete(sessionId);
        const loginUrl = new URL("/api/v1/auth/login", request.url);
        loginUrl.searchParams.set("redirect_after", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const data: MeResponse = await response.json();
      const roles: string[] = data.claims?.realm_access?.roles ?? data.claims?.roles ?? [];

      setCachedSession(sessionId, roles);

      if (!roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      console.error("[proxy] Error verifying session:", error);
      return NextResponse.redirect(new URL("/api/v1/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/:path*",
    "/oauth2/:path*",
    "/login/:path*",
    "/swagger-internal/:path*",
    "/swagger-internal",
  ],
};
