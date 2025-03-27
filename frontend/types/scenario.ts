export interface Scenario {
  id: string;
  name: string;
  description: string | null;
  is_pausable: boolean;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
  temperature: number | null;
  created_by_id: string | null;
  scheme_id: string | null;
}

export interface ScenarioCreate {
  name: string;
  description?: string;
  is_pausable?: boolean;
  system_prompt?: string;
  temperature?: number;
  scheme_id?: string;
}

export interface ScenarioUpdate {
  name?: string;
  description?: string;
  system_prompt?: string;
  temperature?: number;
  is_pausable?: boolean;
  scheme_id?: string;
} 