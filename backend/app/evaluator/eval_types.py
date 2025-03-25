from pydantic import BaseModel, Field
from typing import List, Optional

class Chat_Transcript(BaseModel):
    text: str

class EvaluationMetric(BaseModel):
    name: str 
    score: float  
    explanation: str  

class EvaluationResult(BaseModel):
    metrics: List[EvaluationMetric]  
    overall_score: float  
