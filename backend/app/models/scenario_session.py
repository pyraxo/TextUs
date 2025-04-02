from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .chat import ChatConversation
    from .scenario import Scenario
    from .user import User


class SessionStatus(str, Enum):
    """Status of a scenario session."""

    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"
    TIMED_OUT = "timed_out"


class SessionMetrics(SQLModel):
    """Metrics for a scenario session."""

    duration_seconds: Optional[float]
    total_messages: int
    user_messages: int
    bot_messages: int
    conversations: int
    avg_response_time: Optional[float]  # Average time between messages
    completion_rate: float  # Percentage of customer scenarios attempted


class ScenarioSessionBase(SQLModel):
    """ScenarioSessionBase model with common fields."""

    user_id: UUID = Field(foreign_key="users.id")
    scenario_id: UUID = Field(foreign_key="scenarios.id")
    start_timestamp: datetime = Field(default_factory=datetime.now)
    end_timestamp: Optional[datetime] = Field(default=None)
    status: Optional[SessionStatus] = Field(default=None)
    # metrics_json: Optional[str] = Field(default=None)

    # @property
    # def metrics(self) -> Optional[SessionMetrics]:
    #     """Get the session metrics."""
    #     if not self.metrics_json:
    #         return None
    #     metrics_dict = json.loads(self.metrics_json)
    #     return SessionMetrics(**metrics_dict)

    # @metrics.setter
    # def metrics(self, value: SessionMetrics):
    #     """Set the session metrics."""
    #     if value is None:
    #         self.metrics_json = None
    #     else:
    #         self.metrics_json = json.dumps(value.model_dump())


class ScenarioSession(ScenarioSessionBase, table=True):
    """ScenarioSession model for database storage.
    This model stores users' scenario sessions."""

    __tablename__ = "scenario_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user: Optional["User"] = Relationship(back_populates="scenario_sessions")
    scenario: Optional["Scenario"] = Relationship(back_populates="scenario_sessions")
    chat_conversation: Optional["ChatConversation"] = Relationship(
        back_populates="scenario_session"
    )

    def add_chat_conversation(self, chat_conversation: "ChatConversation"):
        """Add a chat conversation to the session."""
        self.chat_conversation = chat_conversation

    def get_all_conversations(self):
        """Get all conversations for the session."""
        return [self.chat_conversation] if self.chat_conversation else []

    def get_scenario_conversations(self, scenario_id: UUID):
        """Get all conversations for a specific scenario."""
        if (
            not self.chat_conversation
            or self.chat_conversation.scenario_customer.scenario_id != scenario_id
        ):
            return []
        return [self.chat_conversation]

    def get_customer_scenario_conversation(
        self, customer_scenario_id: UUID
    ) -> Optional["ChatConversation"]:
        """Find the chat conversation associated with a specific customer scenario."""
        if (
            not self.chat_conversation
            or self.chat_conversation.scenario_customer_id != customer_scenario_id
        ):
            return None
        return self.chat_conversation
