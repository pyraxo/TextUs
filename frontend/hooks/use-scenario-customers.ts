import {
  addCustomerToScenario,
  getScenarioCustomers,
  removeCustomerFromScenario,
  updateScenarioCustomer
} from '@/lib/api/scenarios';
import { ScenarioCustomer, ScenarioCustomerUpdate } from '@/types/scenario-customer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const scenarioCustomerKeys = {
  all: ['scenarioCustomers'] as const,
  lists: () => [...scenarioCustomerKeys.all, 'list'] as const,
  list: (scenarioId: string) => [...scenarioCustomerKeys.lists(), { scenarioId }] as const,
  details: (scenarioId: string, customerId: string) => [...scenarioCustomerKeys.list(scenarioId), customerId] as const,
};

/**
 * Hook to fetch all customers for a scenario
 * @param scenarioId - The scenario's ID
 */
export function useScenarioCustomers(scenarioId: string) {
  return useQuery<ScenarioCustomer[]>({
    queryKey: scenarioCustomerKeys.list(scenarioId),
    queryFn: () => getScenarioCustomers(scenarioId),
    enabled: !!scenarioId,
  });
}

/**
 * Hook to add a customer to a scenario
 */
export function useAddCustomerToScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scenarioId,
      customerId,
      name
    }: {
      scenarioId: string;
      customerId: string;
      name?: string;
    }) => addCustomerToScenario(scenarioId, customerId, name),
    onSuccess: (_data, { scenarioId }) => {
      // Invalidate the list of customers for this scenario
      queryClient.invalidateQueries({
        queryKey: scenarioCustomerKeys.list(scenarioId),
      });
    },
  });
}

/**
 * Hook to remove a customer from a scenario
 */
export function useRemoveCustomerFromScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scenarioId,
      customerId,
      scenarioCustomerId
    }: {
      scenarioId: string;
      customerId: string;
      scenarioCustomerId?: string;
    }) => removeCustomerFromScenario(scenarioId, customerId, scenarioCustomerId),
    onSuccess: (_data, { scenarioId }) => {
      // Invalidate the list of customers for this scenario
      queryClient.invalidateQueries({
        queryKey: scenarioCustomerKeys.list(scenarioId),
      });
    },
  });
}

/**
 * Hook to update a customer in a scenario
 */
export function useUpdateScenarioCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scenarioId,
      customerId,
      updates,
    }: {
      scenarioId: string;
      customerId: string;
      updates: ScenarioCustomerUpdate;
    }) => updateScenarioCustomer(scenarioId, customerId, updates),
    onSuccess: (_data, { scenarioId, customerId }) => {
      // Invalidate the specific customer and the list
      queryClient.invalidateQueries({
        queryKey: scenarioCustomerKeys.details(scenarioId, customerId),
      });
      queryClient.invalidateQueries({
        queryKey: scenarioCustomerKeys.list(scenarioId),
      });
    },
  });
} 