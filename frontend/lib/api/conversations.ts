// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export enum MessageType {
  USER = 'user',
  BOT = 'bot'
}

// Types matching backend models
export interface Conversation {
  id: string;
  customer_name: string;
  subject: string;
  created_at: string;
  updated_at: string;
  scenario_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  timestamp: string;
  message_type: MessageType;
}

interface ConversationResponse {
  conversation: Conversation;
  messages: Message[];
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

  try {
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
  } catch (error) {
    // Handle network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('API connection error:', error);
      throw new ApiError('Unable to connect to the API server. Please check your connection or try again later.', 503);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  const data = await fetchApi<any[]>('/conversations');

  // Map the API response to our frontend model
  return data.map(conv => ({
    id: conv.id,
    customer_name: `Customer ${conv.customer_id.slice(0, 8)}`, // Example formatting
    subject: conv.scenario_name || 'Untitled Conversation',
    created_at: conv.started_at,
    updated_at: conv.started_at, // We use started_at as updated_at for now
    scenario_name: conv.scenario_name
  }));
}

/**
 * Fetch a single conversation by ID
 */
export async function getConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  const response = await fetchApi<ConversationResponse>(`/conversations/${id}`);

  // Format the conversation for frontend display
  const conversation: Conversation = {
    id: response.conversation.id,
    customer_name: response.conversation.scenario_name || 'Customer',
    subject: response.conversation.scenario_name || 'Untitled Conversation',
    created_at: response.conversation.created_at,
    updated_at: response.conversation.updated_at,
    scenario_name: response.conversation.scenario_name || undefined
  };

  // Pass through the messages as is
  return {
    conversation,
    messages: response.messages as Message[] // The types already match
  };
}

/**
 * Create a new message in a conversation
 */
export async function createMessage(
  conversationId: string,
  content: string,
  sender: string
): Promise<Message> {
  const payload = {
    conversation_id: conversationId,
    content,
    sender,
    message_type: 'bot'
  };
  console.log('Sending message payload:', payload);

  return fetchApi<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
    credentials: 'include',
  });
} 