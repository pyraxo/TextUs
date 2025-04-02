import { getActiveScenarioSession } from "@/lib/api/scenarios";
import { UserScenarioSession } from "@/types/user-scenario-session";
import { useQuery } from "@tanstack/react-query";

export function useActiveSession(userId?: string) {
  return useQuery<UserScenarioSession | null>({
    queryKey: ["active-session", userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await getActiveScenarioSession(userId);
      } catch (error) {
        console.error("Failed to fetch active session:", error);
        return null;
      }
    },
    // Keep the data fresh, but don't refetch on window focus to avoid disruption
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
} 