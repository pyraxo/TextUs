from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.customer_scenario import CustomerScenario


class MessageType(str, Enum):
    USER = "user"
    BOT = "bot"


class ChatMessageBase(SQLModel):
    """Base Chat message model with common fields."""

    sender_id: str
    message: str
    message_type: MessageType


class ChatMessage(ChatMessageBase, table=True):
    """Chat message model for database storage."""

    __tablename__ = "chat_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.now)

    # Foreign keys
    conversation_id: UUID = Field(foreign_key="chat_conversations.id")

    # Relationships
    conversation: Optional["ChatConversation"] = Relationship(back_populates="messages")


class ChatMessageRead(ChatMessageBase):
    """Chat message model for reading."""

    id: UUID
    timestamp: datetime
    conversation_id: UUID


class ChatMessageCreate(ChatMessageBase):
    """Chat message model for creation."""

    conversation_id: Optional[UUID] = None


class ChatConversationBase(SQLModel):
    """Base Chat conversation model with common fields."""

    scenario_id: UUID
    customer_id: UUID


class ChatConversation(ChatConversationBase, table=True):
    """Chat conversation model for database storage."""

    __tablename__ = "chat_conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None

    # Foreign keys
    customer_scenario_id: UUID = Field(foreign_key="customer_scenarios.id")

    # Relationships
    customer_scenario: Optional["CustomerScenario"] = Relationship(
        back_populates="conversations"
    )
    messages: List[ChatMessage] = Relationship(back_populates="conversation")


class ChatConversationRead(ChatConversationBase):
    """Chat conversation model for reading."""

    id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    messages: List[ChatMessageRead]


class ChatConversationCreate(ChatConversationBase):
    """Chat conversation model for creation."""

    initial_message: Optional[ChatMessageCreate] = None


class ConversationResponse(ChatConversationBase):
    id: UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
