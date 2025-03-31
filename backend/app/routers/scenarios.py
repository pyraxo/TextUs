from typing import Annotated, List

from fastapi import APIRouter, Depends

from app.core.common import parse_uuid
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioStart,
    ScenarioUpdate,
    ScenarioUpdateHistory,
)
from app.models.scenario_customer import ScenarioCustomer, ScenarioCustomerUpdate
from app.models.scenario_session import ScenarioSession
from app.services.scenario_service import ScenarioService
from app.services.trainee_service import TraineeService

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/")
async def get_scenarios(
    scenario_service: Annotated[ScenarioService, Depends()],
) -> list[Scenario]:
    """Get all scenarios."""
    return await scenario_service.get_scenarios()


@router.post("/")
async def create_scenario(
    scenario_data: ScenarioCreate,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Create a new scenario."""
    return await scenario_service.create_scenario(scenario_data)


@router.get("/{scenario_id}")
async def get_scenario(
    scenario_id: str,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Get a scenario by ID."""
    return await scenario_service.get_scenario(scenario_id)


@router.get("/{scenario_id}/customers")
async def get_scenario_customers(
    scenario_id: str,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> List[ScenarioCustomer]:
    """Get all customers for a scenario."""
    return await scenario_service.get_scenario_customers(scenario_id)


@router.put("/{scenario_id}")
async def update_scenario(
    scenario_id: str,
    scenario_data: ScenarioUpdate,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Update a scenario."""
    return await scenario_service.update_scenario(scenario_id, scenario_data)


@router.post("/{scenario_id}/customers")
async def add_customer_to_scenario(
    scenario_id: str,
    customer_data: ScenarioAddCustomer,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Add a customer to a scenario."""
    return await scenario_service.add_customer_to_scenario(scenario_id, customer_data)


@router.delete("/{scenario_id}/customers")
async def remove_customer_from_scenario(
    scenario_id: str,
    customer_data: ScenarioRemoveCustomer,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Remove a customer from a scenario."""
    return await scenario_service.remove_customer_from_scenario(
        scenario_id, customer_data
    )


@router.put("/{scenario_id}/history")
async def update_scenario_history(
    scenario_id: str,
    history_data: ScenarioUpdateHistory,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> Scenario:
    """Update the history of a scenario."""
    return await scenario_service.update_scenario_history(scenario_id, history_data)


@router.post("/{scenario_id}/start")
async def start_scenario(
    scenario_id: str,
    scenario_data: ScenarioStart,
    trainee_service: Annotated[TraineeService, Depends()],
) -> ScenarioSession:
    """Start a scenario."""
    return await trainee_service.start_scenario(
        trainee_id=parse_uuid(scenario_data.trainee_id),
        scenario_id=parse_uuid(scenario_id),
    )


@router.put("/{scenario_id}/customers/{customer_id}")
async def update_scenario_customer(
    scenario_id: str,
    customer_id: str,
    customer_data: ScenarioCustomerUpdate,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> ScenarioCustomer:
    """Update a customer in a scenario."""
    return await scenario_service.update_scenario_customer(
        scenario_id, customer_id, customer_data
    )


@router.delete("/{scenario_id}")
async def delete_scenario(
    scenario_id: str,
    scenario_service: Annotated[ScenarioService, Depends()],
) -> None:
    """Delete a scenario."""
    return await scenario_service.delete_scenario(scenario_id)
