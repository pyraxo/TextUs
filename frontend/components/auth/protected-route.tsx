"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (adminOnly && !isAdmin) {
        // If admin only and user is not admin, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, adminOnly]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated or admin check fails, show nothing (will redirect)
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  // Otherwise, show the children
  return <>{children}</>;
}
