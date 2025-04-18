"use client";

import { ConversationsInterface } from "@/components/conversations/ConversationInterface";
import { CustomerInfo } from "@/components/conversations/CustomerInfo";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";

export default function ConversationsPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [trainerFeedback, setTrainerFeedback] = useState<string | null>(null);

  return (
    <div className="h-full flex overflow-hidden relative">
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "pr-[380px]" : ""
        }`}
      >
        <ConversationsInterface
          activeSessionId={params.id}
          onConversationSelect={(conversationId) => {
            setActiveConversationId(conversationId);
          }}
          onTrainerFeedback={(feedback) => {
            setTrainerFeedback(feedback);
          }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`fixed z-50 transition-all duration-300 ${
          isSidebarOpen ? "right-[400px]" : "right-6"
        } top-[94px]`}
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
        <CustomerInfo
          conversationId={activeConversationId}
          trainerFeedback={trainerFeedback}
        />
      </div>
    </div>
  );
}
