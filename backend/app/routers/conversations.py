from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException

from app.core.common import parse_uuid
from app.models.response import (
    ConversationDetailResponse,
    ConversationListResponse,
    ConversationResponse,
    MessageResponse,
)
from app.models.scenario_session import FeedbackRequest
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
    conversation_id: str,
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Get a conversation by ID."""
    conv = await conversation_service.get_conversation(parse_uuid(conversation_id))

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
    conversation_id: str,
    conversation_service: Annotated[ConversationService, Depends()],
):
    """Get evaluation results for a conversation."""
    evaluation = await conversation_service.get_conversation_evaluation(
        parse_uuid(conversation_id)
    )
    return evaluation


@router.post("/{conversation_id}/feedback", response_model=ConversationListResponse)
async def get_conversation_trainer_feedback(
    conversation_id: str,
    req: FeedbackRequest,
    conversation_service: Annotated[ConversationService, Depends()],
) -> ConversationListResponse:
    """Get trainer feedback for a specific conversation."""
    conversation = await conversation_service.get_conversation(conversation_id)
    if not conversation or str(conversation.id) != conversation_id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return ConversationListResponse(
        id=conversation.id,
        scenario_id=conversation.scenario_customer.scenario_id,
        customer_id=conversation.scenario_customer.customer_id,
        started_at=conversation.started_at,
        ended_at=conversation.ended_at,
        scenario_name=conversation.scenario_customer.name,
        latest_message_timestamp=max(
            (msg.timestamp for msg in conversation.messages),
            default=conversation.started_at,
        ),
        trainer_feedback=conversation.trainer_feedback,
    )


@router.patch("/{conversation_id}/feedback", response_model=ConversationListResponse)
async def update_conversation_trainer_feedback(
    conversation_id: str,
    req: FeedbackRequest,
    conversation_service: Annotated[ConversationService, Depends()],
) -> ConversationListResponse:
    """Update trainer feedback for a specific conversation."""
    conversation = await conversation_service.get_conversation(conversation_id)
    if not conversation or str(conversation.id) != conversation_id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.trainer_feedback = req.content
    conversation_service.session.add(conversation)

    await conversation_service.session.commit()
    await conversation_service.session.refresh(conversation)

    return ConversationListResponse(
        id=conversation.id,
        scenario_id=conversation.scenario_customer.scenario_id,
        customer_id=conversation.scenario_customer.customer_id,
        started_at=conversation.started_at,
        ended_at=conversation.ended_at,
        scenario_name=conversation.scenario_customer.name,
        latest_message_timestamp=max(
            (msg.timestamp for msg in conversation.messages),
            default=conversation.started_at,
        ),
        trainer_feedback=conversation.trainer_feedback,
    )
