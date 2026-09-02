import { getServerSession } from "@/lib/api/server";
import { LogOut } from "lucide-react";

/**
 * RSC — reads from session, no client hydration needed.
 */
export async function Topbar() {
  const user = await getServerSession();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <p className="text-sm font-medium text-muted-foreground">Admin Console</p>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-muted-foreground">
            {user.name || user.email}
          </span>
        )}
        <a
          href="/api/v1/auth/logout"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </a>
      </div>
    </header>
  );
}
