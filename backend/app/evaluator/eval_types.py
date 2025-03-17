from pydantic import BaseModel


class EvaluationResponse(BaseModel):
    tone_score: int
    accuracy_score: int
    feedback: str
