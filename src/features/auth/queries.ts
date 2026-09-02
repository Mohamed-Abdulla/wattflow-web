import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "./api";
import type { User } from "./types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * Hook to get the current authenticated user.
 * Data is considered stale after 5 minutes — no aggressive refetching for user info.
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false, // don't retry 401s
  });
}
