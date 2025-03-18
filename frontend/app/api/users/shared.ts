import { User, UserType } from "@/types/user";

// Simulated database
export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    user_type: UserType.ADMIN,
    joined_at: new Date("2023-01-01").toISOString(),
    last_login: new Date("2023-06-15").toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    user_type: UserType.TRAINER,
    joined_at: new Date("2023-02-15").toISOString(),
    last_login: new Date("2023-07-20").toISOString(),
  },
  {
    id: "3",
    name: "Alex Johnson",
    username: "alexj",
    email: "alex@example.com",
    user_type: UserType.TRAINEE,
    joined_at: new Date("2023-03-10").toISOString(),
    last_login: new Date("2023-08-05").toISOString(),
  },
]; 