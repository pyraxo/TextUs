from typing import List, Optional

from pydantic import BaseModel


class ScenarioSettings(BaseModel):
    """Scenario settings schema."""

    name: str
    description: Optional[str] = None
    system_prompt: str
    temperature: Optional[float] = 1.0


class ScenarioCreateDto(BaseModel):
    """Scenario create DTO."""

    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = "You are a confused customer."


class ScenarioUpdateDto(BaseModel):
    """Scenario update DTO."""

    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    is_pausable: Optional[bool] = None


class ScenarioAddCustomerDto(BaseModel):
    """Scenario add customer DTO."""

    customer_id: str


class ScenarioRemoveCustomerDto(BaseModel):
    """Scenario remove customer DTO."""

    customer_id: str


class ScenarioUpdateCustomerDto(BaseModel):
    """Scenario update customer DTO."""

    customer_id: str
    name: Optional[str] = None
    profile_prompt: Optional[str] = None


class ScenarioUpdateHistoryDto(BaseModel):
    """Scenario add history DTO."""

    customer_id: str
    history: List[str]
