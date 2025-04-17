import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/conversations";

export function ConversationsList({
  conversations,
  activeConversationId,
  onSelect,
  activeConversationsMap,
  isLoading,
  isSessionLoading,
  connectionState,
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  activeConversationsMap: Map<string, any>;
  isLoading: boolean;
  isSessionLoading: boolean;
  connectionState: string;
}) {
  // Sort conversations by latest message timestamp (newest first)
  const displayConversations = [...(conversations || [])].sort((a, b) => {
    const aTimestamp = a.latest_message_timestamp
      ? new Date(a.latest_message_timestamp).getTime()
      : 0;
    const bTimestamp = b.latest_message_timestamp
      ? new Date(b.latest_message_timestamp).getTime()
      : 0;
    return bTimestamp - aTimestamp; // Descending order (newest first)
  });

  // Helper for formatting time (reuse from parent or pass as prop if needed)
  const formatListTime = (dateString: string) => {
    try {
      if (!dateString) return "Unknown time";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown time";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays > 7) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } else if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else if (diffMins > 0) {
        return `${diffMins}m ago`;
      }
      return "Just now";
    } catch {
      return "Unknown time";
    }
  };

  return (
    <div className="w-80 border-r">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold">All conversations</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading || isSessionLoading
                ? "Loading conversations..."
                : displayConversations.length > 0
                ? `${displayConversations.length} conversations in this session`
                : "No conversations found"}
            </p>
          </div>
          {/* Connection state badge can be added here if needed */}
        </div>
        <Separator className="bg-muted" />
        <ScrollArea className="flex-1">
          {displayConversations.length > 0 ? (
            displayConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full flex flex-col gap-2 py-3 px-4 hover:bg-muted/20 text-left border-b border-border/50",
                  activeConversationId === conversation.id && "bg-muted/20"
                )}
              >
                <div className="flex flex-col min-w-0 w-full">
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm line-clamp-1">
                        {conversation.scenario_name || "Unnamed Scenario"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 w-[4rem] text-right">
                      {formatListTime(
                        conversation.latest_message_timestamp as string
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {conversation.ended_at ||
                    activeConversationsMap.get(conversation.id)?.conversation
                      ?.ended_at ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        Ended
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200"
                      >
                        Active
                      </Badge>
                    )}
                    {activeConversationsMap.get(conversation.id)
                      ?.unreadCount ? (
                      <Badge variant="default" className="text-xs">
                        {
                          activeConversationsMap.get(conversation.id)
                            ?.unreadCount
                        }
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-2">
                No conversations found
              </p>
              <p className="text-sm text-muted-foreground">
                Your conversations will appear here once they become available
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
