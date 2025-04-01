import { UUID } from 'crypto';

export enum MessageType {
  USER = 'user',
  CUSTOMER = 'customer'
}

export interface Message {
  id: UUID;
  content: string;
  message_type: MessageType;
  timestamp: Date;
}

export interface Conversation {
  id: UUID;
  scenario_id: UUID;
  customer_id: UUID;
  started_at: Date;
  ended_at: Date | null;
  scenario_name: string | null;
  latest_message_timestamp: Date;
}

// Extend Conversation type but make latest_message_timestamp optional since it's calculated
export interface ConversationDetail extends Omit<Conversation, 'latest_message_timestamp'> {
  latest_message_timestamp?: Date;
}

export interface ConversationResponse {
  conversation: ConversationDetail;
  messages: Message[];
} 