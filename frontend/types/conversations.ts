export enum MessageType {
  USER = 'user',
  CUSTOMER = 'customer'
}

export interface Message {
  id: string;
  content: string;
  message_type: MessageType;
  timestamp: string;
}

export interface Conversation {
  id: string;
  scenario_id: string;
  customer_id: string;
  started_at: string;
  ended_at: string | null;
  scenario_name: string | null;
  latest_message_timestamp: string;
}

// Extend Conversation type but make latest_message_timestamp optional since it's calculated
export interface ConversationDetail extends Omit<Conversation, 'latest_message_timestamp'> {
  latest_message_timestamp?: string;
}

export interface ConversationResponse {
  conversation: ConversationDetail;
  messages: Message[];
} 