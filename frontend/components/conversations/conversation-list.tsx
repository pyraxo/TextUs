"use client";
import { Filter } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Updated dummy data with separate histories for two conversations
const conversations = [
  {
    id: 1,
    customer: "Naomi Austin",
    subject: "Signing up for a demo account",
    time: "41 min ago",
    unread: true,
  },
  {
    id: 2,
    customer: "William Chen",
    subject: "API integration issues",
    time: "2 hours ago",
    unread: false,
  },
];

export function ConversationList() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-xl font-semibold">All conversations</h2>
          <p className="text-sm text-muted-foreground">
            You have {conversations.length} conversations
          </p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <Separator className="bg-muted" />
      <ScrollArea className="flex-1">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/conversations/${conversation.id}`}
            className={cn(
              "flex flex-col gap-1 py-3 px-4 hover:bg-muted/20",
              pathname === `/conversations/${conversation.id}` && "bg-muted/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{conversation.customer}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {conversation.time}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {conversation.subject}
            </p>
            {conversation.unread && (
              <Badge variant="secondary" className="w-fit mt-1">
                New
              </Badge>
            )}
          </Link>
        ))}
      </ScrollArea>
    </div>
  );
}
