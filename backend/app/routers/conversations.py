from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends

from app.models.response import (
    ConversationDetailResponse,
    ConversationListResponse,
    ConversationResponse,
    MessageResponse,
)
from app.services.conversation_service import ConversationService

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
    conversation: ConversationResponse = {
        "id": conv.id,
        "scenario_id": conv.scenario_customer.scenario_id,
        "customer_id": conv.scenario_customer.customer_id,
        "started_at": conv.started_at.isoformat(),
        "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
        "scenario_name": conv.scenario_customer.name,
    }

    # Format messages
    messages: List[MessageResponse] = [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "trainee_id": msg.trainee_id,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "message_type": msg.message_type.value,
        }
        for msg in conv.messages
    ]

    return {"conversation": conversation, "messages": messages}


@router.get("/{conversation_id}/evaluation", response_model=dict)
async def get_conversation_evaluation(
    conversation_id: UUID,
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Get evaluation results for a conversation."""
    evaluation = await conversation_service.get_conversation_evaluation(conversation_id)
    return evaluation
