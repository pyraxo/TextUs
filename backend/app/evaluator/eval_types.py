from pydantic import BaseModel, Field
from typing import List, Optional

class UserMessage(BaseModel):
    text: str  

class AgentResponse(BaseModel):
    text: str  

class EvaluationMetric(BaseModel):
    name: str 
    score: float  
    explanation: str  

class EvaluationResult(BaseModel):
    metrics: List[EvaluationMetric]  
    overall_score: float  
