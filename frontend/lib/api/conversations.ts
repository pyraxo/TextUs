import { Conversation, ConversationResponse, MessageType } from "@/types/conversations.d";
import { fetchApi } from "./common";

// API functions
export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  return fetchApi<ConversationResponse>(`/conversations/${conversationId}`);
}

export async function getConversations(): Promise<Conversation[]> {
  return fetchApi<Conversation[]>('/conversations');
}

export async function getSessionConversations(traineeId: string, sessionId: string): Promise<Conversation[]> {
  return fetchApi<Conversation[]>(`/trainees/${traineeId}/sessions/${sessionId}/conversations`);
}

export interface EvaluationResponse {
  evaluation_status: 'pending' | 'completed' | 'error';
  evaluation_results: any;
  error?: string;
}

export async function getConversationEvaluation(conversationId: string): Promise<EvaluationResponse> {
  return fetchApi<EvaluationResponse>(`/conversations/${conversationId}/evaluation`);
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

/**
 * Update trainer feedback for a conversation
 * @param conversationId - The conversation's ID
 * @param content - The feedback content
 */
export async function updateTrainerFeedback(conversationId: string, content: string): Promise<any> {
  return fetchApi<any>(`/conversations/${conversationId}/feedback`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
} 