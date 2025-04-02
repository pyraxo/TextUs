import { ChatConversation } from './chat';
import { Scenario } from './scenario';
import { User } from './user';

export interface UserScenarioSession {
  id: UUID;
  user_id: UUID;
  scenario_id: UUID;
  start_timestamp: Date;
  end_timestamp: Date | null;

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
