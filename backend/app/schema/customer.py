from typing import List, Optional

from beanie import Link
from pydantic import BaseModel, Field

from app.models.customer import Customer


class CustomerScenario(BaseModel):
    """Customer settings schema."""

    name: str
    profile_prompt: Optional[str] = None
    customer: Link[Customer]
    chat_history: List[str] = Field(default_factory=list)

    # TODO: user_ratings
    feedback_ai: Optional[str] = None
