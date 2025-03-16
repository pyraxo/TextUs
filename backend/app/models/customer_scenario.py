import json
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class CustomerScenarioBase(SQLModel):
    """Base Customer scenario model with common fields."""

    name: str
    profile_prompt: Optional[str] = None


class CustomerScenario(CustomerScenarioBase, table=True):
    """Customer settings for a scenario."""

    __tablename__ = "customer_scenarios"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Store chat history as JSON string
    chat_history_json: Optional[str] = Field(
        default=None, sa_column_kwargs={"name": "chat_history"}
    )

    # Foreign keys
    customer_id: int = Field(foreign_key="customers.id")
    scenario_id: int = Field(foreign_key="scenarios.id")

    # Relationships
    customer: Optional["Customer"] = Relationship()
    scenario: Optional["Scenario"] = Relationship(back_populates="customer_scenarios")

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

    id: int
    customer_id: int
    scenario_id: int
    chat_history: Optional[List[str]] = None
    feedback_ai: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerScenarioCreate(CustomerScenarioBase):
    """Customer scenario model for creation."""

    customer_id: int
    scenario_id: int


class CustomerScenarioUpdate(SQLModel):
    """Customer scenario model for updating."""

    name: Optional[str] = None
    profile_prompt: Optional[str] = None
    feedback_ai: Optional[str] = None


class CustomerScenarioHistoryUpdate(SQLModel):
    """Customer scenario model for updating chat history."""

    chat_history: List[str]


# Import these at the end to avoid circular imports
from app.models.customer import Customer
from app.models.scenario import Scenario

# Update forward references
CustomerScenario.update_forward_refs()
