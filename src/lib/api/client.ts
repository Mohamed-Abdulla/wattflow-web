const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/**
 * Client-side fetch wrapper.
 * Calls through Kong Gateway. Credentials (session cookie) are sent automatically.
 * Throws a typed ApiError on non-2xx responses.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function clientFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include", // forward session cookie
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, `${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}
