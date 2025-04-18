"use client";

import { useAuth } from "@/hooks/use-auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Define WebSocket message types
export type WebSocketMessage = {
  type:
    | "MESSAGE"
    | "TYPING"
    | "STATUS_CHANGE"
    | "END_CHAT"
    | "EVALUATION_COMPLETED";
  conversationId: string;
  payload: any;
  timestamp?: string;
};

// Define WebSocket connection states
type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

// Define conversation state type
interface ConversationState {
  isActive: boolean;
  lastSeenMessageId: string | null;
  ended: boolean;
  endedAt: Date;
}

// Define WebSocket context type
type WebSocketContextType = {
  sendMessage: (message: WebSocketMessage) => void;
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  getConversationState: (
    conversationId: string
  ) => ConversationState | undefined;
  markConversationAsRead: (conversationId: string, messageId: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export function WebSocketProvider({
  children,
  readOnly = false,
}: {
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  if (readOnly) {
    // Provide a no-op context
    const noOpContext: WebSocketContextType = {
      sendMessage: () => {},
      connectionState: "disconnected",
      lastMessage: null,
      subscribeToConversation: () => {},
      unsubscribeFromConversation: () => {},
      getConversationState: () => undefined,
      markConversationAsRead: () => {},
    };
    return (
      <WebSocketContext.Provider value={noOpContext}>
        {children}
      </WebSocketContext.Provider>
    );
  }
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [conversationStates, setConversationStates] = useState<
    Map<string, ConversationState>
  >(new Map());
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const activeConversations = useRef<Set<string>>(new Set());

  // Track processed END_CHAT messages to prevent loops
  const processedEndChatMessages = useRef<Set<string>>(new Set());

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    try {
      // Clear any existing connection
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }

      setConnectionState("connecting");

      // Convert HTTP URL to WebSocket URL and use the proper endpoint
      const wsUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, "ws") ||
        "ws://localhost:8000";
      const wsEndpoint = `${wsUrl}/ws/conversations`;

      // Create WebSocket connection
      const ws = new WebSocket(wsEndpoint);
      webSocketRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        console.log("WebSocket connected");
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection

        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
        }

        // Resubscribe to active conversations
        activeConversations.current.forEach((conversationId) => {
          sendMessage({
            type: "MESSAGE",
            conversationId,
            payload: { action: "subscribe" },
            timestamp: new Date().toISOString(),
          });
        });
      };

      ws.onmessage = (event) => {
        try {
          console.log("Raw WebSocket message:", event.data);
          const message = JSON.parse(event.data) as WebSocketMessage;

          console.log("Received packet:", message);
          console.log("Message type:", message.type);
          console.log("Message format check:", {
            hasType: !!message.type,
            hasConversationId: !!message.conversationId,
            hasPayload: !!message.payload,
            hasTimestamp: !!message.timestamp,
            payloadProps: message.payload ? Object.keys(message.payload) : [],
          });

          // Don't process subscription messages
          if (message.type === "MESSAGE" && message.payload?.action) {
            console.log("Skipping subscription message");
            return;
          }

          // Set last message immediately for non-subscription messages
          setLastMessage(message);
          console.log("Set lastMessage:", message);

          if (message.type === "END_CHAT") {
            console.log("Processing END_CHAT in WebSocket provider", {
              conversationId: message.conversationId,
              payload: message.payload,
            });

            // Create a unique ID for this END_CHAT message
            const messageId = `end_chat_${message.conversationId}_${
              message.payload?.timestamp || Date.now()
            }`;

            // Skip if we've already processed this exact END_CHAT message
            if (processedEndChatMessages.current.has(messageId)) {
              console.log("Skipping duplicate END_CHAT message", messageId);
              return;
            }

            // Mark this message as processed
            processedEndChatMessages.current.add(messageId);

            // Limit the size of our tracking set to prevent memory leaks
            if (processedEndChatMessages.current.size > 100) {
              const oldestEntries = Array.from(
                processedEndChatMessages.current
              ).slice(0, 50);
              oldestEntries.forEach((id) =>
                processedEndChatMessages.current.delete(id)
              );
            }

            setConversationStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(message.conversationId);
              console.log("Current conversation state:", state);

              if (state) {
                const updatedState = {
                  ...state,
                  ended: true,
                  endedAt: new Date(message.payload.timestamp),
                };
                console.log("Updated conversation state:", updatedState);
                newStates.set(message.conversationId, updatedState);
              } else {
                console.log("Creating new ended conversation state");
                // If we don't have a state yet, create one
                newStates.set(message.conversationId, {
                  isActive: false,
                  lastSeenMessageId: null,
                  ended: true,
                  endedAt: new Date(message.payload.timestamp),
                });
              }

              return newStates;
            });
          }

          // Update conversation state if it's a message
          if (
            message.type === "MESSAGE" &&
            message.payload &&
            !message.payload.action
          ) {
            console.log("Updating conversation state for message:", message);
            setConversationStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(message.conversationId);
              if (state) {
                newStates.set(message.conversationId, {
                  ...state,
                  lastSeenMessageId: message.payload.id,
                });
              }
              return newStates;
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionState("disconnected");
        webSocketRef.current = null;
        // Only reconnect if not ended and not a clean closure
        const endedConvos = Array.from(conversationStates.values()).filter(
          (s) => s.ended
        );
        if (!event.wasClean && user && endedConvos.length === 0) {
          const delay = calculateReconnectDelay();
          console.log(`Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        } else {
          console.log(
            "WebSocket closed for ended conversation or clean closure, not reconnecting."
          );
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("error");
        // Only close/reconnect if not ended
        const endedConvos = Array.from(conversationStates.values()).filter(
          (s) => s.ended
        );
        if (endedConvos.length === 0 && webSocketRef.current) {
          webSocketRef.current.close();
        } else {
          console.log(
            "WebSocket error for ended conversation, not reconnecting."
          );
        }
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setConnectionState("error");

      // Only attempt to reconnect if user is logged in
      if (user) {
        const delay = calculateReconnectDelay();
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      }
    }
  };

  // Calculate reconnection delay with exponential backoff
  const calculateReconnectDelay = () => {
    const maxDelay = 30000; // Maximum delay of 30 seconds
    const baseDelay = 1000; // Start with 1 second
    const retries = reconnectAttempts.current;
    reconnectAttempts.current += 1;

    // Exponential backoff with maximum delay
    return Math.min(baseDelay * Math.pow(2, retries), maxDelay);
  };

  // Keep track of reconnection attempts
  const reconnectAttempts = useRef(0);

  // Initialize connection when user is authenticated
  useEffect(() => {
    if (user) {
      connectWebSocket();
    } else {
      // Clean up connection if user logs out
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      setConnectionState("disconnected");
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [user]);

  // Send message through WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    // Prevent sending messages to ended conversations
    const state = getConversationState(message.conversationId);
    if (state && state.ended) {
      console.warn(
        `Not sending message to ended conversation: ${message.conversationId}`
      );
      return;
    }
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected, attempting to reconnect...");
      // Attempt to reconnect
      connectWebSocket();
      // Store the message to be sent after reconnection
      const retryInterval = setInterval(() => {
        if (webSocketRef.current?.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(JSON.stringify(message));
          clearInterval(retryInterval);
        }
      }, 1000);
      // Clear the interval after 5 seconds if still not connected
      setTimeout(() => clearInterval(retryInterval), 5000);
    }
  };

  // Subscribe to a conversation
  const subscribeToConversation = (conversationId: string) => {
    const state = getConversationState(conversationId);
    if (state && state.ended) {
      console.warn(`Not subscribing to ended conversation: ${conversationId}`);
      return;
    }
    activeConversations.current.add(conversationId);
    setConversationStates((prev) => {
      const newStates = new Map(prev);
      const existingState = newStates.get(conversationId);
      if (existingState) {
        newStates.set(conversationId, {
          ...existingState,
          isActive: true,
        });
      } else {
        newStates.set(conversationId, {
          isActive: true,
          lastSeenMessageId: null,
          ended: false,
          endedAt: new Date(0),
        });
      }
      return newStates;
    });
    if (connectionState === "connected") {
      sendMessage({
        type: "MESSAGE",
        conversationId,
        payload: { action: "subscribe" },
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Unsubscribe from a conversation
  const unsubscribeFromConversation = (conversationId: string) => {
    activeConversations.current.delete(conversationId);

    setConversationStates((prev) => {
      const newStates = new Map(prev);
      const state = newStates.get(conversationId);
      if (state) {
        newStates.set(conversationId, {
          ...state,
          isActive: false,
        });
      }
      return newStates;
    });

    if (connectionState === "connected") {
      sendMessage({
        type: "MESSAGE",
        conversationId,
        payload: { action: "unsubscribe" },
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Get conversation state
  const getConversationState = (conversationId: string) => {
    return conversationStates.get(conversationId);
  };

  // Mark conversation as read
  const markConversationAsRead = (
    conversationId: string,
    messageId: string
  ) => {
    setConversationStates((prev) => {
      const newStates = new Map(prev);
      const state = newStates.get(conversationId);
      if (state) {
        newStates.set(conversationId, {
          ...state,
          lastSeenMessageId: messageId,
        });
      }
      return newStates;
    });
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        connectionState,
        lastMessage,
        subscribeToConversation,
        unsubscribeFromConversation,
        getConversationState,
        markConversationAsRead,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
