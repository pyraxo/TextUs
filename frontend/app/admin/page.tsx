"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Sliders, Users } from "lucide-react";
import Link from "next/link";

const adminOptions = [
  {
    title: "User Management",
    description: "Manage system users",
    href: "/admin/user-management",
    icon: <Users className="h-8 w-8 text-card-foreground stroke-[2px]" />,
  },
  {
    title: "Prompt Engineering Controls",
    description: "Configure AI prompt engineering settings",
    href: "/admin/prompt-engineering",
    icon: <Sliders className="h-8 w-8 text-card-foreground stroke-[2px]" />,
  },
  {
    title: "Content Management",
    description: "Manage knowledge base and training content",
    href: "/admin/content-management",
    icon: <BookOpen className="h-8 w-8 text-card-foreground stroke-[2px]" />,
  },
];

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-16 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6">Admin Dashboard</h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal">
            What would you like to manage today?
          </h2>
        </div>
      </div>

      {/* Admin options grid */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminOptions.map((option) => (
            <Link href={option.href} key={option.title}>
              <Card className="overflow-hidden border-0 bg-card rounded-lg hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col">
                  <div className="px-6 py-6">
                    <div className="flex items-center gap-4 mb-3">
                      {option.icon}
                      <h3 className="text-xl font-bold text-card-foreground">
                        {option.title}
                      </h3>
                    </div>
                    <p className="text-sm text-card-foreground">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* User info section at the bottom */}
      {user && (
        <div className="container mx-auto px-4 md:px-8 pb-8">
          <div className="p-4 bg-card rounded-lg">
            <p className="text-sm">
              Logged in as: <span className="font-bold">{user.name}</span> (
              {user.user_type})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
