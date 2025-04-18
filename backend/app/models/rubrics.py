from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EvaluationMetric(str, Enum):
    ACCURACY = "accuracy"
    COMPREHENSION = "comprehension"
    TONE = "tone"
    CHAT_HANDLING = "chat_handling"


class RubricsSettingsBase(SQLModel):
    id: EvaluationMetric = Field(primary_key=True)
    revision_date: datetime = Field(default_factory=datetime.now)

    rubric_prompt: Optional[str] = None
    rubric_name: str


class RubricsSettings(RubricsSettingsBase, table=True):
    __tablename__ = "rubrics_settings"


class RubricSettingsUpdate(SQLModel):
    rubric_prompt: str


class RubricEvaluation(BaseModel):
    metric: EvaluationMetric
    score: float
    justification: str
    problematic_response: str
    revised_response: str
