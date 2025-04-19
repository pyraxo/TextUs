import { FileUpload } from "./file-upload";

export interface Scenario {
  id: string;
  name: string;
  description: string | null;
  is_pausable: boolean;
  system_prompt: string | null;
  created_at: Date;
  updated_at: Date;
  temperature: number | null;
  created_by_id: UUID | null;
  scheme_id: UUID | null;
  file_uploads?: FileUpload[];
}

export interface ScenarioCreate {
  name: string;
  description?: string;
  is_pausable?: boolean;
  system_prompt?: string;
  temperature?: number;
  scheme_id?: UUID;
}

export interface ScenarioUpdate {
  name?: string;
  description?: string;
  system_prompt?: string;
  temperature?: number;
  is_pausable?: boolean;
  scheme_id?: string;
  file_upload_ids?: string[];
} 