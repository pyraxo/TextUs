from enum import Enum

from pydantic import BaseModel, Field


class EvaluationMetric(str, Enum):
    ACCURACY = "accuracy"
    COMPREHENSION = "comprehension"
    TONE = "tone"
    CHAT_HANDLING = "chat_handling"


class ChatTranscript(BaseModel):
    text: str = Field(description="Chat transcript")


class EvaluationResult(BaseModel):
    metric: EvaluationMetric
    score: int = Field(description="Score for the metric, between 1 and 5")
    justification: str = Field(description="Justification for the score")
    problematic_responses: str = Field(
        description="Excerpts from the chat transcript that can be improved"
    )
    revised_response: str = Field(
        description="Revised responses for the problematic responses"
    )
