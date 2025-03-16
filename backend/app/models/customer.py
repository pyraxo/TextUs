from datetime import datetime
from typing import Optional

from beanie import Document, Insert, Link, Update, before_event

from app.models.user import User


class Customer(Document):
    """AI customer profile model."""

    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[Link[User]] = None
    updated_by: Optional[Link[User]] = None

    # TODO: Decide a system of customisation for each customer
    profile_prompt: Optional[str] = None

    @before_event(Insert)
    def before_insert(self):
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    @before_event(Update)
    def before_update(self):
        self.updated_at = datetime.now()

    class Settings:
        name = "customers"
        indexes = [
            "created_by",
        ]
