from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


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

    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.now)

    # Foreign keys
    conversation_id: int = Field(foreign_key="chat_conversations.id")

    # Relationships
    conversation: Optional["ChatConversation"] = Relationship(back_populates="messages")


class ChatMessageRead(ChatMessageBase):
    """Chat message model for reading."""

    id: int
    timestamp: datetime
    conversation_id: int


class ChatMessageCreate(ChatMessageBase):
    """Chat message model for creation."""

    conversation_id: Optional[int] = None


class ChatConversationBase(SQLModel):
    """Base Chat conversation model with common fields."""

    scenario_id: str


class ChatConversation(ChatConversationBase, table=True):
    """Chat conversation model for database storage."""

    __tablename__ = "chat_conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None

    # Relationships
    messages: List[ChatMessage] = Relationship(back_populates="conversation")


class ChatConversationRead(ChatConversationBase):
    """Chat conversation model for reading."""

    id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    messages: List[ChatMessageRead]


class ChatConversationCreate(ChatConversationBase):
    """Chat conversation model for creation."""

    initial_message: Optional[ChatMessageCreate] = None
