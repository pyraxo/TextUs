from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioUpdate,
    ScenarioUpdateHistory,
)
from app.services import scenario_service

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/")
async def get_scenarios(session: Session = Depends(get_session)) -> list[Scenario]:
    return await scenario_service.get_scenarios(session=session)


@router.post("/")
async def create_scenario(
    scenario_data: ScenarioCreate, session: Session = Depends(get_session)
) -> Scenario:
    return await scenario_service.create_scenario(scenario_data, session=session)


@router.put("/{scenario_id}")
async def update_scenario(
    scenario_id: int,
    scenario_data: ScenarioUpdate,
    session: Session = Depends(get_session),
) -> Scenario:
    return await scenario_service.update_scenario(
        scenario_id, scenario_data, session=session
    )


@router.post("/{scenario_id}/customers")
async def add_customer_to_scenario(
    scenario_id: int,
    customer_data: ScenarioAddCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    return await scenario_service.add_customer_to_scenario(
        scenario_id, customer_data, session=session
    )


@router.delete("/{scenario_id}/customers")
async def remove_customer_from_scenario(
    scenario_id: int,
    customer_data: ScenarioRemoveCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    return await scenario_service.remove_customer_from_scenario(
        scenario_id, customer_data, session=session
    )


@router.put("/{scenario_id}/history")
async def update_scenario_history(
    scenario_id: int,
    history_data: ScenarioUpdateHistory,
    session: Session = Depends(get_session),
) -> Scenario:
    return await scenario_service.update_scenario_history(
        scenario_id, history_data, session=session
    )
