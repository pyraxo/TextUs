from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

import sqlalchemy as sa
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .customer_scenario import CustomerScenario
    from .scheme import Scheme
    from .user import User
    from .user_scenario_session import UserScenarioSession


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

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    temperature: Optional[float] = 1.0

    # Foreign keys
    created_by_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    scheme_id: Optional[UUID] = Field(
        default=None,
        sa_column=sa.Column(
            "scheme_id",
            sa.Uuid(),
            sa.ForeignKey("schemes.id", name="fk_scenarios_scheme_id_schemes"),
            index=True,
        ),
    )

    # Relationships
    created_by: Optional["User"] = Relationship()
    scheme: Optional["Scheme"] = Relationship(back_populates="scenarios")
    customer_scenarios: List["CustomerScenario"] = Relationship(
        back_populates="scenario"
    )
    user_scenario_sessions: List["UserScenarioSession"] = Relationship(
        back_populates="scenario"
    )

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class ScenarioRead(ScenarioBase):
    """Scenario model for reading."""

    id: UUID
    created_by_id: Optional[UUID] = None
    scheme_id: Optional[UUID] = None
    temperature: Optional[float] = None


class ScenarioCreate(ScenarioBase):
    """Scenario model for creation."""

    created_by_id: Optional[UUID] = None
    scheme_id: Optional[UUID] = None


class ScenarioUpdate(SQLModel):
    """Scenario model for updating."""

    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    is_pausable: Optional[bool] = None
    scheme_id: Optional[UUID] = None


class ScenarioAddCustomer(SQLModel):
    """Model for adding a customer to a scenario."""

    customer_id: UUID


class ScenarioRemoveCustomer(SQLModel):
    """Model for removing a customer from a scenario."""

    customer_id: UUID


class ScenarioUpdateCustomer(SQLModel):
    """Model for updating a customer in a scenario."""

    customer_id: UUID
    name: Optional[str] = None
    profile_prompt: Optional[str] = None


class ScenarioUpdateHistory(SQLModel):
    """Model for updating scenario history."""

    customer_id: UUID
    history: List[str]
