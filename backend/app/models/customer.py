from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .customer_scenario import CustomerScenario
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

    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign keys
    created_by_id: Optional[int] = Field(
        default=None, foreign_key="users.id", index=True
    )
    updated_by_id: Optional[int] = Field(default=None, foreign_key="users.id")

    # Relationships
    created_by: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Customer.created_by_id]"}
    )
    updated_by: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Customer.updated_by_id]"}
    )
    scenarios: List["CustomerScenario"] = Relationship(back_populates="customer")

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class CustomerRead(CustomerBase):
    """Customer model for reading."""

    id: int
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None


class CustomerCreate(CustomerBase):
    """Customer model for creation."""

    created_by_id: Optional[int] = None
