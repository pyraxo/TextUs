import { WebSocketProvider } from "@/lib/providers/websocket-provider";
import type React from "react";

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebSocketProvider>
      <div className="h-[calc(100vh-4rem)] w-full p-4">
        <div className="h-full rounded-xl border bg-background shadow-sm">
          {children}
        </div>
      </div>
    </WebSocketProvider>
  );
}
