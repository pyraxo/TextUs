import json
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .chat import ChatConversation
    from .customer import Customer
    from .scenario import Scenario


class ScenarioCustomerBase(SQLModel):
    """Base ScenarioCustomer model with common fields."""

    name: str
    scenario_prompt: Optional[str] = None
    temperature: Optional[float] = 1.0


class ScenarioCustomer(ScenarioCustomerBase, table=True):
    """Customer settings for a scenario.
    Each scenario can have multiple customer settings.
    A customer can be adapted for multiple scenarios with different settings.
    """

    __tablename__ = "scenario_customers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Store expected queries as JSON string
    expected_queries_json: Optional[str] = Field(
        default=None, sa_column_kwargs={"name": "expected_queries"}
    )

    # Foreign keys
    customer_id: UUID = Field(foreign_key="customers.id")
    scenario_id: UUID = Field(foreign_key="scenarios.id")

    # Relationships
    customer: Optional["Customer"] = Relationship()
    scenario: Optional["Scenario"] = Relationship(back_populates="scenario_customers")
    conversations: List["ChatConversation"] = Relationship(
        back_populates="scenario_customer"
    )

    # TODO: user_ratings
    feedback_ai: Optional[str] = None

    @property
    def expected_queries(self) -> List[str]:
        """Get the expected queries as a list."""
        if self.expected_queries_json is None:
            return []
        return json.loads(self.expected_queries_json)

    @expected_queries.setter
    def expected_queries(self, value: List[str]):
        """Set the expected queries from a list."""
        self.expected_queries_json = json.dumps(value) if value else None


class ScenarioCustomerRead(ScenarioCustomerBase):
    """Customer scenario model for reading."""

    id: UUID
    customer_id: UUID
    scenario_id: UUID
    expected_queries: Optional[List[str]] = None
    feedback_ai: Optional[str] = None


class ScenarioCustomerCreate(ScenarioCustomerBase):
    """Customer scenario model for creation."""

    customer_id: UUID
    scenario_id: UUID
    expected_queries: Optional[List[str]] = None


class ScenarioCustomerUpdate(SQLModel):
    """Customer scenario model for updating."""

    name: Optional[str] = None
    scenario_prompt: Optional[str] = None
    expected_queries: Optional[List[str]] = None
    feedback_ai: Optional[str] = None
