'use client';

import {
  type Message,
  createMessage,
  getConversation,
  getConversations
} from '@/lib/api/conversations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: string) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

/**
 * Hook to fetch all conversations
 */
export function useConversations() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: getConversations,
    retry: 1, // Only retry once to avoid excessive retries on server down
    retryDelay: 1000, // Wait 1 second before retrying
  });

  return {
    ...query,
    mutate: () => queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
  };
}

/**
 * Hook to fetch a single conversation by ID
 */
export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => getConversation(id),
    enabled: !!id,
  });
}

// Type for the mutation variables
interface SendMessageVariables {
  conversationId: string;
  content: string;
  sender: string;
}

/**
 * Hook to send a new message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SendMessageVariables>({
    mutationFn: ({ conversationId, content, sender }) =>
      createMessage(conversationId, content, sender),
    onSuccess: (newMessage, variables) => {
      // Invalidate the conversation query to refetch with the new message
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(variables.conversationId),
      });
    },
  });
} 