import { UserScenarioSession } from "@/types/user-scenario-session"
import { useQuery } from "@tanstack/react-query"

/**
 * Hook to fetch a user's scenario sessions
 * @param userId - The user's ID
 * @param schemeId - Optional scheme ID to filter by
 */
export function useUserScenarioSessions(userId?: string, schemeId?: string) {
  return useQuery<UserScenarioSession[]>({
    queryKey: ["scenario-sessions", userId, schemeId],
    queryFn: async () => {
      // TODO: Implement API endpoint
      return []
    },
    enabled: !!userId,
  })
} 