import json
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .chat import ChatConversation
    from .customer import Customer
    from .scenario import Scenario


class CustomerScenarioBase(SQLModel):
    """Base Customer scenario model with common fields."""

    name: str
    profile_prompt: Optional[str] = None


class CustomerScenario(CustomerScenarioBase, table=True):
    """Customer settings for a scenario."""

    __tablename__ = "customer_scenarios"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Store chat history as JSON string
    chat_history_json: Optional[str] = Field(
        default=None, sa_column_kwargs={"name": "chat_history"}
    )

    # Foreign keys
    customer_id: UUID = Field(foreign_key="customers.id")
    scenario_id: UUID = Field(foreign_key="scenarios.id")

    # Relationships
    customer: Optional["Customer"] = Relationship()
    scenario: Optional["Scenario"] = Relationship(back_populates="customer_scenarios")
    conversations: List["ChatConversation"] = Relationship(
        back_populates="customer_scenario"
    )

    # TODO: user_ratings
    feedback_ai: Optional[str] = None

    @property
    def chat_history(self) -> List[str]:
        """Get the chat history as a list."""
        if self.chat_history_json is None:
            return []
        return json.loads(self.chat_history_json)

    @chat_history.setter
    def chat_history(self, value: List[str]):
        """Set the chat history from a list."""
        self.chat_history_json = json.dumps(value)


class CustomerScenarioRead(CustomerScenarioBase):
    """Customer scenario model for reading."""

    id: UUID
    customer_id: UUID
    scenario_id: UUID
    chat_history: Optional[List[str]] = None
    feedback_ai: Optional[str] = None


class CustomerScenarioCreate(CustomerScenarioBase):
    """Customer scenario model for creation."""

    customer_id: UUID
    scenario_id: UUID


class CustomerScenarioUpdate(SQLModel):
    """Customer scenario model for updating."""

    name: Optional[str] = None
    profile_prompt: Optional[str] = None
    feedback_ai: Optional[str] = None


class CustomerScenarioHistoryUpdate(SQLModel):
    """Customer scenario model for updating chat history."""

    chat_history: List[str]
