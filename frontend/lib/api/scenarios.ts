import { fetchApi } from '@/lib/api/common';
import { Scenario, ScenarioCreate, ScenarioUpdate } from '@/types/scenario';
import { UserScenarioSession } from '@/types/user-scenario-session';

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
 * @param scenarioId - The scenario's ID
 */
export async function getScenario(scenarioId: string): Promise<Scenario> {
  return fetchApi<Scenario>(`/scenarios/${scenarioId}`);
}

/**
 * Create a new scenario
 * @param scenarioData - The scenario data to create
 */
export async function createScenario(
  scenarioData: ScenarioCreate,
): Promise<Scenario> {
  return fetchApi<Scenario>('/scenarios', {
    method: 'POST',
    body: JSON.stringify(scenarioData),
  });
}

/**
 * Update a scenario
 * @param scenarioId - The scenario's ID
 * @param scenarioData - The scenario data to update
 */
export async function updateScenario(
  scenarioId: string,
  scenarioData: ScenarioUpdate,
): Promise<Scenario> {
  return fetchApi<Scenario>(`/scenarios/${scenarioId}`, {
    method: 'PUT',
    body: JSON.stringify(scenarioData),
  });
}

/**
 * Start a scenario
 * @param scenarioId - The scenario's ID
 * @param traineeId - The trainee's ID
 */
export async function startScenario(
  scenarioId: string,
  traineeId: string,
): Promise<UserScenarioSession> {
  return fetchApi<UserScenarioSession>(`/scenarios/${scenarioId}/start`, {
    method: 'POST',
    body: JSON.stringify({ trainee_id: traineeId }),
  });
}

/**
 * Get the active scenario session for a trainee
 * @param traineeId - The trainee's ID
 */
export async function getActiveScenarioSession(
  traineeId: string,
): Promise<UserScenarioSession> {
  return fetchApi<UserScenarioSession>(`/scenarios/active`, {
    method: 'GET',
    body: JSON.stringify({ trainee_id: traineeId }),
  });
}
