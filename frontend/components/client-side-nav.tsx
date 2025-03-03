"use client";

import { MainNav } from "@/components/main-nav";
import { usePathname } from "next/navigation";

export function ClientSideNav() {
  const pathname = usePathname();

  // Don't show the sidebar on the landing page (root path)
  if (pathname === "/" || pathname === "/404") {
    return null;
  }

  return <MainNav />;
}
