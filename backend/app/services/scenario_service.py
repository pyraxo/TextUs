from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.customer import Customer
from app.models.customer_scenario import CustomerScenario
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioUpdate,
    ScenarioUpdateHistory,
)
from app.models.user_scenario_session import UserScenarioSession


async def get_scenarios(session: Session = Depends(get_session)):
    """Get all scenarios."""
    statement = select(Scenario)
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
    scenario_id: int, session: Session = Depends(get_session)
) -> Scenario:
    """Get a scenario by ID."""
    statement = select(Scenario).where(Scenario.id == scenario_id)
    scenario = session.exec(statement).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


async def update_scenario(
    scenario_id: int,
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
    scenario_id: int,
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

    scenario.customer_scenarios.append(
        CustomerScenario(customer=customer, name=customer.name, chat_history=[])
    )

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def remove_customer_from_scenario(
    scenario_id: int,
    customer_data: ScenarioRemoveCustomer,
    session: Session = Depends(get_session),
) -> Scenario:
    """Remove a customer from a scenario."""
    scenario = await get_scenario(scenario_id, session)

    # Find the customer scenario to remove
    customer_scenario_index = None
    for i, cs in enumerate(scenario.customer_scenarios):
        if cs.customer_id == customer_data.customer_id:
            customer_scenario_index = i
            break

    if customer_scenario_index is None:
        raise HTTPException(status_code=400, detail="Customer not found in scenario")

    scenario.customer_scenarios.pop(customer_scenario_index)

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def update_scenario_history(
    scenario_id: int,
    history_data: ScenarioUpdateHistory,
    session: Session = Depends(get_session),
) -> Scenario:
    """Update the history of a scenario."""
    scenario = await get_scenario(scenario_id, session)

    # Find the customer scenario
    customer_scenario = None
    for cs in scenario.customer_scenarios:
        if cs.customer_id == history_data.customer_id:
            customer_scenario = cs
            break

    if not customer_scenario:
        raise HTTPException(status_code=404, detail="Customer not found in scenario")

    customer_scenario.chat_history = history_data.history

    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario


async def start_scenario(
    scenario_id: int, user_id: int, session: Session = Depends(get_session)
) -> Scenario:
    """Start a scenario."""
    scenario = await get_scenario(scenario_id, session)
    user_scenario_session = UserScenarioSession(
        user_id=user_id,
        scenario_id=scenario.id,
    )
    session.add(user_scenario_session)
    session.commit()
    session.refresh(user_scenario_session)
    return user_scenario_session
