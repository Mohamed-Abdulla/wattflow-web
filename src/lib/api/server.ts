import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@/features/auth/types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

/**
 * Server-side fetch helper.
 * Forwards the session cookie from the incoming request to the backend
 * so Spring Security recognises the session.
 */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[serverFetch] ${res.status} ${res.statusText} – ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Resolves the current user from the session by calling web-bff /api/v1/auth/me.
 * Returns null if not authenticated (401/403).
 *
 * Wrapped with React `cache()` so multiple Server Components in the same render
 * tree (e.g. layout + page + Topbar) share a single BFF call instead of each
 * making their own network request.
 */
export const getServerSession: () => Promise<User | null> = cache(async () => {
  try {
    const data = await serverFetch<{
      subject: string;
      name: string;
      email: string;
      claims: Record<string, unknown>;
    }>("/api/v1/auth/me");

    const roles =
      (data.claims?.["realm_access"] as { roles?: string[] } | undefined)?.roles ?? [];

    return {
      sub: data.subject,
      name: data.name,
      email: data.email,
      roles,
    };
  } catch {
    return null;
  }
});
