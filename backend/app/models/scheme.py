import re
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .scenario import Scenario
    from .user import User


def generate_slug(name: str) -> str:
    """Generate a slug from a name."""
    slug = name.lower()
    # Remove special characters
    slug = re.sub(r"[^\w\s-]", "", slug)
    # Replace spaces with hyphens
    slug = re.sub(r"[\s]+", "-", slug)
    return slug


class SchemeBase(SQLModel):
    """Base Scheme model with common fields."""

    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Scheme(SchemeBase, table=True):
    """Scheme model for database storage."""

    __tablename__ = "schemes"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    slug: str = Field(default=None, index=True)

    # Foreign keys
    created_by_id: Optional[UUID] = Field(default=None, foreign_key="users.id")

    # Relationships
    created_by: Optional["User"] = Relationship()
    scenarios: List["Scenario"] = Relationship(back_populates="scheme")

    def __init__(self, **data):
        super().__init__(**data)
        if self.slug is None and self.name:
            self.slug = generate_slug(self.name)

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()


class SchemeRead(SchemeBase):
    """Scheme model for reading."""

    id: UUID
    slug: str
    created_by_id: Optional[UUID] = None


class SchemeCreate(SchemeBase):
    """Scheme model for creation."""

    created_by_id: Optional[UUID] = None
    slug: Optional[str] = None


class SchemeUpdate(SQLModel):
    """Scheme model for updating."""

    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
