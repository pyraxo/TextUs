from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class MessageType(str, Enum):
    USER = "user"
    BOT = "BOT"


class ChatMessage(BaseModel):
    """Chat message schema."""

    sender_id: str
    message: str
    timestamp: datetime
    message_type: MessageType


class ChatConversation(BaseModel):
    """Chat conversation schema."""

    messages: list[ChatMessage]
    scenario_id: str
    started_at: datetime
    ended_at: datetime
