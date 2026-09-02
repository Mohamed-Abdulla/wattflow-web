import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Access Denied
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your account does not have administrator privileges (<code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">ADMIN</code> role) required to access the Wattflow Admin Console.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/api/v1/auth/logout"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Switch Account
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
