import json
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
    personality_traits_str: Optional[str] = Field(
        default=None, sa_column_kwargs={"name": "personality_traits"}
    )

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

    @property
    def personality_traits(self) -> List[str]:
        """Get the personality traits as a list."""
        return (
            json.loads(self.personality_traits_str)
            if self.personality_traits_str
            else []
        )

    @personality_traits.setter
    def personality_traits(self, value: List[str]):
        """Set the personality traits from a list."""
        self.personality_traits_str = json.dumps(value) if value else None

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class CustomerRead(CustomerBase):
    """Customer model for reading."""

    id: UUID
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None
    personality_traits: List[str] = Field(default_factory=list)

    @classmethod
    def from_customer(cls, customer: Customer) -> "CustomerRead":
        """Create a CustomerRead instance from a Customer model."""
        return cls(
            id=customer.id,
            name=customer.name,
            description=customer.description,
            profile_prompt=customer.profile_prompt,
            created_at=customer.created_at,
            updated_at=customer.updated_at,
            created_by_id=customer.created_by_id,
            updated_by_id=customer.updated_by_id,
            personality_traits=customer.personality_traits,
        )


class CustomerCreate(CustomerBase):
    """Customer model for creation."""

    created_by_id: Optional[UUID] = None


class CustomerUpdate(SQLModel):
    """Customer model for updating."""

    name: Optional[str] = None
    description: Optional[str] = None
    profile_prompt: Optional[str] = None
    updated_by_id: Optional[UUID] = None
    personality_traits: Optional[List[str]] = None
