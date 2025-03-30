from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .chat import ChatConversation
    from .scenario import Scenario
    from .user import User


class ScenarioSessionChat(SQLModel, table=True):
    """Association table for ScenarioSession and ChatConversation."""

    __tablename__ = "scenario_session_chats"

    scenario_session_id: UUID = Field(
        foreign_key="scenario_sessions.id", primary_key=True
    )
    chat_conversation_id: UUID = Field(
        foreign_key="chat_conversations.id", primary_key=True
    )


class ScenarioSessionBase(SQLModel):
    """ScenarioSessionBase model with common fields."""

    user_id: UUID = Field(foreign_key="users.id")
    scenario_id: UUID = Field(foreign_key="scenarios.id")
    start_timestamp: datetime = Field(default_factory=datetime.now)
    end_timestamp: Optional[datetime] = Field(default=None)


class ScenarioSession(ScenarioSessionBase, table=True):
    """ScenarioSession model for database storage.
    This model stores users' scenario sessions."""

    __tablename__ = "scenario_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user: Optional["User"] = Relationship(back_populates="scenario_sessions")
    scenario: Optional["Scenario"] = Relationship(back_populates="scenario_sessions")
    chat_conversations: List["ChatConversation"] = Relationship(
        back_populates="scenario_session",
        sa_relationship_kwargs={"secondary": "scenario_session_chats"},
    )

    def add_chat_conversation(self, chat_conversation: "ChatConversation"):
        """Add a chat conversation to the session."""
        self.chat_conversations.append(chat_conversation)

    def get_all_conversations(self):
        """Get all conversations for the session."""
        return self.chat_conversations

    def get_scenario_conversations(self, scenario_id: UUID):
        """Get all conversations for a specific scenario."""
        return [
            conv for conv in self.chat_conversations if conv.scenario_id == scenario_id
        ]

    def get_customer_scenario_conversation(
        self, customer_scenario_id: UUID
    ) -> Optional["ChatConversation"]:
        """Find the chat conversation associated with a specific customer scenario."""
        for conv in self.chat_conversations:
            if conv.customer_scenario_id == customer_scenario_id:
                return conv
        return None
