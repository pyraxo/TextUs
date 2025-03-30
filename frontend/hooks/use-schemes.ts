import { createScheme, deleteScheme, getSchemes, updateScheme } from '@/lib/api/schemes';
import { CreateSchemeInput, Scheme, UpdateSchemeInput } from '@/types/scheme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch schemes
 */
export function useSchemes() {
  return useQuery<Scheme[]>({
    queryKey: ['schemes'],
    queryFn: () => getSchemes(),
    retry: false, // Don't retry on 400 errors (invalid UUID format)
  });
}

/**
 * Hook to create a new scheme
 */
export function useCreateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSchemeInput) => createScheme(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}

/**
 * Hook to update an existing scheme
 */
export function useUpdateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateSchemeInput }) =>
      updateScheme(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}

/**
 * Hook to delete a scheme
 */
export function useDeleteScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteScheme(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}