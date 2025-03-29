"use client";
import {
  BotMessageSquare,
  ClipboardList,
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  Sliders,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/hooks/use-auth";
import Link from "next/link";

// Define navigation items
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
  },
  {
    title: "Practice",
    url: "/practice",
    icon: ClipboardList,
  },
];

const navTrainer = [
  {
    title: "Trainer Dashboard",
    url: "/trainer",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Scenarios",
    url: "/trainer/scenarios",
    icon: BotMessageSquare,
  },
  {
    title: "Manage Trainees",
    url: "/trainer/trainees",
    icon: Users,
  },
];

const navAdmin = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: ShieldCheck,
  },
  {
    title: "Manage Users",
    url: "/admin/user-management",
    icon: Users,
  },
  {
    title: "Prompt Engineering",
    url: "/admin/prompt-engineering",
    icon: Sliders,
  },
];

export function NavMain({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (url: string) => {
    // Check if the current path matches the item URL
    // For exact matches or if the item URL is a prefix of the current path
    // return pathname === url || (pathname?.startsWith(url) && url !== "/");
    return pathname === url;
  };

  // Check user roles based on user_type
  const isTrainer =
    user?.user_type === "trainer" || user?.user_type === "admin";
  const isAdmin = user?.user_type === "admin";

  return (
    <Sidebar
      collapsible="icon"
      className="fixed top-16 !h-[calc(100vh-4rem)]"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isTrainer && (
          <SidebarGroup>
            <SidebarGroupLabel>Trainer</SidebarGroupLabel>
            <SidebarMenu>
              {navTrainer.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {navAdmin.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
