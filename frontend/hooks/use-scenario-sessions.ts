import { updateTrainerFeedback } from "@/lib/api/conversations";
import { getUserScenarioSessions } from "@/lib/api/scenarios";
import { UserScenarioSession } from "@/types/user-scenario-session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
      const data = await getUserScenarioSessions(userId);
      // Sort by end_timestamp descending (most recent first)
      return data.sort((a, b) => {
        const aTime = a.end_timestamp ? new Date(a.end_timestamp).getTime() : 0;
        const bTime = b.end_timestamp ? new Date(b.end_timestamp).getTime() : 0;
        return bTime - aTime;
      });
    },
    enabled: !!userId,
  });
}

/**
 * Hook to update trainer feedback for a conversation
 */
export function useUpdateTrainerFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return updateTrainerFeedback(conversationId, content);
    },
    onSuccess: (data, variables) => {
      // Update the scenario sessions cache for this user
      queryClient.invalidateQueries({ queryKey: ["scenario-sessions", variables.conversationId] });
    },
  });
} 