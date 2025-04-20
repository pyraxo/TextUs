'use client';

import { useAuth } from "@/hooks/use-auth";
import { useSessionConversations } from "@/hooks/use-conversations";
import { useQuery } from "@tanstack/react-query";

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Function to fetch the active session
async function getActiveSession(traineeId: string) {
  if (!traineeId) return null;

  try {
    const response = await fetch(`${API_URL}/trainees/${traineeId}/session`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No active session - that's a valid state
        return null;
      }
      throw new Error('Failed to fetch active session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active session:', error);
    return null;
  }
}

/**
 * Hook to get session conversations for the active session
 * This combines the authentication, session fetching, and conversation fetching
 */
export function useActiveSessionConversations(sessionId?: string) {
  const { user } = useAuth();
  const traineeId = user?.id;

  // If sessionId is provided, use it directly, otherwise fetch the active session
  const { data: activeSession, isLoading: isSessionLoading } = useQuery({
    queryKey: ['activeSession', traineeId],
    queryFn: () => getActiveSession(traineeId || ''),
    enabled: !!traineeId && !sessionId,
  });

  // Use the session ID from props or from the active session
  const effectiveSessionId = sessionId || (activeSession?.id as string);

  // Fetch conversations for this session
  const conversationsQuery = useSessionConversations(
    traineeId || '',
    effectiveSessionId || ''
  );

  return {
    ...conversationsQuery,
    activeSession,
    isSessionLoading,
    effectiveSessionId,
  };
}