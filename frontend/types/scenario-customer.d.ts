export interface ScenarioCustomer {
  id: string;
  name: string;
  scenario_prompt: string | null;
  temperature: number | null;
  customer_id: string;
  scenario_id: string;
  expected_queries: string[] | null;
  feedback_ai: string | null;
}

export interface ScenarioCustomerCreate {
  customer_id: string;
  scenario_id: string;
  name: string;
  scenario_prompt?: string;
  temperature?: number;
  expected_queries?: string[];
}

export interface ScenarioCustomerUpdate {
  name?: string;
  scenario_prompt?: string;
  temperature?: number;
  expected_queries?: string[];
  feedback_ai?: string;
} 