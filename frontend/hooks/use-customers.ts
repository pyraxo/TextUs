import { createCustomer, deleteCustomer, getCustomer, getCustomers, updateCustomer } from '@/lib/api/customers';
import { CustomerCreate, CustomerUpdate } from '@/types/customer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys for caching
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

/**
 * Hook to fetch all customers with optional filters
 */
export function useCustomers(params?: Record<string, any>) {
  return useQuery({
    queryKey: customerKeys.list(params || {}),
    queryFn: () => getCustomers(params),
  });
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id?: string) {
  return useQuery({
    queryKey: customerKeys.detail(id || ''),
    queryFn: () => getCustomer(id || ''),
    enabled: !!id, // Only run query if ID is provided
  });
}

/**
 * Hook to create a new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: CustomerCreate) => createCustomer(customerData),
    onSuccess: (newCustomer) => {
      // Invalidate customers list to reflect changes
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      // Add the new customer to the cache
      queryClient.setQueryData(customerKeys.detail(newCustomer.id as string), newCustomer);

      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Create customer error:', error);
    }
  });
}

/**
 * Hook to update a customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerData }: { id: string; customerData: CustomerUpdate }) =>
      updateCustomer(id, customerData),
    onSuccess: (updatedCustomer, variables) => {
      // Update the customer in the cache
      queryClient.setQueryData(customerKeys.detail(variables.id), updatedCustomer);

      // Invalidate customers list to reflect changes
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error('Update customer error:', error);
    }
  });
}

/**
 * Hook to delete a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (_data, id) => {
      // Remove the customer from the cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });

      // Invalidate customers list to reflect changes
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error('Delete customer error:', error);
    }
  });
} 