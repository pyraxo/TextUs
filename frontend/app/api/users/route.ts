import { User, UserType } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";
import { users } from "./shared";

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to ensure user_type is a valid UserType
function validateUserType(userType: any): UserType {
  if (Object.values(UserType).includes(userType as UserType)) {
    return userType as UserType;
  }
  return UserType.TRAINEE; // Default to TRAINEE if invalid
}

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Simulate network delay for realistic API behavior
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Add pagination if needed
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset") as string) : undefined;

    let result = [...users];

    if (offset !== undefined && limit !== undefined) {
      result = result.slice(offset, offset + limit);
    } else if (limit !== undefined) {
      result = result.slice(0, limit);
    }

    return NextResponse.json({ users: result, total: users.length }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Simulate network delay for realistic API behavior
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.username || !data.email || !data.password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for duplicate username or email
    if (users.some(user => user.username === data.username)) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    if (users.some(user => user.email === data.email)) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    // Create a new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name,
      username: data.username,
      email: data.email,
      user_type: validateUserType(data.user_type),
      joined_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    // Add to "database"
    users.push(newUser);

    // Return the new user (without password)
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
} 