import { fetchApi } from '@/lib/api/common';
import { CreateSchemeInput, Scheme, UpdateSchemeInput } from '@/types/scheme';

/**
 * Fetch all schemes
 */
export async function getSchemes(): Promise<Scheme[]> {
  return fetchApi<Scheme[]>('/schemes');
}

/**
 * Create a new scheme
 */
export async function createScheme(input: CreateSchemeInput): Promise<Scheme> {
  return fetchApi<Scheme>('/schemes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Update an existing scheme
 */
export async function updateScheme(slug: string, input: UpdateSchemeInput): Promise<Scheme> {
  return fetchApi<Scheme>(`/schemes/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

/**
 * Delete a scheme
 */
export async function deleteScheme(slug: string): Promise<void> {
  return fetchApi(`/schemes/${slug}`, {
    method: 'DELETE',
  });
}
