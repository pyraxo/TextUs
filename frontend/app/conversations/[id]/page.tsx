"use client";

import { ConversationsInterface } from "@/components/conversations/conversations-interface";
import { CustomerInfo } from "@/components/conversations/customer-info";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";

export default function ConversationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-full flex overflow-hidden relative">
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "pr-[380px]" : ""
        }`}
      >
        <ConversationsInterface />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`fixed z-50 transition-all duration-300 ${
          isSidebarOpen ? "right-[400px]" : "right-6"
        } top-[88px]`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <PanelRightClose className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </Button>
      <div
        className={`fixed top-[80px] right-[-400px] h-[calc(100vh-96px)] w-[380px] mr-[16px] border bg-background transition-transform duration-300 rounded-xl overflow-y-auto ${
          isSidebarOpen ? "translate-x-[-400px]" : "translate-x-0"
        }`}
      >
        <CustomerInfo />
      </div>
    </div>
  );
}
