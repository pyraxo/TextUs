import { ChatConversation } from './chat';
import { Scenario } from './scenario';
import { User } from './user';

export interface UserScenarioSession {
  id: string;
  user_id: string;
  scenario_id: string;
  start_timestamp: string;  // ISO datetime string
  end_timestamp: string | null;  // ISO datetime string

  // Relationships
  user?: User;
  scenario?: Scenario;
  chat_conversations: ChatConversation[];
}
