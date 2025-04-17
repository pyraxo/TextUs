'use client';

import { useAuth, User } from '@/hooks/use-auth';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
} from '@/lib/api/users';
import { UserCreate, UserUpdate } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch all users with optional filters
 */
export function useUsers(params?: {
  skip?: number;
  limit?: number;
  user_type?: 'admin' | 'trainer' | 'trainee';
}) {
  const { isAuthenticated, isTrainer } = useAuth();

  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => getUsers(params),
    // Only enabled if user is authenticated and is an admin
    enabled: isAuthenticated && isTrainer,
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: string) {
  const { isAuthenticated, user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === id;
  const isAdmin = currentUser?.user_type === 'admin';

  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    // Only enabled if user is authenticated and is either an admin or accessing own profile
    enabled: isAuthenticated && (isAdmin || isOwnProfile) && !!id,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  return useMutation<User, Error, UserCreate>({
    mutationFn: (userData) => createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Add the new user to the cache
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    },
    // This mutation is only available for admin users
    // The actual permission check will be done on the server
    meta: { requiresAdmin: true }
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  return useMutation<User, Error, { id: string; userData: UserUpdate }>({
    mutationFn: ({ id, userData }) => updateUser(id, userData),
    onSuccess: (updatedUser, variables) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(variables.id), updatedUser);

      // If the current user updated their own profile, update auth context
      if (currentUser?.id === variables.id) {
        // We don't directly update auth context here as it requires a refetch
        // Instead, we invalidate the /auth/me query which will trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }

      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (_data, id) => {
      // Remove the user from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });

      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
} 