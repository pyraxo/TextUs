import { UserScenarioSession } from "@/types/user-scenario-session";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook to fetch a user's scenario sessions
 * @param userId - The user's ID
 * @param schemeId - Optional scheme ID to filter by
 */
export function useUserScenarioSessions(userId?: string, schemeId?: string) {
  return useQuery<UserScenarioSession[]>({
    queryKey: ["scenario-sessions", userId, schemeId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`${API_URL}/trainees/${userId}/sessions`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch scenario sessions");
      const data = await res.json();
      // Optionally filter by schemeId if needed in the future
      return data;
    },
    enabled: !!userId,
  });
} 