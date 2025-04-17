import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizontal } from "lucide-react";

export function ChatInput({
  messageInput,
  setMessageInput,
  onSend,
  disabled,
  connectionState,
  ended,
  readOnly,
}: {
  messageInput: string;
  setMessageInput: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
  connectionState: string;
  ended: boolean;
  readOnly: boolean;
}) {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Button size="icon" variant="ghost" disabled={disabled}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={onSend}
            disabled={
              disabled ||
              connectionState !== "connected" ||
              !messageInput.trim() ||
              ended ||
              readOnly
            }
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
