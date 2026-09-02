import { clientFetch } from "@/lib/api/client";
import type { User } from "./types";

/** Client-side: fetch the current user from web-bff /api/v1/auth/me */
export async function fetchMe(): Promise<User> {
  const data = await clientFetch<{
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
}
