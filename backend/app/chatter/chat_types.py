from datetime import datetime
from enum import Enum
from typing import Annotated, List, Sequence, TypedDict
from uuid import UUID

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field

from app.models.chat import MessageType


class QueryEvaluation(BaseModel):
    """Evaluation of which queries have been answered."""

    unanswered_queries: List[str] = Field(
        default_factory=list,
        description="List of queries that have not been sufficiently addressed in the conversation",
    )
    all_answered: bool = Field(
        description="True if all queries have been sufficiently addressed"
    )
    reasoning: str = Field(
        description="Brief explanation of why the queries are considered answered or unanswered"
    )


class ChatStatus(Enum):
    """Status codes for chat workflow."""

    INIT = "init"  # Initial state, waiting for first AI message
    CONTINUE = "continue"  # Continue processing in the same node
    WAITING = "waiting"  # Waiting for scheduled time
    END = "end"  # End conversation


class State(TypedDict):
    """State management for the chatbot."""

    messages: Annotated[Sequence[BaseMessage], add_messages]
    trainee_id: UUID | str
    customer_id: UUID | str
    scenario_prompt: str
    conversation_id: UUID | str

    # last_message_time: Optional[datetime] = None
    # last_user_message_time: Optional[datetime] = None
    # next_response_time: Optional[datetime] = (
    #     None  # When the next response should be sent
    # )
    last_message_time: datetime
    last_user_message_time: datetime
    next_response_time: datetime

    unanswered_queries: list[str] = []

    patience_level: float = 0.5  # 0.0-1.0, where lower means more impatient
    end_chat: bool = False

    conversation_history: list[str] = []
    status: ChatStatus = ChatStatus.INIT

    to_send: str = ""
    to_send_from: MessageType = MessageType.BOT
