import { User, UserCreateData, UserType } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Sample initial users data for demo purposes
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    user_type: UserType.ADMIN,
    joined_at: new Date("2023-01-01").toISOString(),
    last_login: new Date("2023-06-15").toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    user_type: UserType.TRAINER,
    joined_at: new Date("2023-02-15").toISOString(),
    last_login: new Date("2023-07-20").toISOString(),
  },
  {
    id: "3",
    name: "Alex Johnson",
    username: "alexj",
    email: "alex@example.com",
    user_type: UserType.TRAINEE,
    joined_at: new Date("2023-03-10").toISOString(),
    last_login: new Date("2023-08-05").toISOString(),
  },
];

// Mock delay to simulate API latency
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to ensure user_type is always a valid UserType
const ensureValidUserType = (userType: any): UserType => {
  if (Object.values(UserType).includes(userType as UserType)) {
    return userType as UserType;
  }
  return UserType.TRAINEE; // Default to TRAINEE if invalid
};

// API functions
const api = {
  getUsers: async (): Promise<User[]> => {
    await mockDelay();
    // In a real app, this would be a fetch call to your API
    // return await fetch('/api/users').then(res => res.json());
    return [...mockUsers];
  },

  getUserById: async (id: string): Promise<User | null> => {
    await mockDelay();
    // In a real app, this would be a fetch call to your API
    // return await fetch(`/api/users/${id}`).then(res => res.json());
    const user = mockUsers.find(u => u.id === id);
    return user ? { ...user } : null;
  },

  createUser: async (userData: UserCreateData): Promise<User> => {
    await mockDelay();
    // In a real app, this would be a POST request to your API
    // return await fetch('/api/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // }).then(res => res.json());

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      joined_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      user_type: ensureValidUserType(userData.user_type)
    };

    mockUsers.push(newUser);
    return { ...newUser };
  },

  updateUser: async (params: { id: string; userData: Partial<User> }): Promise<User | null> => {
    const { id, userData } = params;
    await mockDelay();
    // In a real app, this would be a PUT/PATCH request to your API
    // return await fetch(`/api/users/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // }).then(res => res.json());

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...userData,
      // Ensure user_type is valid
      user_type: userData.user_type ? ensureValidUserType(userData.user_type) : mockUsers[userIndex].user_type,
      // Update last_login if not explicitly provided
      last_login: userData.last_login || new Date().toISOString()
    };

    mockUsers[userIndex] = updatedUser;
    return { ...updatedUser };
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await mockDelay();
    // In a real app, this would be a DELETE request to your API
    // return await fetch(`/api/users/${id}`, {
    //   method: 'DELETE'
    // }).then(res => res.ok);

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    mockUsers.splice(userIndex, 1);
    return true;
  }
};

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// React Query hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: api.getUsers,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => api.getUserById(userId),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
} 