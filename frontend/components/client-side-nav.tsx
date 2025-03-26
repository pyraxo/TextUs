"use client";

import { NavMain } from "@/components/sidebar/nav-main";
import { usePathname } from "next/navigation";

export function ClientSideNav() {
  const pathname = usePathname();

  // Don't show the sidebar on the landing page (root path)
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return <NavMain />;
}
