// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types matching backend models
export interface Conversation {
  id: string;
  customer: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'customer' | 'agent';
}

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
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new ApiError(error.message || 'An unknown error occurred', response.status);
  }

  return response.json();
}

/**
 * Fetch all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  return fetchApi<Conversation[]>('/conversations');
}

/**
 * Fetch a single conversation by ID
 */
export async function getConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  return fetchApi<{ conversation: Conversation; messages: Message[] }>(`/conversations/${id}`);
}

/**
 * Create a new message in a conversation
 */
export async function createMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  return fetchApi<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
} 