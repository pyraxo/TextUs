import { ConversationList } from "@/components/conversation-list";
import type React from "react";

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-4 p-4">
      <div className="w-80 rounded-xl border bg-background shadow-sm">
        <ConversationList />
      </div>
      <div className="flex-1 rounded-xl border bg-background shadow-sm">
        {children}
      </div>
    </div>
  );
}
