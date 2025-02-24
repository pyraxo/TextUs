from fastapi import APIRouter

from app.models.scenario import Scenario
from app.services import scenario_service

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/")
async def get_scenarios() -> list[Scenario]:
    return await scenario_service.get_scenarios()


@router.post("/")
async def create_scenario(scenario: Scenario) -> Scenario:
    return await scenario_service.create_scenario(scenario)
