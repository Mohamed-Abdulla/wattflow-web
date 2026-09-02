/** Authenticated user returned by /api/v1/auth/me */
export interface User {
  sub: string;
  name: string;
  email: string;
  roles: string[];
}

export function isAdmin(user: User | null): boolean {
  return user?.roles.includes("ADMIN") ?? false;
}
