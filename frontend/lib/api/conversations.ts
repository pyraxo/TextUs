import { Conversation, ConversationResponse, MessageType } from "@/types/conversations.d";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
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
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'An unknown error occurred');
  }

  return response.json();
}

// API functions
export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  return fetchApi<ConversationResponse>(`/conversations/${conversationId}`);
}

export async function getConversations(): Promise<Conversation[]> {
  return fetchApi<Conversation[]>('/conversations');
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  timestamp: string;
  message_type: MessageType;
}

/**
 * Create a new message in a conversation
 * DEPRECATED: Use the websocket to send messages instead
 */
export async function createMessage(
  conversationId: string,
  content: string,
  sender: string
): Promise<Message> {
  const payload = {
    conversation_id: conversationId,
    content,
    trainee_id: sender,
    message_type: 'user'
  };
  console.log('Sending message payload:', payload);

  return fetchApi<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
    credentials: 'include',
  });
} 