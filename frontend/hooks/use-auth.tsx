"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  user_type: "admin" | "trainer" | "trainee";
  joined_at: string;
  last_login: string;
}

// Define public routes where auth check isn't needed
const PUBLIC_ROUTES = ["/", "/login"];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create a context for authentication
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isTrainer: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  checkAuth: async () => false,
});

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if the user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        setUser(null);
        router.push("/login");
        return false;
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the response
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return { success: true };
      } else {
        const error = await response.json();
        console.error("Login failed:", error);
        if (response.status === 429) {
          return {
            success: false,
            error: error.detail || "Too many requests. Please try again later.",
          };
        }
        return {
          success: false,
          error: error.detail || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An error occurred during login. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount, but only if not on a public route
  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(pathname)) {
      checkAuth();
    } else {
      // On public routes, just set loading to false without checking auth
      setIsLoading(false);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: We intentionally omit checkAuth from deps to prevent infinite loops

  const isAuthenticated = !!user;
  const isAdmin = user?.user_type === "admin";
  const isTrainer =
    user?.user_type === "trainer" || user?.user_type === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isTrainer,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
