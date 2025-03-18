"use client";
import { BotMessageSquare, PieChart, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavUser } from "@/components/nav-user";
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
import Link from "next/link";
// This is sample data.
const data = {
  user: {
    name: "Brighton",
    email: "brighton@brighton.com",
    avatar: "/cpf_logo.png",
    roles: ["user", "trainer", "admin"],
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      title: "Practice",
      url: "/practice",
      icon: BotMessageSquare,
    },
    {
      title: "Conversations",
      url: "/conversations",
      icon: BotMessageSquare,
    },
  ],
  navTrainer: [
    {
      title: "Manage Students",
      url: "/trainer/students",
      icon: Users,
    },
  ],
  navAdmin: [
    {
      title: "Settings",
      url: "/admin",
      icon: Settings,
    },
  ],
};

export function NavMain({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (url: string) => {
    // Check if the current path matches the item URL
    // For exact matches or if the item URL is a prefix of the current path
    return pathname === url || (pathname?.startsWith(url) && url !== "/");
  };

  const isTrainer = data.user.roles.includes("trainer");
  const isAdmin = data.user.roles.includes("admin");

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
            {data.navMain.map((item) => (
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
              {data.navTrainer.map((item) => (
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
              {data.navAdmin.map((item) => (
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
