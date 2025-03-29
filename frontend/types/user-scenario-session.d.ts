import { ChatConversation } from './chat';
import { Scenario } from './scenario';
import { User } from './user';

export interface UserScenarioSession {
  id: string;
  user_id: string;
  scenario_id: string;
  start_timestamp: string;  // ISO datetime string
  end_timestamp: string | null;  // ISO datetime string

  // Metrics
  metrics?: {
    duration_seconds?: number;
    total_messages: number;
    user_messages: number;
    bot_messages: number;
    conversations: number;
    avg_response_time?: number;
    completion_rate: number;
  };

  // Relationships
  user?: User;
  scenario?: Scenario;
  chat_conversations: ChatConversation[];
}
