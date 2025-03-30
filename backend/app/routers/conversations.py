from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.chatter.scheduler import get_scheduler
from app.models.chat import MessageType
from app.models.response import (
    ConversationDetailResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
)
from app.services.conversations import ConversationService

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/", response_model=List[ConversationListResponse])
async def get_conversations(
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Get all conversations."""
    conv_list = await conversation_service.get_conversations()
    # Transform to include scenario name and latest message timestamp
    return [
        {
            "id": conv.id,
            "scenario_id": conv.scenario_id,
            "customer_id": conv.customer_id,
            "started_at": conv.started_at.isoformat(),
            "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
            "scenario_name": conv.scenario_customer.name
            if conv.scenario_customer
            else None,
            "latest_message_timestamp": max(
                (msg.timestamp.isoformat() for msg in conv.messages),
                default=conv.started_at.isoformat(),
            ),
        }
        for conv in conv_list
    ]


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: UUID,
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Get a conversation by ID."""
    conv = await conversation_service.get_conversation(conversation_id)

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Format conversation
    conversation = {
        "id": conv.id,
        "scenario_id": conv.scenario_id,
        "customer_id": conv.customer_id,
        "started_at": conv.started_at.isoformat(),
        "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
        "scenario_name": conv.scenario_customer.name
        if conv.scenario_customer
        else None,
    }

    # Format messages
    messages = [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            # "sender": f"Customer {conv.customer_id.hex[:8]}" if msg.message_type == MessageType.USER else "Agent",
            # "sender": conv.scenario_customer.name if msg.message_type == MessageType.USER else "Agent",
            "sender_id": "Customer"
            if msg.message_type == MessageType.USER
            else "Agent",
            "content": msg.message,
            "timestamp": msg.timestamp.isoformat(),
            "message_type": msg.message_type.value,
        }
        for msg in conv.messages
    ]

    return {"conversation": conversation, "messages": messages}


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def create_message(
    conversation_id: UUID,
    message: MessageCreate,
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Create a message and notify the scheduler."""
    # Create the message in the database
    msg = await conversation_service.create_message(
        conversation_id=conversation_id,
        message=message,
    )

    # Only notify scheduler about new user messages
    if message.message_type == MessageType.USER:
        # Get the scheduler instance
        scheduler = get_scheduler()

        # Add the message to the scheduler for processing
        await scheduler.add_user_message(
            conversation_id=conversation_id,
            message=message.content,
        )

    return msg
