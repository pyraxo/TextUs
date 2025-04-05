import { UUID } from 'crypto';

export interface Scheme {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  icon: string | null;
  created_by_id: UUID | null;
}

export interface CreateSchemeInput {
  name: string;
  description: string | null;
  icon: string | null;
}

export interface UpdateSchemeInput {
  name: string;
  description: string | null;
  icon: string | null;
}
