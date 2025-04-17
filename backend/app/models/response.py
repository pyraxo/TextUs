from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import SQLModel

from app.models.chat import MessageType


class MessageResponse(SQLModel):
    """Response model for chat messages."""

    id: UUID
    conversation_id: UUID
    content: str
    timestamp: datetime
    message_type: MessageType
    trainee_id: UUID


class MessageCreate(SQLModel):
    """Request model for creating a new message."""

    content: str
    trainee_id: UUID
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
    trainer_feedback: Optional[str] = None


class ConversationDetailResponse(SQLModel):
    """Response model for detailed conversation view with messages."""

    conversation: ConversationResponse
    messages: List[MessageResponse]


class ScenarioBrief(SQLModel):
    id: UUID
    name: str


class ScenarioSessionResponse(SQLModel):
    id: UUID
    user_id: UUID
    scenario_id: UUID
    start_timestamp: datetime
    end_timestamp: Optional[datetime]
    status: Optional[str]
    metrics: Optional[dict]
    scenario: Optional[ScenarioBrief]
