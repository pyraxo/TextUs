import json
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.scenario_customer import ScenarioCustomer
    from app.models.scenario_session import ScenarioSession


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
    sender_id: str
    message: str
    message_type: MessageType
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatMessage(ChatMessageBase, table=True):
    """Chat message model for database storage."""

    __tablename__ = "chat_messages"

    # Foreign keys
    conversation_id: UUID = Field(foreign_key="chat_conversations.id")

    # Relationships
    conversation: Optional["ChatConversation"] = Relationship(back_populates="messages")


class ChatMessageCreate(ChatMessageBase):
    """Chat message model for creation."""

    conversation_id: Optional[UUID] = None


class ChatConversationBase(SQLModel):
    """Base Chat conversation model with common fields."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    scenario_customer_id: UUID


class ChatConversation(ChatConversationBase, table=True):
    """Chat conversation model for database storage."""

    __tablename__ = "chat_conversations"

    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None

    # Foreign keys
    scenario_customer_id: UUID = Field(foreign_key="scenario_customers.id")

    # Relationships
    scenario_customer: Optional["ScenarioCustomer"] = Relationship(
        back_populates="conversations"
    )
    messages: List[ChatMessage] = Relationship(back_populates="conversation")
    scenario_session: Optional["ScenarioSession"] = Relationship(
        back_populates="chat_conversations",
        sa_relationship_kwargs={"secondary": "scenario_session_chats"},
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


class ChatConversationCreate(ChatConversationBase):
    """Chat conversation model for creation."""

    pass
