"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useConversations } from "@/hooks/use-conversations";
import { getConversation } from "@/lib/api/conversations";
import { useWebSocket } from "@/lib/providers/websocket-provider";
import { cn } from "@/lib/utils";
import {
  Conversation,
  Message,
  MessageType,
  type ConversationResponse,
} from "@/types/conversations.d";
import { Filter, Paperclip, SendHorizontal, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function ConversationsInterface() {
  // Conversation list state
  const { data: conversations, isLoading, error, mutate } = useConversations();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const lastRefreshTimeRef = useRef<number>(0);

  // Active conversation states
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeConversations, setActiveConversations] = useState<
    Map<
      string,
      {
        messages: Message[];
        conversation: Conversation | null;
        unreadCount: number;
      }
    >
  >(new Map());

  // Message input state
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth and WebSocket
  const { user } = useAuth();
  const {
    sendMessage: sendWebSocketMessage,
    lastMessage,
    connectionState,
    subscribeToConversation,
    unsubscribeFromConversation,
    getConversationState,
    markConversationAsRead,
  } = useWebSocket();

  // Load conversation data when selected
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        const data: ConversationResponse = await getConversation(
          conversationId
        );

        // Calculate latest message timestamp
        const latestMessageTimestamp =
          data.messages.length > 0
            ? data.messages[data.messages.length - 1].timestamp
            : data.conversation.started_at;

        setActiveConversations((prev) => {
          const newMap = new Map(prev);
          newMap.set(conversationId, {
            messages: data.messages,
            conversation: {
              ...data.conversation,
              latest_message_timestamp: latestMessageTimestamp,
            },
            unreadCount: 0,
          });
          return newMap;
        });

        // Subscribe to conversation and mark latest message as read
        subscribeToConversation(conversationId);
        if (data.messages.length > 0) {
          markConversationAsRead(
            conversationId,
            data.messages[data.messages.length - 1].id
          );
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast.error("Failed to load conversation. Please try again.");
      }
    },
    [subscribeToConversation, markConversationAsRead]
  );

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      if (!activeConversations.has(conversationId)) {
        loadConversation(conversationId);
      } else {
        // Reset unread count and mark latest message as read
        setActiveConversations((prev) => {
          const newMap = new Map(prev);
          const conv = newMap.get(conversationId);
          if (conv) {
            conv.unreadCount = 0;
            newMap.set(conversationId, conv);
            if (conv.messages.length > 0) {
              markConversationAsRead(
                conversationId,
                conv.messages[conv.messages.length - 1].id
              );
            }
          }
          return newMap;
        });
      }
    },
    [activeConversations, loadConversation, markConversationAsRead]
  );

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    const { conversationId } = lastMessage;

    if (
      lastMessage.type === "MESSAGE" &&
      lastMessage.payload &&
      !lastMessage.payload.action
    ) {
      const newMessage: Message = {
        id: lastMessage.payload.id,
        content: lastMessage.payload.content,
        message_type: lastMessage.payload.message_type as MessageType,
        timestamp: lastMessage.payload.timestamp,
      };

      setActiveConversations((prev) => {
        const newMap = new Map(prev);
        const conv = newMap.get(conversationId);
        if (conv) {
          // Check if message with this ID already exists
          const messageExists = conv.messages.some(
            (msg) => msg.id === newMessage.id
          );
          if (!messageExists) {
            conv.messages = [...conv.messages, newMessage];
            // Increment unread count if not the active conversation
            if (conversationId !== activeConversationId) {
              conv.unreadCount += 1;
            } else {
              // Mark message as read if it's the active conversation
              markConversationAsRead(conversationId, newMessage.id);
            }
          }
          newMap.set(conversationId, conv);
        }
        return newMap;
      });

      // Refresh conversation list to update latest message
      debouncedRefresh();
    }
  }, [lastMessage, activeConversationId, markConversationAsRead]);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 2000) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        mutate();
        lastRefreshTimeRef.current = Date.now();
      }, 2000 - (now - lastRefreshTimeRef.current));
      return;
    }
    mutate();
    lastRefreshTimeRef.current = now;
  }, [mutate]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversations]);

  // Format time for messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format time for conversation list
  const formatListTime = (dateString: string) => {
    try {
      if (!dateString) return "Unknown time";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Unknown time";
      }

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
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Unknown time";
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversationId) return;

    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    const wsMessage = {
      type: "MESSAGE" as const,
      conversationId: activeConversationId,
      payload: {
        content: messageInput.trim(),
        message_type: MessageType.USER,
        sender_id: user.id,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    sendWebSocketMessage(wsMessage);
    setMessageInput("");
  };

  // Loading state
  if (isLoading) {
    return <ConversationsLoading />;
  }

  // Error state
  if (error) {
    return <ConversationsError error={error} />;
  }

  const displayConversations = conversations || [];
  const activeConversation = activeConversationId
    ? activeConversations.get(activeConversationId)
    : null;

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-80 border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-xl font-semibold">All conversations</h2>
              <p className="text-sm text-muted-foreground">
                You have {displayConversations.length} conversations
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connectionState !== "connected" ? (
                <Badge variant="outline" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Online</span>
                </Badge>
              )}
              {/* <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
          <Separator className="bg-muted" />
          <ScrollArea className="flex-1">
            {displayConversations.length > 0 ? (
              displayConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={cn(
                    "w-full flex flex-col gap-1 py-3 px-4 hover:bg-muted/20 text-left",
                    activeConversationId === conversation.id && "bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {conversation.scenario_name || "Unnamed Scenario"}
                      </span>
                      {activeConversations.get(conversation.id)?.unreadCount ? (
                        <Badge variant="default">
                          {
                            activeConversations.get(conversation.id)
                              ?.unreadCount
                          }
                        </Badge>
                      ) : null}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatListTime(conversation.latest_message_timestamp)}
                    </span>
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

      {/* Chat Interface */}
      <div className="flex-1">
        {activeConversation ? (
          <div className="flex h-full flex-col">
            <div className="p-4">
              <h2 className="font-semibold">
                {activeConversation.conversation?.scenario_name || "Customer"}
              </h2>
              {connectionState !== "connected" && (
                <p className="text-sm text-yellow-500">Reconnecting...</p>
              )}
            </div>
            <Separator className="bg-muted" />
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeConversation.messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.message_type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.message_type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-sm font-medium ${
                            msg.message_type === "user"
                              ? "text-foreground"
                              : "text-primary-foreground"
                          }`}
                        >
                          {msg.message_type === "user" ? "You" : "Customer"}
                        </span>
                        <span
                          className={`text-xs opacity-70 ${
                            msg.message_type === "user"
                              ? "text-foreground"
                              : "text-primary-foreground"
                          }`}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          msg.message_type === "user"
                            ? "text-foreground"
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
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
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
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={
                      connectionState !== "connected" || !messageInput.trim()
                    }
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationsLoading() {
  return (
    <div className="flex h-full">
      <div className="w-80 border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <div>
              <Skeleton className="h-7 w-[200px]" />
              <Skeleton className="h-5 w-[150px] mt-1" />
            </div>
            <Skeleton className="h-9 w-9" />
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
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-7 w-[250px] mx-auto" />
          <Skeleton className="h-5 w-[200px] mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}

function ConversationsError({ error }: { error: Error }) {
  const isConnectionError =
    error.message.includes("connect") ||
    error.message.includes("network") ||
    error.message.includes("failed");

  return (
    <div className="flex h-full">
      <div className="w-80 border-r">
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
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No conversation selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    </div>
  );
}
