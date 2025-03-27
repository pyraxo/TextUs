import { fetchApi } from '@/lib/api/common';
import { Scenario, ScenarioCreate, ScenarioUpdate } from '@/types/scenario';

/**
 * Fetch all scenarios, optionally filtered by scheme ID or slug
 * @param schemeIdOrSlug - The scheme's ID or slug to filter by
 */
export async function getScenarios(schemeIdOrSlug?: string): Promise<Scenario[]> {
  if (schemeIdOrSlug) {
    return fetchApi<Scenario[]>(`/schemes/${schemeIdOrSlug}/scenarios`);
  }
  return fetchApi<Scenario[]>('/scenarios');
}

/**
 * Fetch a single scenario by ID
 */
export async function getScenario(id: number): Promise<Scenario> {
  return fetchApi<Scenario>(`/scenarios/${id}`);
}

/**
 * Create a new scenario
 */
export async function createScenario(scenarioData: ScenarioCreate): Promise<Scenario> {
  return fetchApi<Scenario>('/scenarios', {
    method: 'POST',
    body: JSON.stringify(scenarioData),
  });
}

/**
 * Update a scenario
 */
export async function updateScenario(id: number, scenarioData: ScenarioUpdate): Promise<Scenario> {
  return fetchApi<Scenario>(`/scenarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(scenarioData),
  });
}

/**
 * Start a scenario
 */
export async function startScenario(id: string, userId: string): Promise<Scenario> {
  return fetchApi<Scenario>(`/scenarios/${id}/start`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
} 