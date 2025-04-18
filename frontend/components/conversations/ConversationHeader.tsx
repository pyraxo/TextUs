import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

export function ConversationHeader({
  scenarioName,
  ended,
  endedAt,
  onEndChat,
  showEndChat,
  connectionState,
  readOnly,
}: {
  scenarioName: string | null | undefined;
  ended: boolean;
  endedAt?: Date | string | null;
  onEndChat?: () => void;
  showEndChat?: boolean;
  connectionState?: string;
  readOnly?: boolean;
}) {
  // Format time for endedAt
  const formatMessageTime = (dateString?: string | Date | null) => {
    if (!dateString) return null;
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="pl-4 pr-4 pt-4 flex items-center justify-between">
        <h2 className="font-semibold">{scenarioName || "Customer"}</h2>
        {showEndChat && !readOnly && !ended && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEndChat}
            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 mr-10"
          >
            <X className="h-4 w-4" />
            End Chat
          </Button>
        )}
      </div>
      {ended && (
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <span className="pl-4">Chat ended</span>
          {endedAt && (
            <time
              dateTime={
                typeof endedAt === "string" ? endedAt : endedAt?.toISOString()
              }
            >
              {formatMessageTime(endedAt)}
            </time>
          )}
        </div>
      )}
      {connectionState !== "connected" && !readOnly && (
        <p className="text-sm text-yellow-500 ml-4">Reconnecting...</p>
      )}
      <Separator className="bg-muted mt-2 w-full" />
    </div>
  );
}
