"use client";

import { useAuth } from "@/hooks/use-auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Define WebSocket message types
export type WebSocketMessage = {
  type: "MESSAGE" | "TYPING" | "STATUS_CHANGE";
  conversationId: string;
  payload: any;
  timestamp: string;
};

// Define WebSocket connection states
type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

// Define conversation state type
interface ConversationState {
  isActive: boolean;
  lastSeenMessageId: string | null;
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

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const activeConversations = useRef<Set<string>>(new Set());
  const conversationStates = useRef<Map<string, ConversationState>>(new Map());

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
          const message = JSON.parse(event.data) as WebSocketMessage;

          // Update conversation state if it's a message
          if (
            message.type === "MESSAGE" &&
            message.payload &&
            !message.payload.action
          ) {
            const state = conversationStates.current.get(
              message.conversationId
            );
            if (state) {
              state.lastSeenMessageId = message.payload.id;
            }
          }

          setLastMessage(message);
          console.log("Received message:", message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionState("disconnected");
        webSocketRef.current = null;

        // Don't attempt to reconnect if it was a clean closure or user is not logged in
        if (!event.wasClean && user) {
          const delay = calculateReconnectDelay();
          console.log(`Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("error");

        // Close the connection on error to trigger reconnect
        if (webSocketRef.current) {
          webSocketRef.current.close();
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
    activeConversations.current.add(conversationId);
    // Initialize or update conversation state
    conversationStates.current.set(conversationId, {
      isActive: true,
      lastSeenMessageId: null,
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
    // Update conversation state
    const state = conversationStates.current.get(conversationId);
    if (state) {
      state.isActive = false;
    }

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
    return conversationStates.current.get(conversationId);
  };

  // Mark conversation as read
  const markConversationAsRead = (
    conversationId: string,
    messageId: string
  ) => {
    const state = conversationStates.current.get(conversationId);
    if (state) {
      state.lastSeenMessageId = messageId;
    }
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
