from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.db import get_session
from app.models.chat import MessageType
from app.models.response import (
    ConversationDetailResponse,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.services import conversations

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/", response_model=List[ConversationResponse])
async def get_conversations(session: Session = Depends(get_session)):
    conv_list = await conversations.get_conversations(session=session)
    # Transform to include scenario name
    return [
        {
            "id": conv.id,
            "scenario_id": conv.scenario_id,
            "customer_id": conv.customer_id,
            "started_at": conv.started_at.isoformat(),
            "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
            "scenario_name": conv.customer_scenario.name
            if conv.customer_scenario
            else None,
        }
        for conv in conv_list
    ]


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: UUID, session: Session = Depends(get_session)
):
    conv = await conversations.get_conversation(
        conversation_id=conversation_id, session=session
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Format conversation
    conversation = {
        "id": conv.id,
        "scenario_id": conv.scenario_id,
        "customer_id": conv.customer_id,
        "started_at": conv.started_at.isoformat(),
        "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
        "scenario_name": conv.customer_scenario.name
        if conv.customer_scenario
        else None,
    }

    # Format messages
    messages = [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            # "sender": f"Customer {conv.customer_id.hex[:8]}" if msg.message_type == MessageType.USER else "Agent",
            # "sender": conv.customer_scenario.name if msg.message_type == MessageType.USER else "Agent",
            "sender": "Customer" if msg.message_type == MessageType.USER else "Agent",
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
    session: Session = Depends(get_session),
):
    msg = await conversations.create_message(
        conversation_id=conversation_id,
        message=message,
        session=session,
    )
    return msg
