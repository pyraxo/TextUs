from datetime import datetime
from enum import Enum
from typing import Optional

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

    id: Optional[int] = Field(default=None, primary_key=True)
    password: str


class UserRead(UserBase):
    """User model for reading (without password)."""

    id: int


class UserCreate(UserBase):
    """User model for creation."""

    password: str
