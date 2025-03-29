import { getScenarios } from '@/lib/api/scenarios';
import { Scenario } from '@/types/scenario';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch scenarios, optionally filtered by scheme ID or slug
 * @param schemeIdOrSlug - The scheme's ID or slug to filter by
 */
export function useScenarios(schemeIdOrSlug?: string) {
  return useQuery<Scenario[]>({
    queryKey: ['scenarios', schemeIdOrSlug],
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