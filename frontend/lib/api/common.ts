// API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
    headers: {
      ...(isFormData
        ? {} // Let browser set Content-Type for FormData
        : { 'Content-Type': 'application/json' }),
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