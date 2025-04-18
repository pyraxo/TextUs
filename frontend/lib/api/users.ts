import { User, UserCreate, UserUpdate } from '@/types/user';
import { fetchApi } from './common';

/**
 * Create a new user
 */
export async function createUser(userData: UserCreate): Promise<User> {
  return fetchApi<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Fetch all users with optional filtering and pagination
 */
export async function getUsers(params?: {
  skip?: number;
  limit?: number;
  user_type?: 'admin' | 'trainer' | 'trainee';
}): Promise<User[]> {
  const queryParams = new URLSearchParams();

  if (params?.skip !== undefined) {
    queryParams.append('skip', params.skip.toString());
  }

  if (params?.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }

  if (params?.user_type) {
    queryParams.append('user_type', params.user_type);
  }

  const queryString = queryParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

  return fetchApi<User[]>(endpoint);
}

/**
 * Fetch a single user by ID
 */
export async function getUser(id: string): Promise<User> {
  return fetchApi<User>(`/users/${id}`);
}

/**
 * Update a user
 */
export async function updateUser(id: string, userData: UserUpdate): Promise<User> {
  return fetchApi<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  return fetchApi<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

export async function getDashboardSummary(traineeId: string) {
  return fetchApi(`/trainees/${traineeId}/dashboard-summary`);
} 