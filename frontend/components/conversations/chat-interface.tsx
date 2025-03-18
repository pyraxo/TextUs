"use client";

import { useConversation, useSendMessage } from "@/lib/hooks/use-conversations";
import { Paperclip, SendHorizontal, SmilePlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Fallback conversation histories for when API is not available
const fallbackConversationHistories = {
  "1": [
    {
      id: "1",
      conversation_id: "1",
      sender: "Naomi",
      content:
        "Hi there, I would like to sign up for a demo account to try out the product. I completed the form on your website and awaiting further instructions. Is there anything else that I need to do?",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      type: "customer",
    },
    {
      id: "2",
      conversation_id: "1",
      sender: "Chris",
      content:
        "Hi Naomi 👋 Thank you for your interest. I've added you to the waitlist and will be sending you an access key to the private beta in the upcoming few days. Could you please confirm your e-mail?",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      type: "agent",
    },
    {
      id: "3",
      conversation_id: "1",
      sender: "Naomi",
      content:
        "That's perfect, looking forward! My email is: naomi.austin@unity.com",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      type: "customer",
    },
  ],
  "2": [
    {
      id: "1",
      conversation_id: "2",
      sender: "William",
      content:
        "Hello, I'm having some issues integrating your API with our system. The documentation seems to be outdated. Can you help?",
      timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
      type: "customer",
    },
    {
      id: "2",
      conversation_id: "2",
      sender: "Sarah",
      content:
        "Hi William, I'm sorry to hear you're experiencing difficulties. Can you tell me which specific part of the API you're having trouble with?",
      timestamp: new Date(Date.now() - 165 * 60000).toISOString(),
      type: "agent",
    },
    {
      id: "3",
      conversation_id: "2",
      sender: "William",
      content:
        "It's the authentication process. The tokens don't seem to be working as described in the docs.",
      timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
      type: "customer",
    },
  ],
};

export function ChatInterface({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = React.useState("");
  const { data, isLoading, error } = useConversation(conversationId);
  const sendMessageMutation = useSendMessage();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  React.useEffect(() => {
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

    sendMessageMutation.mutate(
      { conversationId, content: message },
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
  const { conversation, messages } = data || {
    conversation: {
      id: conversationId,
      customer: conversationId === "1" ? "Naomi Austin" : "William Chen",
      subject:
        conversationId === "1"
          ? "Demo Account Request"
          : "API Integration Support",
      created_at: "",
      updated_at: "",
    },
    messages:
      fallbackConversationHistories[
        conversationId as keyof typeof fallbackConversationHistories
      ] || [],
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="font-semibold">{conversation.customer}</h2>
        <p className="text-sm text-muted-foreground">{conversation.subject}</p>
      </div>
      <Separator className="bg-muted" />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "agent" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.type === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-medium ${
                      msg.type === "agent"
                        ? "text-white"
                        : "text-primary-foreground"
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <span
                    className={`text-xs opacity-70 ${
                      msg.type === "agent"
                        ? "text-white"
                        : "text-primary-foreground"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    msg.type === "agent"
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
            <Button size="icon" variant="ghost">
              <SmilePlus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
