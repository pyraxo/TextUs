from datetime import datetime
from typing import Optional

from beanie import Document, Insert, Update, before_event

from app.schema.scenario import ScenarioSettings


class Scenario(Document):
    """Scenario model."""

    name: str
    description: Optional[str] = None
    scenario_settings: ScenarioSettings
    created_at: datetime
    updated_at: datetime

    @before_event(Insert)
    def before_insert(self):
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    @before_event(Update)
    def before_update(self):
        self.updated_at = datetime.now()

    class Settings:
        name = "scenarios"
