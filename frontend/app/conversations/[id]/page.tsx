import { ChatInterface } from "@/components/chat-interface"

export default function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="h-full">
      <ChatInterface conversationId={params.id} />
    </div>
  )
}

