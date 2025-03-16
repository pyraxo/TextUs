from datetime import datetime
from enum import Enum

from beanie import Document


class UserType(str, Enum):
    TRAINEE = "trainee"
    TRAINER = "trainer"
    ADMIN = "admin"


class User(Document):
    """User model."""

    name: str
    username: str
    email: str
    password: str
    joined_at: datetime
    last_login: datetime
    user_type: UserType

    class Settings:
        name = "users"
        indexes = [
            "user_type",
            "username",
            "email",
        ]
