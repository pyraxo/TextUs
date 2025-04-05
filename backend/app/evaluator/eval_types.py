from pydantic import BaseModel, Field
from typing import List, Optional

class Chat_Transcript(BaseModel):
    text: str

class EvaluationResult(BaseModel):
    metric: str
    score: int
    justification: str
    problematic_responses: str
    revised_response: str
