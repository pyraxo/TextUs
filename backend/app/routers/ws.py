import logging
from datetime import datetime
from functools import partial
from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.workflow import resume_chatbot
from app.core.common import parse_uuid
from app.core.db import get_session
from app.core.events import EventType, event_bus
from app.core.security import get_settings, jwt
from app.core.ws_manager import manager
from app.evaluator.eval_types import ChatTranscript
from app.evaluator.evaluator import evaluate_chat_transcript
from app.models.chat import ChatConversation, ChatEvaluation, ChatMessage, MessageType
from app.models.user import User

# Set up logger for websockets with concise formatting
ws_logger = logging.getLogger("websocket")
ws_logger.setLevel(logging.INFO)

router = APIRouter()

# TODO: UPDATE THIS FILE! IT'S REPEATED CODE!


# Register event handlers
async def on_session_completed(data):
    """Handle session completion event"""
    ws_logger.info(f"Session completed: {data['session_id']}")

    # Broadcast to anyone connected to conversations in this session
    for conv in data.get("conversation_ids", []):
        await manager.broadcast_to_conversation(
            {
                "type": "SESSION_COMPLETED",
                "sessionId": data["session_id"],
                "payload": {
                    "id": data["session_id"],
                    "user_id": data["user_id"],
                    "scenario_id": data["scenario_id"],
                    "status": data["status"],
                    "metrics": data["metrics"],
                },
            },
            parse_uuid(conv),
        )


# Subscribe to events
event_bus.subscribe(EventType.SESSION_COMPLETED, on_session_completed)


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

        # Get the user from the database
        user = await session.get(User, parse_uuid(user_id))
        if user is None:
            raise credentials_exception

        return user

    except (jwt.JWTError, Exception) as e:
        ws_logger.error(f"Authentication error: {e}")
        raise credentials_exception from e


async def end_chat(
    session: Annotated[AsyncSession, Depends(get_session)],
    conversation_id: UUID,
    trainee_id: UUID,
):
    """End the chat"""
    conversation_uuid = parse_uuid(conversation_id)
    conversation = await session.get(ChatConversation, conversation_uuid)
    print(f"ENDING CHAT: {conversation_id}")
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Mark conversation as ended
    conversation.ended_at = datetime.now()
    session.add(conversation)

    # Save session_id before committing
    scenario_session_id = conversation.scenario_session_id

    # Commit changes to conversation
    await session.commit()
    await session.refresh(conversation)

    # Broadcast chat end event
    # await manager.broadcast_to_conversation(
    #     {
    #         "type": "END_CHAT",
    #         "conversationId": str(conversation_id),
    #         "payload": {
    #             "id": str(conversation.id),
    #             "scenario_session_id": str(conversation.scenario_session_id),
    #             "trainee_id": str(conversation.trainee_id),
    #             "timestamp": str(conversation.ended_at),
    #         },
    #     },
    #     conversation_uuid,
    # )

    # Get chat transcript for evaluation
    chat_transcript = await session.exec(
        select(ChatMessage).where(ChatMessage.conversation_id == conversation_uuid)
    )

    # Check if evaluation already exists for this conversation
    existing_evaluation = await session.exec(
        select(ChatEvaluation).where(
            ChatEvaluation.conversation_id == conversation_uuid
        )
    )
    existing_evaluation = existing_evaluation.first()

    # Only evaluate if no evaluation exists
    if not existing_evaluation:
        # Evaluate the chat
        evaluation_results = await evaluate_chat_transcript(
            ChatTranscript(text="\n".join([msg.content for msg in chat_transcript]))
        )

        # Save evaluation results
        new_evaluation = ChatEvaluation(
            conversation_id=conversation_uuid,
            trainee_id=conversation.trainee_id,
            session_id=conversation.scenario_session_id,
            evaluation_results=evaluation_results,
        )
        session.add(new_evaluation)
        await session.commit()

        # Ensure all database operations are complete before broadcasting
        await session.refresh(new_evaluation)

    # Create a new session for the broadcast operation
    async with AsyncSession(session.bind) as broadcast_session:
        try:
            # Broadcast chat end event first
            await manager.broadcast_to_conversation(
                {
                    "type": "END_CHAT",
                    "conversationId": str(conversation_id),
                    "payload": {
                        "id": str(conversation.id),
                        "scenario_session_id": str(conversation.scenario_session_id),
                        "trainee_id": str(conversation.trainee_id),
                        "timestamp": str(conversation.ended_at),
                    },
                },
                conversation_uuid,
            )

            # Then broadcast evaluation completed event
            await manager.broadcast_to_conversation(
                {
                    "type": "EVALUATION_COMPLETED",
                    "conversationId": str(conversation_id),
                    "payload": {
                        "evaluation_status": "completed",
                        "conversation_id": str(conversation_id),
                    },
                },
                conversation_uuid,
            )
        except Exception as e:
            ws_logger.error(f"Error broadcasting messages: {e}")

    from app.services.trainee_service import TraineeService

    # Check if all conversations in this session have ended
    trainee_service = TraineeService(session=session)
    await trainee_service.check_session_completion(scenario_session_id)

    return conversation


async def create_message(
    session: Annotated[AsyncSession, Depends(get_session)],
    conversation_id: UUID,
    trainee_id: UUID,
    content: str,
    message_type: str,
) -> dict:
    """Create a message"""
    try:
        # Verify the conversation exists
        conversation_id = parse_uuid(conversation_id)
        trainee_id = parse_uuid(trainee_id)

        conversation = await session.get(ChatConversation, conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        # Create and save the message
        message = ChatMessage(
            conversation_id=conversation_id,
            trainee_id=trainee_id,  # Fixed: don't convert to string here
            content=content,  # Note: field is 'message' not 'content'
            message_type=MessageType(message_type),  # Convert string to enum
        )
        session.add(message)
        await session.commit()
        await session.refresh(message)

        # Serialize message to dict immediately
        message_dict = {
            "id": str(message.id),
            "conversation_id": str(message.conversation_id),
            "trainee_id": str(message.trainee_id),
            "content": message.content,
            "timestamp": str(message.timestamp),
            "message_type": message.message_type.value,
        }

        await broadcast_message(message_dict)

        # Return a formatted response
        return message_dict
    except SQLAlchemyError as e:
        ws_logger.error(
            f"Database error in create_message: {type(e).__name__}: {str(e)}"
        )
        raise


async def broadcast_message(message_dict: dict, user_dict: dict = None):
    """Broadcast a message to all clients in the conversation."""
    print("BROADCASTING MESSAGE")
    message_data = {
        "type": "MESSAGE",
        "conversationId": message_dict["conversation_id"],
        "payload": message_dict,
    }

    if user_dict:
        message_data["user"] = user_dict

    await manager.broadcast_to_conversation(
        message_data, parse_uuid(message_dict["conversation_id"])
    )


@router.websocket("/ws/conversations")
async def websocket_endpoint(
    websocket: WebSocket,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """WebSocket endpoint for conversations"""
    conversation_id = None
    user = None
    try:
        # Authenticate the user before accepting the connection
        user = await get_current_user_ws(websocket, session)

        # Accept the connection only after successful authentication
        await websocket.accept()
        ws_logger.info(f"WebSocket connection accepted for user {user.name}")

        # Serialize user to dict once
        user_dict = {"id": str(user.id), "name": user.name}

        while True:
            # Wait for messages
            data = await websocket.receive_json()
            ws_logger.debug(f"Received WebSocket message: {data}")

            # Extract conversation ID from the message
            conversation_id = parse_uuid(data.get("conversationId"))

            # Connect to the conversation if not already connected
            await manager.connect(websocket, conversation_id)

            # Add user info to the message
            data["user"] = user_dict

            print("DATA: ", data)

            # Handle different message types
            if data["type"] == "END_CHAT":
                # Handle end chat message
                ws_logger.info("Received END_CHAT for conversation %s", conversation_id)
                await end_chat(
                    session=session,
                    conversation_id=conversation_id,
                    trainee_id=user.id,
                )
                continue

            elif data["type"] == "MESSAGE":
                ws_logger.info("Received MESSAGE for conversation %s", conversation_id)
                if data.get("payload", {}).get("action") in [
                    "subscribe",
                    "unsubscribe",
                ]:
                    # Don't broadcast subscription messages
                    continue

                # Create the message in the database for regular messages
                payload = data.get("payload", {})
                ws_logger.info("Payload: %s", payload)
                if payload.get("content") and payload.get("message_type"):
                    message_dict = await create_message(
                        session=session,
                        conversation_id=conversation_id,
                        trainee_id=user.id,
                        content=payload["content"],
                        message_type=payload["message_type"],
                    )
                    # Update the payload with the created message data
                    data["payload"].update(message_dict)

                    # No need to fetch ORM object, just use dict
                    await broadcast_message(message_dict, user_dict)
                    try:
                        if message_dict["message_type"] == MessageType.USER.value:
                            print("LET'S RESUME BABY")
                            await resume_chatbot(
                                session=session,
                                send_message_func=partial(create_message, session),
                                conversation_id=conversation_id,
                                user_message=message_dict["content"],
                                message_id=parse_uuid(message_dict["id"]),
                                end_chat_func=partial(end_chat, session),
                            )
                    except Exception as e:
                        ws_logger.error("Error resuming chatbot: %s", e)
                        continue

            elif data["type"] in ["TYPING", "STATUS_CHANGE"]:
                # Broadcast these messages to everyone including the sender
                await manager.broadcast_to_conversation(
                    data, parse_uuid(conversation_id)
                )

    except WebSocketDisconnect:
        ws_logger.info(
            f"WebSocket disconnected for user {user.name if user else 'unknown'}"
        )
        if conversation_id:
            manager.disconnect(websocket, conversation_id)
    except HTTPException as e:
        ws_logger.error(f"Authentication error: {e.detail}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    except Exception as e:
        print(e)
        ws_logger.error(f"WebSocket error: {type(e).__name__}: {str(e)}")
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()
