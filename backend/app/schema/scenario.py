from typing import Optional

from pydantic import BaseModel


class ScenarioSettings(BaseModel):
    """Scenario settings schema."""

    name: str
    description: Optional[str] = None
    system_prompt: str
    temperature: Optional[float] = 1.0
