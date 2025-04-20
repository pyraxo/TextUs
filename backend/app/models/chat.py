from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, List, Optional
from uuid import UUID, uuid4

from sqlmodel import JSON, Column, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.scenario_customer import ScenarioCustomer
    from app.models.scenario_session import ScenarioSession
    from app.models.user import User


class MessageType(str, Enum):
    USER = "user"
    BOT = "bot"


class ConversationStatus(str, Enum):
    IDLE = "idle"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"


class ChatMessageBase(SQLModel):
    """Base Chat message model with common fields."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    content: str
    message_type: MessageType
    timestamp: datetime = Field(default_factory=datetime.now)
    conversation_id: UUID
    trainee_id: UUID


class ChatMessage(ChatMessageBase, table=True):
    """Chat message model for database storage."""

    __tablename__ = "chat_messages"

    # Foreign keys
    conversation_id: UUID = Field(foreign_key="chat_conversations.id")
    trainee_id: UUID = Field(foreign_key="users.id")

    # Relationships
    conversation: Optional["ChatConversation"] = Relationship(back_populates="messages")
    trainee: Optional["User"] = Relationship(back_populates="chat_messages")


class ChatConversationBase(SQLModel):
    """Base Chat conversation model with common fields."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    scenario_customer_id: UUID
    trainee_id: UUID
    trainer_feedback: Optional[str] = Field(default=None)


class ChatConversation(ChatConversationBase, table=True):
    """Chat conversation model for database storage."""

    __tablename__ = "chat_conversations"

    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None

    # Foreign keys
    scenario_customer_id: UUID = Field(foreign_key="scenario_customers.id")
    trainee_id: UUID = Field(foreign_key="users.id")
    scenario_session_id: Optional[UUID] = Field(
        foreign_key="scenario_sessions.id", default=None
    )

    # Relationships
    scenario_customer: Optional["ScenarioCustomer"] = Relationship(
        back_populates="conversations"
    )
    messages: List[ChatMessage] = Relationship(back_populates="conversation")
    scenario_session: Optional["ScenarioSession"] = Relationship(
        back_populates="chat_conversations"
    )
    trainee: Optional["User"] = Relationship(back_populates="chat_conversations")

    evaluation: Optional["ChatEvaluation"] = Relationship(back_populates="conversation")

    @property
    def chat_history(self) -> List[str]:
        """Get the chat history as a list."""
        return [message.content for message in self.messages]


class ChatEvaluation(SQLModel, table=True):
    """Chat evaluation model for database storage."""

    __tablename__ = "chat_evaluations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    evaluation_results: Any = Field(sa_column=Column(JSON))

    score: Optional[float] = Field(default=0.0)

    conversation_id: UUID = Field(foreign_key="chat_conversations.id")
    session_id: UUID = Field(foreign_key="scenario_sessions.id")
    trainee_id: UUID = Field(foreign_key="users.id")

    conversation: Optional["ChatConversation"] = Relationship(
        back_populates="evaluation"
    )
    session: Optional["ScenarioSession"] = Relationship(back_populates="evaluations")
    trainee: Optional["User"] = Relationship(back_populates="evaluations")
