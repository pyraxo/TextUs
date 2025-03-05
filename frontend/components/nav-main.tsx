"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  // State to track open collapsibles
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  // Load saved state from localStorage on initial mount
  React.useEffect(() => {
    try {
      const savedOpenItems = localStorage.getItem("sidebarOpenItems");
      if (savedOpenItems) {
        setOpenItems(JSON.parse(savedOpenItems));
      }
    } catch (error) {
      console.error("Failed to load sidebar state:", error);
    }
  }, []);

  // Effect to update open state based on active path and sidebar state
  React.useEffect(() => {
    // Only initialize items that don't have a saved state yet
    const newOpenItems = { ...openItems };
    let hasChanges = false;

    items.forEach((item) => {
      if (openItems[item.title] === undefined) {
        const isItemActive = pathname.startsWith(item.url.split("?")[0]);
        newOpenItems[item.title] = isItemActive && isExpanded;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setOpenItems(newOpenItems);
    }
  }, [pathname, isExpanded, items, openItems]);

  // Handle toggling a collapsible
  const handleToggle = (title: string) => {
    if (isExpanded) {
      const newOpenItems = {
        ...openItems,
        [title]: !openItems[title],
      };

      setOpenItems(newOpenItems);

      // Save to localStorage
      try {
        localStorage.setItem("sidebarOpenItems", JSON.stringify(newOpenItems));
      } catch (error) {
        console.error("Failed to save sidebar state:", error);
      }
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Check if this item's path is active
            const isItemActive = pathname.startsWith(item.url.split("?")[0]);

            return (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible
                    open={openItems[item.title]}
                    onOpenChange={() => handleToggle(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isItemActive}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1">
                        {item.items.map((subItem) => {
                          // Extract tab parameter from URL if it exists
                          const subItemParams = new URLSearchParams(
                            subItem.url.split("?")[1]
                          );
                          const subItemTab = subItemParams.get("tab");

                          // Removing the active highlighting as requested
                          // But keeping the logic to track which item is active for breadcrumbs
                          const isSubItemActive = false; // Always false to remove highlighting

                          return (
                            <Link
                              key={subItem.title}
                              href={subItem.url}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                            >
                              {subItem.title}
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isItemActive}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
