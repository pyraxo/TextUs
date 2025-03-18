from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class UserType(str, Enum):
    TRAINEE = "trainee"
    TRAINER = "trainer"
    ADMIN = "admin"


class UserBase(SQLModel):
    """Base User model with common fields."""

    name: str
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    user_type: UserType = Field(index=True)
    joined_at: datetime = Field(default_factory=datetime.now)
    last_login: datetime = Field(default_factory=datetime.now)


class User(UserBase, table=True):
    """User model for database storage."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    password: str


class UserRead(UserBase):
    """User model for reading (without password)."""

    id: UUID


class UserCreate(UserBase):
    """User model for creation."""

    password: str
