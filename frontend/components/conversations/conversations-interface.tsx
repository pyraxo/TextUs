"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useActiveSessionConversations } from "@/hooks/use-session-conversations";
import { getConversation } from "@/lib/api/conversations";
import { useWebSocket } from "@/lib/providers/websocket-provider";
import {
  Conversation,
  Message,
  MessageType,
  type ConversationResponse,
} from "@/types/conversations.d";
import { useQueryClient } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationsList } from "./ConversationsList";
import { ConversationView } from "./ConversationView";
import { TrainerFeedbackSection } from "./TrainerFeedbackSection";

export function ConversationsInterface({
  activeSessionId,
  onConversationSelect,
  readOnly = false,
  onTrainerFeedback,
}: {
  activeSessionId: string;
  onConversationSelect?: (conversationId: string) => void;
  readOnly?: boolean;
  onTrainerFeedback?: (feedback: string | null) => void;
}) {
  // Conversation list state
  const {
    data: conversations,
    isLoading,
    error,
    mutate,
    activeSession,
    isSessionLoading,
  } = useActiveSessionConversations(activeSessionId);
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
  } = readOnly
    ? {
        sendMessage: () => {},
        lastMessage: null,
        connectionState: "offline",
        subscribeToConversation: () => {},
        unsubscribeFromConversation: () => {},
        getConversationState: () => null,
        markConversationAsRead: () => {},
      }
    : useWebSocket();

  // Get conversation state for active conversation
  const activeConversationState = activeConversationId
    ? getConversationState(activeConversationId)
    : null;

  // Loading state
  const [isEndChatDialogOpen, setIsEndChatDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Load conversation data when selected
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        const data: ConversationResponse = await getConversation(
          conversationId
        );

        // Get the current state from the WebSocket provider
        const conversationState = getConversationState(conversationId);

        // Calculate latest message timestamp
        const latestMessageTimestamp = new Date(
          data.messages.length > 0
            ? data.messages[data.messages.length - 1].timestamp
            : data.conversation.started_at
        );

        setActiveConversations((prev) => {
          const newMap = new Map(prev);
          newMap.set(conversationId, {
            messages: data.messages,
            conversation: {
              ...data.conversation,
              // If WebSocket says it's ended but API doesn't yet, trust WebSocket
              ended_at: conversationState?.ended
                ? conversationState.endedAt
                : data.conversation.ended_at,
              latest_message_timestamp: latestMessageTimestamp.toISOString(),
            },
            unreadCount: 0,
          });
          return newMap;
        });

        // Ensure trainer feedback is updated in parent after loading
        if (onTrainerFeedback) {
          onTrainerFeedback(data.conversation.trainer_feedback || null);
        }

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
    [
      subscribeToConversation,
      markConversationAsRead,
      getConversationState,
      onTrainerFeedback,
    ]
  );

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      console.log("Selecting conversation:", conversationId);
      console.log(
        "Conversation state from WebSocket:",
        getConversationState(conversationId)
      );

      setActiveConversationId(conversationId);
      // Call the onConversationSelect callback if provided
      if (onConversationSelect) {
        onConversationSelect(conversationId);
      }

      // If onTrainerFeedback is provided, pass the trainer_feedback for this conversation (if loaded)
      const conv = activeConversations.get(conversationId);
      if (onTrainerFeedback) {
        onTrainerFeedback(conv?.conversation?.trainer_feedback || null);
      }

      if (!activeConversations.has(conversationId)) {
        console.log("Loading conversation for the first time");
        loadConversation(conversationId);
      } else {
        console.log(
          "Conversation already loaded:",
          activeConversations.get(conversationId)
        );
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
    [
      activeConversations,
      loadConversation,
      markConversationAsRead,
      onConversationSelect,
      onTrainerFeedback,
    ]
  );

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    console.log("ConversationsInterface received WebSocket message:", {
      type: lastMessage.type,
      conversationId: lastMessage.conversationId,
      payload: lastMessage.payload,
      activeConversationId,
      hasConversation: activeConversations.has(lastMessage.conversationId),
    });

    const { conversationId } = lastMessage;

    if (lastMessage.type === "END_CHAT") {
      console.log("END_CHAT received for conversation:", conversationId);
      const timestamp = new Date(lastMessage.payload.timestamp);

      // Update active conversations map with ended state
      setActiveConversations((prev) => {
        const newMap = new Map(prev);
        const conv = newMap.get(conversationId);
        if (conv && conv.conversation) {
          console.log("Updating conversation ended state:", {
            conversationId,
            timestamp: timestamp.toISOString(),
            previousState: conv.conversation.ended_at?.toISOString() || null,
          });

          newMap.set(conversationId, {
            ...conv,
            conversation: {
              ...conv.conversation,
              ended_at: timestamp,
              latest_message_timestamp: timestamp.toISOString(),
            },
          });
        }
        return newMap;
      });

      // Clear the active session in the query cache when receiving END_CHAT
      if (user?.id) {
        console.log(
          "Clearing active session in query cache from WebSocket message"
        );
        queryClient.setQueryData(["active-session", user.id], null);
      }

      // Trigger a refresh of the conversations list to sync with server
      debouncedRefresh();
      return;
    }

    if (
      lastMessage.type === "MESSAGE" &&
      lastMessage.payload &&
      !lastMessage.payload.action
    ) {
      console.log("Processing new message:", {
        messageId: lastMessage.payload.id,
        content: lastMessage.payload.content,
        type: lastMessage.payload.message_type,
      });

      const newMessage: Message = {
        id: lastMessage.payload.id,
        content: lastMessage.payload.content,
        message_type: lastMessage.payload.message_type as MessageType,
        timestamp: new Date(lastMessage.payload.timestamp),
      };

      // If we don't have the conversation loaded yet, load it first
      if (!activeConversations.has(conversationId)) {
        console.log(
          "New message for unloaded conversation, loading:",
          conversationId
        );
        loadConversation(conversationId);
        return;
      }

      setActiveConversations((prev) => {
        console.log("Updating active conversations with new message");
        const newMap = new Map(prev);
        const conv = newMap.get(conversationId);

        if (!conv) {
          console.log("No conversation found for:", conversationId);
          return prev;
        }

        // Check if message with this ID already exists
        const messageExists = conv.messages.some(
          (msg) => msg.id === newMessage.id
        );

        if (!messageExists) {
          console.log("Adding new message to conversation:", newMessage);
          const updatedMessages = [...conv.messages, newMessage];
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            unreadCount:
              conversationId !== activeConversationId
                ? (conv.unreadCount || 0) + 1
                : 0,
            conversation: conv.conversation
              ? {
                  ...conv.conversation,
                  latest_message_timestamp: new Date(
                    newMessage.timestamp
                  ).toISOString(),
                }
              : null,
          };

          newMap.set(conversationId, updatedConv);
          console.log("Updated conversation state:", updatedConv);

          // Mark as read if it's the active conversation
          if (conversationId === activeConversationId) {
            markConversationAsRead(conversationId, newMessage.id);
          }
        } else {
          console.log("Message already exists, skipping:", newMessage.id);
        }

        return newMap;
      });
    }
  }, [
    lastMessage,
    activeConversationId,
    markConversationAsRead,
    loadConversation,
    queryClient,
    user?.id,
  ]);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    if (timeSinceLastRefresh < 2000) {
      // Clear any pending refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Schedule a new refresh
      refreshTimeoutRef.current = setTimeout(() => {
        // Just trigger a refresh - the sorting will be handled in the component render
        mutate();
        lastRefreshTimeRef.current = Date.now();
      }, 2000 - timeSinceLastRefresh);

      return;
    }

    // If enough time has passed, refresh immediately
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
        trainee_id: user.id,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Sending WebSocket message:", wsMessage);

    sendWebSocketMessage(wsMessage);
    setMessageInput("");
  };

  // Handle ending a chat
  const handleEndChat = () => {
    if (!activeConversationId) return;

    console.log("Ending chat for conversation:", activeConversationId);
    const timestamp = new Date();

    // Send end chat message via WebSocket
    const endChatMessage = {
      type: "END_CHAT" as const,
      conversationId: activeConversationId,
      payload: {
        timestamp: timestamp.toISOString(),
      },
    };

    // Update local state immediately to reflect ended status
    setActiveConversations((prev) => {
      const newMap = new Map(prev);
      const conv = newMap.get(activeConversationId);
      if (conv && conv.conversation) {
        console.log("Updating local state for ended chat:", {
          conversationId: activeConversationId,
          timestamp: timestamp.toISOString(),
        });

        newMap.set(activeConversationId, {
          ...conv,
          conversation: {
            ...conv.conversation,
            ended_at: timestamp,
            latest_message_timestamp: timestamp.toISOString(),
          },
        });
      }
      return newMap;
    });

    // Clear the active session in the query cache
    if (user?.id) {
      console.log("Clearing active session in query cache");
      queryClient.setQueryData(["active-session", user.id], null);
    }

    // Send the WebSocket message after updating local state
    sendWebSocketMessage(endChatMessage);

    // Trigger a refresh of the conversations list to sync with server
    debouncedRefresh();

    setIsEndChatDialogOpen(false);
    toast.success("Chat ended successfully");
  };

  // Determine if user is a trainer
  const isTrainer =
    user?.user_type === "trainer" || user?.user_type === "admin";

  // Loading state
  if (isLoading) {
    return <ConversationsLoading />;
  }

  // Error state
  if (error) {
    return <ConversationsError error={error} />;
  }

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
  const activeConversation = activeConversationId
    ? activeConversations.get(activeConversationId)
    : null;

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-80 border-r">
        <ConversationsList
          conversations={displayConversations}
          activeConversationId={activeConversationId}
          onSelect={handleConversationSelect}
          activeConversationsMap={activeConversations}
          isLoading={isLoading}
          isSessionLoading={isSessionLoading}
          connectionState={connectionState}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversation ? (
          <>
            <ConversationHeader
              scenarioName={activeConversation.conversation?.scenario_name}
              ended={
                !!activeConversationState?.ended ||
                !!activeConversation.conversation?.ended_at
              }
              endedAt={
                activeConversationState?.ended
                  ? activeConversationState.endedAt
                  : activeConversation.conversation?.ended_at
              }
              onEndChat={handleEndChat}
              showEndChat={
                !readOnly &&
                !(
                  activeConversationState?.ended ||
                  activeConversation.conversation?.ended_at
                )
              }
              connectionState={connectionState}
              readOnly={readOnly}
            />
            <ConversationView
              conversation={activeConversation.conversation}
              messages={activeConversation.messages}
              formatMessageTime={formatMessageTime}
            />
            {/* Input area: ChatInput for trainees, TrainerFeedbackSection for trainers on completed convos */}
            {(() => {
              const isEnded =
                !!activeConversationState?.ended ||
                !!activeConversation.conversation?.ended_at;
              // 1. Trainee view: show chat textarea if ongoing
              if (!readOnly && !isEnded) {
                return (
                  <ChatInput
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    onSend={handleSendMessage}
                    disabled={
                      readOnly ||
                      !!activeConversationState?.ended ||
                      !!activeConversation.conversation?.ended_at
                    }
                    connectionState={connectionState}
                    ended={
                      !!activeConversationState?.ended ||
                      !!activeConversation.conversation?.ended_at
                    }
                    readOnly={readOnly}
                  />
                );
              }
              // 2. Trainee view: show ended message if ended
              if (!readOnly && isEnded) {
                return (
                  <div className="flex gap-2 p-4 border-t">
                    <div className="flex flex-col w-full gap-2">
                      <p className="text-sm text-muted-foreground">
                        This conversation has ended
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/practice")}
                        className="w-full"
                      >
                        Restart with New Scenario
                      </Button>
                    </div>
                  </div>
                );
              }
              // 3. Trainer session view: show feedback if ended
              if (readOnly && isTrainer && isEnded) {
                return (
                  <TrainerFeedbackSection
                    conversationId={activeConversationId!}
                    sessionId={activeSessionId}
                    user={user}
                    initialFeedback={
                      activeConversation.conversation?.trainer_feedback || ""
                    }
                    onFeedbackSaved={(feedback) => {
                      setActiveConversations((prev) => {
                        const newMap = new Map(prev);
                        const conv = newMap.get(activeConversationId!);
                        if (conv && conv.conversation) {
                          newMap.set(activeConversationId!, {
                            ...conv,
                            conversation: {
                              ...conv.conversation,
                              trainer_feedback: feedback,
                            },
                          });
                        }
                        return newMap;
                      });
                      if (onTrainerFeedback) {
                        onTrainerFeedback(feedback);
                      }
                    }}
                  />
                );
              }
              // 4. All other cases: show nothing
              return null;
            })()}
          </>
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

  const isSessionError =
    error.message.includes("session") || error.message.includes("not found");

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
            {isSessionError ? (
              <>
                <p>Session not found or expired.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please start a new scenario session.
                </p>
              </>
            ) : isConnectionError ? (
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
