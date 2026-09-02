import { SwaggerPortal } from "@/features/swagger/components/swagger-portal";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "API Documentation | Wattflow Admin",
  description: "Interactive OpenAPI documentation for Wattflow backend microservices",
};

export default function SwaggerPage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            OpenAPI & Swagger Documentation
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore and execute authenticated API requests across all Wattflow microservices.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <SwaggerPortal />
      </div>
    </div>
  );
}
