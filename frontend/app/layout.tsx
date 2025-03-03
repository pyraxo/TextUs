import { ThemeProvider } from "@/components/theme-provider";
import { Inter, Outfit } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { ClientSideNav } from "@/components/client-side-nav";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";

export const metadata = {
  title: "CPF Simulator",
  description: "Training simulator for CPF Board CCU Officers",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider className="flex flex-col h-full">
            <Header />
            <div className="flex min-h-screen w-full bg-gray-50/50 pt-16">
              <ClientSideNav />
              <SidebarInset className="flex-1">{children}</SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
