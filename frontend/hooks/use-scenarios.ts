import { createScenario, deleteScenario, getScenarios, updateScenario } from '@/lib/api/scenarios';
import { Scenario, ScenarioCreate, ScenarioUpdate } from '@/types/scenario';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const scenarioKeys = {
  all: ['scenarios'] as const,
  lists: () => [...scenarioKeys.all, 'list'] as const,
  list: (schemeId?: string) => [...scenarioKeys.lists(), { schemeId }] as const,
};

/**
 * Hook to fetch scenarios, optionally filtered by scheme ID or slug
 * @param schemeIdOrSlug - The scheme's ID or slug to filter by
 */
export function useScenarios(schemeIdOrSlug?: string) {
  return useQuery<Scenario[]>({
    queryKey: scenarioKeys.list(schemeIdOrSlug),
    queryFn: () => getScenarios(schemeIdOrSlug),
    retry: false, // Don't retry on 400 errors (invalid UUID format)
  });
}

/**
 * Hook to fetch scenarios for a specific scheme
 * @param schemeIdOrSlug - The scheme's ID or slug
 */
export function useSchemeScenarios(schemeIdOrSlug: string) {
  return useScenarios(schemeIdOrSlug);
}

/**
 * Hook to create a scenario
 * @param scenario - The scenario to create
 */
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenario: ScenarioCreate) => createScenario(scenario),
    onSuccess: () => {
      // Invalidate all scenario queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: scenarioKeys.all });
    },
  });
}

/**
 * Hook to update a scenario
 */
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, updates }: { scenarioId: string; updates: ScenarioUpdate }) =>
      updateScenario(scenarioId, updates),
    onSuccess: (_data, { scenarioId }) => {
      // Invalidate all scenario queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: scenarioKeys.all });
    },
  });
}

/**
 * Hook to delete a scenario
 */
export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string) => deleteScenario(scenarioId),
    onSuccess: () => {
      // Invalidate all scenario queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: scenarioKeys.all });
    },
  });
} 