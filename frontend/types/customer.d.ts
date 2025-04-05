import { UUID } from "crypto";

// Base customer interface
export interface CustomerBase {
  name: string;
  description?: string | null;
  profile_prompt?: string | null;
  created_at?: Date;
  updated_at?: Date;
  personality_traits?: string[];
}

// Full customer interface with ID and metadata
export interface Customer extends CustomerBase {
  id: UUID;
  created_by_id?: UUID | null;
  updated_by_id?: UUID | null;
}

// Interface for creating a new customer
export interface CustomerCreate extends CustomerBase {
  created_by_id?: UUID | null;
}

// Interface for updating an existing customer
export interface CustomerUpdate {
  name?: string;
  description?: string | null;
  profile_prompt?: string | null;
  updated_by_id?: UUID | null;
  personality_traits?: string[];
}