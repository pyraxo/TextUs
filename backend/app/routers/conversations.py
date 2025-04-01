from typing import Annotated, List
from uuid import UUID

from app.core.common import parse_uuid
from app.models.chat import ChatMessage, MessageType
from app.models.response import (
    ConversationDetailResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
)
from app.services.conversation_service import ConversationService
from fastapi import APIRouter, Depends

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
            "scenario_id": conv.scenario_customer.scenario_id,
            "customer_id": conv.scenario_customer.customer_id,
            "started_at": conv.started_at.isoformat(),
            "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
            "scenario_name": conv.scenario_customer.name,
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

    # Format conversation
    conversation = {
        "id": conv.id,
        "scenario_id": conv.scenario_customer.scenario_id,
        "customer_id": conv.scenario_customer.customer_id,
        "started_at": conv.started_at.isoformat(),
        "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
        "scenario_name": conv.scenario_customer.name,
    }

    # Format messages
    messages = [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
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
) -> ChatMessage:
    """Create a message and notify the scheduler."""
    conversation_uuid = parse_uuid(conversation_id)
    # Create the message in the database
    msg = await conversation_service.create_message(
        conversation_id=conversation_uuid,
        message=message,
    )
    return msg
