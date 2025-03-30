export interface Scheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  icon: string | null;
  created_by_id: string | null;
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
