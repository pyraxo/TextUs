from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioStart,
    ScenarioUpdate,
    ScenarioUpdateHistory,
)
from app.models.scenario_session import ScenarioSession
from app.services import scenario_service, trainee_service

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/")
async def get_scenarios(
    scheme_id: Optional[str] = None, session: Session = Depends(get_session)
) -> list[Scenario]:
    """Get all scenarios, optionally filtered by scheme_id."""
    return await scenario_service.get_scenarios(scheme_id=scheme_id, session=session)


@router.post("/")
async def create_scenario(
    scenario_data: ScenarioCreate, session: Session = Depends(get_session)
) -> Scenario:
    """Create a new scenario."""
    return await scenario_service.create_scenario(scenario_data, session=session)


@router.get("/{scenario_id}")
async def get_scenario(
    scenario_id: str, session: Session = Depends(get_session)
) -> Scenario:
    """Get a scenario by ID."""
    return await scenario_service.get_scenario(scenario_id, session=session)


@router.put("/{scenario_id}")
async def update_scenario(
    scenario_id: str,
    scenario_data: ScenarioUpdate,
    session: Session = Depends(get_session),
) -> Scenario:
    """Update a scenario."""
    return await scenario_service.update_scenario(
        scenario_id, scenario_data, session=session
    )


@router.post("/{scenario_id}/customers")
async def add_customer_to_scenario(
    scenario_id: str,
    customer_data: ScenarioAddCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    """Add a customer to a scenario."""
    return await scenario_service.add_customer_to_scenario(
        scenario_id, customer_data, session=session
    )


@router.delete("/{scenario_id}/customers")
async def remove_customer_from_scenario(
    scenario_id: str,
    customer_data: ScenarioRemoveCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    """Remove a customer from a scenario."""
    return await scenario_service.remove_customer_from_scenario(
        scenario_id, customer_data, session=session
    )


@router.put("/{scenario_id}/history")
async def update_scenario_history(
    scenario_id: str,
    history_data: ScenarioUpdateHistory,
    session: Session = Depends(get_session),
) -> Scenario:
    """Update the history of a scenario."""
    return await scenario_service.update_scenario_history(
        scenario_id, history_data, session=session
    )


@router.post("/{scenario_id}/start")
async def start_scenario(
    scenario_id: str,
    scenario_data: ScenarioStart,
    session: Session = Depends(get_session),
) -> ScenarioSession:
    """Start a scenario."""
    return await trainee_service.start_scenario(
        trainee_id=parse_uuid(scenario_data.trainee_id),
        scenario_id=parse_uuid(scenario_id),
        session=session,
    )
