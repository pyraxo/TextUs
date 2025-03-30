from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.customer import Customer
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioUpdate,
    ScenarioUpdateHistory,
)
from app.models.scenario_customer import ScenarioCustomer


async def get_scenarios(
    scheme_id: Optional[str] = None, session: Session = Depends(get_session)
):
    """Get all scenarios, optionally filtered by scheme_id."""
    statement = select(Scenario)
    if scheme_id:
        try:
            # Convert string to UUID
            scheme_uuid = UUID(scheme_id)
            statement = statement.where(Scenario.scheme_id == scheme_uuid)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid scheme_id format. Must be a valid UUID.",
            ) from e
    results = session.exec(statement).all()
    return results


async def create_scenario(
    scenario_data: ScenarioCreate, session: Session = Depends(get_session)
) -> Scenario:
    """Create a new scenario."""
    # Create the scenario with the settings
    scenario = Scenario.model_validate(scenario_data)

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def get_scenario(
    scenario_id: str, session: Session = Depends(get_session)
) -> Scenario:
    """Get a scenario by ID."""
    try:
        # Convert string to UUID
        scenario_uuid = UUID(scenario_id)
        statement = select(Scenario).where(Scenario.id == scenario_uuid)
        scenario = session.exec(statement).first()
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return scenario
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid scenario_id format. Must be a valid UUID.",
        ) from e


async def update_scenario(
    scenario_id: str,
    scenario_data: ScenarioUpdate,
    session: Session = Depends(get_session),
) -> Scenario:
    """Update a scenario."""
    scenario = await get_scenario(scenario_id, session)

    # Update scenario fields
    for key, value in scenario_data.dict(exclude_unset=True).items():
        setattr(scenario, key, value)

    scenario.update_timestamp()
    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def add_customer_to_scenario(
    scenario_id: str,
    customer_data: ScenarioAddCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    """Add a customer to a scenario."""
    scenario = await get_scenario(scenario_id, session)

    customer_statement = select(Customer).where(
        Customer.id == customer_data.customer_id
    )
    customer = session.exec(customer_statement).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    scenario.scenario_customers.append(
        ScenarioCustomer(customer=customer, name=customer.name, chat_history=[])
    )

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def remove_customer_from_scenario(
    scenario_id: str,
    customer_data: ScenarioRemoveCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    """Remove a customer from a scenario."""
    scenario = await get_scenario(scenario_id, session)

    # Find the customer scenario to remove
    scenario_customer_index = None
    for i, cs in enumerate(scenario.scenario_customers):
        if cs.customer_id == customer_data.customer_id:
            scenario_customer_index = i
            break

    if scenario_customer_index is None:
        raise HTTPException(status_code=400, detail="Customer not found in scenario")

    scenario.scenario_customers.pop(scenario_customer_index)

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def update_scenario_history(
    scenario_id: str,
    history_data: ScenarioUpdateHistory,
    session: Session = Depends(get_session),
) -> Scenario:
    """Update the history of a scenario."""
    scenario = await get_scenario(scenario_id, session)

    # Find the customer scenario
    scenario_customer = None
    for cs in scenario.scenario_customers:
        if cs.customer_id == history_data.customer_id:
            scenario_customer = cs
            break

    if not scenario_customer:
        raise HTTPException(status_code=404, detail="Customer not found in scenario")

    scenario_customer.chat_history = history_data.history

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario
