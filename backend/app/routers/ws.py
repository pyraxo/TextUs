from typing import Annotated, Dict
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.core.security import get_settings, jwt
from app.models.chat import ChatConversation, ChatMessage, MessageType
from app.models.user import User

router = APIRouter()


# Store active connections
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


manager = ConnectionManager()


async def get_current_user_ws(
    websocket: WebSocket,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Get the current user from the WebSocket connection."""
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        # Get the cookie from the WebSocket connection
        cookies = dict(websocket.cookies)
        access_token = cookies.get("access_token")

        if not access_token:
            raise credentials_exception

        # Remove "Bearer " prefix if it exists
        if access_token.startswith("Bearer "):
            access_token = access_token[7:]

        # Decode and validate the JWT token
        payload = jwt.decode(
            access_token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Get the user from the database
        user = await session.get(User, UUID(user_id))
        if user is None:
            raise credentials_exception

        return user

    except (jwt.JWTError, Exception) as e:
        print(f"Authentication error: {e}")
        raise credentials_exception from e


async def create_message(
    session: Annotated[AsyncSession, Depends(get_session)],
    conversation_id: UUID,
    user_id: UUID,
    content: str,
    message_type: str,
) -> dict:
    """Create a message"""
    # Verify the conversation exists
    conversation = await session.get(ChatConversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Create and save the message
    message = ChatMessage(
        conversation_id=conversation_id,
        sender_id=str(user_id),  # Convert UUID to string as per schema
        message=content,  # Note: field is 'message' not 'content'
        message_type=MessageType(message_type),  # Convert string to enum
    )
    session.add(message)
    await session.commit()
    await session.refresh(message)

    # Return a formatted response
    return {
        "id": str(message.id),
        "conversation_id": str(message.conversation_id),
        "sender_id": message.sender_id,
        "content": message.message,
        "timestamp": str(message.timestamp),
        "message_type": message.message_type.value,
    }


async def broadcast_message(message: ChatMessage, user: User = None):
    """Broadcast a message to all clients in the conversation."""
    message_data = {
        "type": "MESSAGE",
        "conversationId": str(message.conversation_id),
        "payload": {
            "id": str(message.id),
            "conversation_id": str(message.conversation_id),
            "sender_id": message.sender_id,
            "content": message.message,
            "timestamp": str(message.timestamp),
            "message_type": message.message_type.value,
        },
    }

    if user:
        message_data["user"] = {
            "id": str(user.id),
            "name": user.name,
        }

    await manager.broadcast_to_conversation(message_data, message.conversation_id)


@router.websocket("/ws/conversations")
async def websocket_endpoint(
    websocket: WebSocket,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """WebSocket endpoint for conversations"""
    conversation_id = None
    try:
        # Authenticate the user before accepting the connection
        user = await get_current_user_ws(websocket, session)

        # Accept the connection only after successful authentication
        await websocket.accept()
        print(f"WebSocket connection accepted for user {user.name}")

        while True:
            # Wait for messages
            data = await websocket.receive_json()
            print(f"Received WebSocket message: {data}")

            # Extract conversation ID from the message
            conversation_id = UUID(data.get("conversationId"))

            # Connect to the conversation if not already connected
            await manager.connect(websocket, conversation_id)

            # Add user info to the message
            data["user"] = {
                "id": str(user.id),
                "name": user.name,
            }

            # Handle different message types
            if data["type"] == "MESSAGE":
                if data.get("payload", {}).get("action") in [
                    "subscribe",
                    "unsubscribe",
                ]:
                    # Don't broadcast subscription messages
                    continue

                # Create the message in the database for regular messages
                payload = data.get("payload", {})
                if payload.get("content") and payload.get("message_type"):
                    try:
                        message_data = await create_message(
                            session,
                            conversation_id,
                            user.id,
                            payload["content"],
                            payload["message_type"],
                        )
                        # Update the payload with the created message data
                        data["payload"].update(message_data)

                        # Get the created message object for broadcasting
                        message = await session.get(
                            ChatMessage, UUID(message_data["id"])
                        )
                        if message:
                            # Broadcast the message to all clients in the conversation
                            await broadcast_message(message, user)
                    except Exception as e:
                        print(f"Error creating message: {e}")
                        continue

            elif data["type"] in ["TYPING", "STATUS_CHANGE"]:
                # Broadcast these messages to everyone including the sender
                await manager.broadcast_to_conversation(data, conversation_id)

    except WebSocketDisconnect:
        print(
            f"WebSocket disconnected for user {user.name if 'user' in locals() else 'unknown'}"
        )
        if conversation_id:
            manager.disconnect(websocket, conversation_id)
    except HTTPException as e:
        print(f"Authentication error: {e.detail}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()
