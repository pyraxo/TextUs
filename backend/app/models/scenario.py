from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .customer_scenario import CustomerScenario
    from .user import User


class ScenarioBase(SQLModel):
    """Base Scenario model with common fields."""

    name: str
    description: Optional[str] = None
    is_pausable: bool = True
    system_prompt: Optional[str] = "You are a confused customer."
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Scenario(ScenarioBase, table=True):
    """Scenario model for database storage."""

    __tablename__ = "scenarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    temperature: Optional[float] = None

    # Foreign keys
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")

    # Relationships
    created_by: Optional["User"] = Relationship()
    customer_scenarios: List["CustomerScenario"] = Relationship(
        back_populates="scenario"
    )

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class ScenarioRead(ScenarioBase):
    """Scenario model for reading."""

    id: int
    created_by_id: Optional[int] = None
    temperature: Optional[float] = None


class ScenarioCreate(ScenarioBase):
    """Scenario model for creation."""

    created_by_id: Optional[int] = None


class ScenarioUpdate(SQLModel):
    """Scenario model for updating."""

    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    is_pausable: Optional[bool] = None


class ScenarioAddCustomer(SQLModel):
    """Model for adding a customer to a scenario."""

    customer_id: int


class ScenarioRemoveCustomer(SQLModel):
    """Model for removing a customer from a scenario."""

    customer_id: int


class ScenarioUpdateCustomer(SQLModel):
    """Model for updating a customer in a scenario."""

    customer_id: int
    name: Optional[str] = None
    profile_prompt: Optional[str] = None


class ScenarioUpdateHistory(SQLModel):
    """Model for updating scenario history."""

    customer_id: int
    history: List[str]
