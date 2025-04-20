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
    trainer_feedback: Optional[str] = None


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
    scheme_id: UUID
    scheme_name: str


class ScenarioSessionResponse(SQLModel):
    id: UUID
    user_id: UUID
    scenario_id: UUID
    start_timestamp: datetime
    end_timestamp: Optional[datetime]
    status: Optional[str]
    metrics: Optional[dict]
    scenario: Optional[ScenarioBrief]


class LatestAttemptResponse(SQLModel):
    score: float
    time_taken: int
    scenario_name: str
    scheme_name: str


class DashboardSummaryResponse(SQLModel):
    latest_attempt: Optional[LatestAttemptResponse]
    scenario_progression: int
    total_practice_sessions: int
    metrics: dict
