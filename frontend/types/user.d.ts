import { UUID } from "crypto";

export enum UserType {
  TRAINEE = "trainee",
  TRAINER = "trainer",
  ADMIN = "admin",
}

export interface User {
  id: UUID;
  name: string;
  email: string;
  user_type: UserType;
  joined_at: Date;
  last_login: Date;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  user_type?: UserType;
}