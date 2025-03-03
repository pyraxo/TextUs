"use client";

import { SidebarIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
export default function Header() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

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
        <Button
          variant="ghost"
          className="text-white hover:bg-cpf-teal-dark"
          asChild
        >
          <Link href="/login">Log In</Link>
        </Button>
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
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
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
              <BreadcrumbLink
                href="#"
                className="text-white hover:text-white/80"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white/90">
                Current Page
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative w-full max-w-sm hidden sm:block">
            <Input
              type="search"
              placeholder="Search..."
              className="bg-cpf-teal-dark/50 border-cpf-teal-dark text-white placeholder:text-white/60 focus-visible:ring-white/30"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
