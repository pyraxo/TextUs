"use client";
import { useConversations } from "@/lib/hooks/use-conversations";
import { Filter } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Fallback dummy data (will be replaced by API data)
const fallbackConversations = [
  {
    id: "1",
    customer: "Naomi Austin",
    subject: "Signing up for a demo account",
    created_at: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    customer: "William Chen",
    subject: "API integration issues",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export function ConversationList() {
  const pathname = usePathname();
  const { data: conversations, isLoading, error } = useConversations();

  // Format time difference
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))} days ago`;
    }
  };

  // Show a loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold">All conversations</h2>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
          <Button variant="outline" size="icon" disabled>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="bg-muted" />
        <ScrollArea className="flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1 py-3 px-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <Skeleton className="h-4 w-[200px] mt-1" />
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  }

  // Show an error state
  if (error) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold">All conversations</h2>
            <p className="text-sm text-muted-foreground text-red-500">
              Error loading conversations
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="bg-muted" />
        <div className="p-4 text-center">
          <p>Failed to load conversations. Please try again later.</p>
          <Button variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fallback data
  const displayConversations = conversations || fallbackConversations;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-xl font-semibold">All conversations</h2>
          <p className="text-sm text-muted-foreground">
            You have {displayConversations.length} conversations
          </p>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <Separator className="bg-muted" />
      <ScrollArea className="flex-1">
        {displayConversations.map((conversation) => (
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
                {formatTime(conversation.updated_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {conversation.subject}
            </p>
            {new Date(conversation.updated_at) >
              new Date(Date.now() - 60 * 60 * 1000) && (
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
