from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .scenario_customer import ScenarioCustomer
    from .user import User


class CustomerBase(SQLModel):
    """Base Customer model with common fields."""

    name: str
    description: Optional[str] = None
    profile_prompt: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Customer(CustomerBase, table=True):
    """AI customer profile model for database storage."""

    __tablename__ = "customers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Foreign keys
    created_by_id: Optional[UUID] = Field(
        default=None, foreign_key="users.id", index=True
    )
    updated_by_id: Optional[UUID] = Field(default=None, foreign_key="users.id")

    # Relationships
    created_by: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Customer.created_by_id]"}
    )
    updated_by: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Customer.updated_by_id]"}
    )
    scenario_customers: List["ScenarioCustomer"] = Relationship(
        back_populates="customer"
    )

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class CustomerRead(CustomerBase):
    """Customer model for reading."""

    id: UUID
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None


class CustomerCreate(CustomerBase):
    """Customer model for creation."""

    created_by_id: Optional[UUID] = None


class CustomerUpdate(SQLModel):
    """Customer model for updating."""

    name: Optional[str] = None
    description: Optional[str] = None
    profile_prompt: Optional[str] = None
    updated_by_id: Optional[UUID] = None
