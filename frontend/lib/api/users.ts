import { User, UserCreate, UserUpdate } from '@/types/user';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Error class
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Helper function for API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized by redirecting to login page
    if (response.status === 401) {
      // Use client-side navigation if in browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new ApiError(error.message || 'An unknown error occurred', response.status);
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json();
}

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