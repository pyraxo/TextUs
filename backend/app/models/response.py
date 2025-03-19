from typing import List, Optional
from uuid import UUID

from sqlmodel import SQLModel

from app.models.chat import MessageType


class MessageResponse(SQLModel):
    """Response model for chat messages."""

    id: UUID
    conversation_id: UUID
    sender_id: str
    content: str
    timestamp: str
    message_type: MessageType


class MessageCreate(SQLModel):
    """Request model for creating a new message."""

    content: str
    sender_id: str
    message_type: MessageType


class ConversationResponse(SQLModel):
    """Response model for conversation details."""

    id: UUID
    scenario_id: UUID
    customer_id: UUID
    started_at: str
    ended_at: Optional[str] = None
    scenario_name: Optional[str] = None


class ConversationDetailResponse(SQLModel):
    """Response model for detailed conversation view with messages."""

    conversation: ConversationResponse
    messages: List[MessageResponse]


class SubscriptionRequest(SQLModel):
    conversation_ids: List[str]


class SubscriptionResponse(SQLModel):
    subscription_id: str
    conversation_ids: List[str]
