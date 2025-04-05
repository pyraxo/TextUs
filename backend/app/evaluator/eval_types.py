from typing import List

from pydantic import BaseModel

from app.models.chat import ChatMessage


class ChatTranscript(BaseModel):
    messages: List[ChatMessage]


class EvaluationResult(BaseModel):
    metric: str
    score: int
    justification: str
    problematic_responses: str
    revised_response: str
