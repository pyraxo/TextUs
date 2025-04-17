import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation, Message, MessageType } from "@/types/conversations.d";

export function ConversationView({
  conversation,
  messages,
  formatMessageTime,
}: {
  conversation: Conversation | null;
  messages: Message[];
  formatMessageTime: (dateString: string) => string;
}) {
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a conversation from the list to start chatting
          </p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((msg, index) => {
          const messageContents =
            msg.message_type === MessageType.BOT
              ? msg.content.split("\n\n").filter((content) => content.trim())
              : [msg.content];
          return messageContents.map((content, contentIndex) => (
            <div
              key={`${msg.id || index}-${contentIndex}`}
              className={`flex ${
                msg.message_type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.message_type === "user"
                    ? "bg-cpf-light-teal text-primary-foreground"
                    : "bg-card shadow-sm"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-medium ${
                      msg.message_type === "user"
                        ? "text-foreground"
                        : "text-card-foreground"
                    }`}
                  >
                    {msg.message_type === "user" ? "You" : "Customer"}
                  </span>
                  <span
                    className={`text-xs opacity-70 ${
                      msg.message_type === "user"
                        ? "text-foreground"
                        : "text-card-foreground"
                    }`}
                  >
                    {formatMessageTime(new Date(msg.timestamp).toISOString())}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    msg.message_type === "user"
                      ? "text-foreground"
                      : "text-card-foreground"
                  }`}
                >
                  {content}
                </p>
              </div>
            </div>
          ));
        })}
      </div>
    </ScrollArea>
  );
}
