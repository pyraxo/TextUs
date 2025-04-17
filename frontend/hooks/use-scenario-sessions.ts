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
      // Optionally filter by schemeId if needed in the future
      return data;
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