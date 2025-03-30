from typing import Dict
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """Manage active connections for WebSocket endpoints."""

    def __init__(self):
        # conversation_id -> set of WebSocket connections
        self.active_connections: Dict[UUID, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: UUID):
        """Add connection"""
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = set()
        self.active_connections[conversation_id].add(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: UUID):
        """Remove connection"""
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].discard(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast_to_conversation(self, message: dict, conversation_id: UUID):
        """Broadcast message to connection"""
        if conversation_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[conversation_id]:
                try:
                    await connection.send_json(message)
                except WebSocketDisconnect:
                    disconnected.add(connection)
                except Exception as e:
                    print(f"Error broadcasting message: {e}")
                    disconnected.add(connection)

            # Clean up disconnected clients
            for connection in disconnected:
                self.disconnect(connection, conversation_id)


# Global instance
manager = ConnectionManager()
