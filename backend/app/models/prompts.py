from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class PromptSettingsBase(SQLModel):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    revision_date: datetime = Field(default_factory=datetime.now)

    base_prompt: str
    response_prompt: str


class PromptSettings(PromptSettingsBase, table=True):
    __tablename__ = "prompt_settings"


class PromptSettingsCreate(PromptSettingsBase):
    pass
