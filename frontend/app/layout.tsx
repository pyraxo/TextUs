import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/lib/providers/query-provider";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import type React from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

import { ClientSideNav } from "@/components/client-side-nav";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CPF Training Platform",
  description: "Training platform for CPF service staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} font-sans`}
    >
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SidebarProvider
                defaultOpen={defaultOpen}
                className="flex flex-col h-full"
              >
                <Header />
                <div className="flex min-h-screen w-full bg-gray-50/50 pt-16">
                  <ClientSideNav />
                  <SidebarInset className="flex-1">
                    {/* <div className="h-1 w-full bg-[rgba(165,207,76,0.8)]"></div> */}
                    {children}
                    <Toaster />
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
