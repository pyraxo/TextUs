import json
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

    evaluations: Optional["ChatEvaluation"] = Relationship(
        back_populates="conversation"
    )

    # Store chat history as JSON string
    messages_json: Optional[str] = Field(
        default=None, sa_column_kwargs={"name": "messages"}
    )

    @property
    def chat_history(self) -> List[str]:
        """Get the chat history as a list."""
        if self.messages_json is None:
            return []
        return json.loads(self.messages_json)

    @chat_history.setter
    def chat_history(self, value: List[str]):
        """Set the chat history from a list."""
        self.messages_json = json.dumps(value)


class ChatEvaluation(SQLModel, table=True):
    """Chat evaluation model for database storage."""

    __tablename__ = "chat_evaluations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    evaluation_results: Any = Field(sa_column=Column(JSON))

    @property
    def evaluation_results_dict(self) -> dict:
        """Get the evaluation results as a dictionary."""
        if isinstance(self.evaluation_results, dict):
            return self.evaluation_results
        return (
            json.loads(self.evaluation_results)
            if isinstance(self.evaluation_results, str)
            else {}
        )

    @evaluation_results_dict.setter
    def evaluation_results_dict(self, value: dict):
        """Set the evaluation results from a dictionary."""
        self.evaluation_results = json.dumps(value) if value else None

    conversation_id: UUID = Field(foreign_key="chat_conversations.id")
    session_id: UUID = Field(foreign_key="scenario_sessions.id")
    trainee_id: UUID = Field(foreign_key="users.id")

    conversation: Optional["ChatConversation"] = Relationship(
        back_populates="evaluations"
    )
    session: Optional["ScenarioSession"] = Relationship(back_populates="evaluations")
    trainee: Optional["User"] = Relationship(back_populates="evaluations")
