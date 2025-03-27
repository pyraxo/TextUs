"use client";

import { SidebarIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

// Helper function to get page title based on pathname and search params
function getPageInfo(pathname: string, searchParams: URLSearchParams) {
  // Extract the main route (first segment after /)
  const mainRoute = pathname.split("/")[1];

  // Default values
  let mainTitle = mainRoute
    ? mainRoute.charAt(0).toUpperCase() + mainRoute.slice(1)
    : "Home";
  let subTitle = "";
  let mainPath = `/${mainRoute}`;
  let subPath = "";

  // Handle specific routes
  // if (mainRoute === "dashboard") {
  //   mainTitle = "Dashboard";
  //   mainPath = "/dashboard";

  //   // Get the tab parameter for dashboard
  //   const tab = searchParams.get("tab");
  //   // Define valid tabs
  //   const validTabs = ["overview", "practice", "schemes"];

  //   if (tab && validTabs.includes(tab) && tab !== "overview") {
  //     // Valid tab (except overview)
  //     subTitle = tab.charAt(0).toUpperCase() + tab.slice(1);
  //     subPath = `/dashboard?tab=${tab}`;
  //   } else {
  //     // Invalid or missing tab, or tab is "overview" - don't set subtitle
  //     subPath = "/dashboard?tab=overview";
  //   }
  // }

  return { mainTitle, subTitle, mainPath, subPath };
}

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get page information for breadcrumbs
  const { mainTitle, subTitle, mainPath, subPath } = getPageInfo(
    pathname,
    searchParams
  );

  // Check if we're on the home or login route
  const isSimpleHeader = pathname === "/" || pathname === "/login";

  // Simple header for home and login routes
  if (isSimpleHeader) {
    return (
      <header className="fixed top-0 left-0 w-full flex h-16 items-center justify-between px-8 bg-cpf-teal text-white z-50">
        <div className="flex items-center gap-2">
          <Image
            src="/cpf_logo.png"
            alt="CPF Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold">CPF Board</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="text-white hover:bg-cpf-teal-dark"
            asChild
          >
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </header>
    );
  }

  // Enhanced header for all other routes
  return (
    <header className="fixed top-0 left-0 z-50 w-full flex h-16 items-center justify-between bg-cpf-teal text-white border-b border-cpf-teal-dark">
      <div className="flex h-full w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8 text-white"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 h-4 bg-foreground/20"
        />
        <div className="flex items-center gap-2">
          <Image
            src="/cpf_logo.png"
            alt="CPF Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold hidden sm:inline-block">
            CPF Board
          </span>
        </div>
        <Breadcrumb className="hidden md:block ml-4">
          <BreadcrumbList className="text-white">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={mainPath}
                  className="text-white hover:text-white/80"
                >
                  {mainTitle}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {subTitle && (
              <>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={subPath}
                      className="text-white/90 hover:text-white"
                    >
                      {subTitle}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
