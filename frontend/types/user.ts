export enum UserType {
  TRAINEE = "trainee",
  TRAINER = "trainer",
  ADMIN = "admin"
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  user_type: UserType;
  joined_at: string;
  last_login: string;
}

export interface UserCreateData {
  name: string;
  username: string;
  email: string;
  password: string;
  user_type: UserType;
} 