"use client";

import { Paperclip, SendHorizontal, SmilePlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Separate conversation histories
const conversationHistories = {
  "1": [
    {
      id: 1,
      sender: "Naomi",
      content:
        "Hi there, I would like to sign up for a demo account to try out the product. I completed the form on your website and awaiting further instructions. Is there anything else that I need to do?",
      timestamp: "11:24",
      type: "customer",
    },
    {
      id: 2,
      sender: "Chris",
      content:
        "Hi Naomi 👋 Thank you for your interest. I've added you to the waitlist and will be sending you an access key to the private beta in the upcoming few days. Could you please confirm your e-mail?",
      timestamp: "11:53",
      type: "agent",
    },
    {
      id: 3,
      sender: "Naomi",
      content:
        "That's perfect, looking forward! My email is: naomi.austin@unity.com",
      timestamp: "12:01",
      type: "customer",
    },
  ],
  "2": [
    {
      id: 1,
      sender: "William",
      content:
        "Hello, I'm having some issues integrating your API with our system. The documentation seems to be outdated. Can you help?",
      timestamp: "09:15",
      type: "customer",
    },
    {
      id: 2,
      sender: "Sarah",
      content:
        "Hi William, I'm sorry to hear you're experiencing difficulties. Can you tell me which specific part of the API you're having trouble with?",
      timestamp: "09:30",
      type: "agent",
    },
    {
      id: 3,
      sender: "William",
      content:
        "It's the authentication process. The tokens don't seem to be working as described in the docs.",
      timestamp: "09:45",
      type: "customer",
    },
  ],
};

export function ChatInterface({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = React.useState("");
  const messages =
    conversationHistories[
      conversationId as keyof typeof conversationHistories
    ] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="font-semibold">Conversation #{conversationId}</h2>
        <p className="text-sm text-muted-foreground">
          {conversationId === "1"
            ? "Demo Account Request"
            : "API Integration Support"}
        </p>
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
                    {msg.timestamp}
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
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
          />
          <div className="flex flex-col gap-2">
            <Button size="icon" variant="ghost">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <SmilePlus className="h-4 w-4" />
            </Button>
            <Button size="icon">
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
