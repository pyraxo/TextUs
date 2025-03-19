"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useConversation, useSendMessage } from "@/lib/hooks/use-conversations";
import { Paperclip, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ChatInterface({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const { data, isLoading, error } = useConversation(conversationId);
  const sendMessageMutation = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Log data for debugging
  useEffect(() => {
    if (data) {
      console.log("Conversation data:", data);
    }
  }, [data]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    sendMessageMutation.mutate(
      { conversationId, content: message, sender: user.id },
      {
        onSuccess: () => {
          setMessage("");
        },
        onError: (error) => {
          toast.error("Failed to send message. Please try again.");
          console.error("Error sending message:", error);
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Skeleton className="h-7 w-[200px]" />
          <Skeleton className="h-5 w-[150px] mt-1" />
        </div>
        <Separator className="bg-muted" />
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-start">
                <Skeleton className="h-[100px] w-[80%] rounded-lg" />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Skeleton className="h-[80px] w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Error loading conversation:", error);
    return (
      <div className="flex h-full flex-col">
        <div className="p-4">
          <h2 className="font-semibold">Error Loading Conversation</h2>
          <p className="text-sm text-red-500">
            Could not load conversation data
          </p>
        </div>
        <Separator className="bg-muted" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p>Failed to load conversation. Please try again later.</p>
            <Button variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fallback data
  const conversation = data?.conversation || {
    id: conversationId,
    customer_name: "Customer",
    subject: "Conversation",
    created_at: "",
    updated_at: "",
    scenario_name: "",
  };

  const messages = data?.messages || [];

  // If we have data but no messages, display a message
  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="font-semibold">
          {conversation?.customer_name || "Customer"}
        </h2>
        {/* <p className="text-sm text-muted-foreground">
          {conversation?.subject || "Conversation"}
        </p> */}
      </div>
      <Separator className="bg-muted" />
      <ScrollArea className="flex-1 p-4">
        {hasMessages ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.message_type === "bot" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.message_type === "bot"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-sm font-medium ${
                        msg.message_type === "bot"
                          ? "text-white"
                          : "text-primary-foreground"
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span
                      className={`text-xs opacity-70 ${
                        msg.message_type === "bot"
                          ? "text-white"
                          : "text-primary-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      msg.message_type === "bot"
                        ? "text-white"
                        : "text-primary-foreground"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button size="icon" variant="ghost">
              <Paperclip className="h-4 w-4" />
            </Button>
            {/* <Button size="icon" variant="ghost">
              <SmilePlus className="h-4 w-4" />
            </Button> */}
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              <SendHorizontal className="h-4 w-4 text-muted" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
