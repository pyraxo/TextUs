from datetime import datetime
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
    timestamp: datetime
    message_type: MessageType


class MessageCreate(SQLModel):
    """Request model for creating a new message."""

    content: str
    sender_id: UUID
    message_type: MessageType


class ConversationListResponse(SQLModel):
    """Response model for conversation list."""

    id: UUID
    scenario_id: UUID
    customer_id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    scenario_name: Optional[str] = None
    latest_message_timestamp: datetime


class ConversationResponse(SQLModel):
    """Response model for conversation details."""

    id: UUID
    scenario_id: UUID
    customer_id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    scenario_name: Optional[str] = None


class ConversationDetailResponse(SQLModel):
    """Response model for detailed conversation view with messages."""

    conversation: ConversationResponse
    messages: List[MessageResponse]
