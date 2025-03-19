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

export function ConversationList() {
  const pathname = usePathname();
  const { data: conversations, isLoading, error } = useConversations();

  // Format time difference
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Check if date is valid before proceeding
      if (isNaN(date.getTime())) {
        return "Unknown time";
      }

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
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Unknown time";
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
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("connect") ||
        error.message.includes("network") ||
        error.message.includes("failed"));

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold">All conversations</h2>
            <p className="text-sm text-muted-foreground">
              Error loading conversations
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="bg-muted" />
        <div className="p-4 text-left">
          {isConnectionError ? (
            <>
              <p>Unable to connect to the conversation service.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please make sure the API server is running and try again.
              </p>
            </>
          ) : (
            <p>Failed to load conversations. Please try again later.</p>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const displayConversations = conversations || [];

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
        {displayConversations.length > 0 ? (
          displayConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/conversations/${conversation.id}`}
              className={cn(
                "flex flex-col gap-1 py-3 px-4 hover:bg-muted/20",
                pathname === `/conversations/${conversation.id}` &&
                  "bg-muted/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {conversation.scenario_name}
                  </span>
                  {/* {conversation.scenario_name && (
                    <Badge variant="outline" className="text-xs">
                      {conversation.scenario_name}
                    </Badge>
                  )} */}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(conversation.updated_at)}
                </span>
              </div>
              {/* <p className="text-sm text-muted-foreground">
                {conversation.subject}
              </p> */}
              {new Date(conversation.updated_at) >
                new Date(Date.now() - 60 * 60 * 1000) && (
                <Badge variant="secondary" className="w-fit mt-1">
                  New
                </Badge>
              )}
            </Link>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-2">No conversations found</p>
            <p className="text-sm text-muted-foreground">
              Your conversations will appear here once they become available
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
