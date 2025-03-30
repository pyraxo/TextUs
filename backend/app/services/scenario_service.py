from uuid import UUID

from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

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


class ScenarioService:
    """Service for scenario operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_scenarios(self):
        """Get all scenarios."""
        statement = select(Scenario)
        results = (await self.session.exec(statement)).all()
        return results

    async def create_scenario(self, scenario_data: ScenarioCreate) -> Scenario:
        """Create a new scenario."""
        # Create the scenario with the settings
        scenario = Scenario.model_validate(scenario_data)

        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario

    async def get_scenario(self, scenario_id: str) -> Scenario:
        """Get a scenario by ID."""
        try:
            # Convert string to UUID
            scenario_uuid = UUID(scenario_id)
            statement = select(Scenario).where(Scenario.id == scenario_uuid)
            scenario = (await self.session.exec(statement)).first()
            if not scenario:
                raise HTTPException(status_code=404, detail="Scenario not found")
            return scenario
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid scenario_id format. Must be a valid UUID.",
            ) from e

    async def update_scenario(
        self,
        scenario_id: str,
        scenario_data: ScenarioUpdate,
    ) -> Scenario:
        """Update a scenario."""
        scenario = await self.get_scenario(scenario_id)

        # Update scenario fields
        for key, value in scenario_data.dict(exclude_unset=True).items():
            setattr(scenario, key, value)

        scenario.update_timestamp()
        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario

    async def add_customer_to_scenario(
        self,
        scenario_id: str,
        customer_data: ScenarioAddCustomer,
    ) -> Scenario:
        """Add a customer to a scenario."""
        scenario = await self.get_scenario(scenario_id)

        customer_statement = select(Customer).where(
            Customer.id == customer_data.customer_id
        )
        customer = (await self.session.exec(customer_statement)).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        scenario.scenario_customers.append(
            ScenarioCustomer(customer=customer, name=customer.name, chat_history=[])
        )

        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario

    async def remove_customer_from_scenario(
        self,
        scenario_id: str,
        customer_data: ScenarioRemoveCustomer,
    ) -> Scenario:
        """Remove a customer from a scenario."""
        scenario = await self.get_scenario(scenario_id)

        # Find the customer scenario to remove
        scenario_customer_index = None
        for i, cs in enumerate(scenario.scenario_customers):
            if cs.customer_id == customer_data.customer_id:
                scenario_customer_index = i
                break

        if scenario_customer_index is None:
            raise HTTPException(
                status_code=400, detail="Customer not found in scenario"
            )

        scenario.scenario_customers.pop(scenario_customer_index)

        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario

    async def update_scenario_history(
        self,
        scenario_id: str,
        history_data: ScenarioUpdateHistory,
    ) -> Scenario:
        """Update the history of a scenario."""
        scenario = await self.get_scenario(scenario_id)

        # Find the customer scenario
        scenario_customer = None
        for cs in scenario.scenario_customers:
            if cs.customer_id == history_data.customer_id:
                scenario_customer = cs
                break

        if not scenario_customer:
            raise HTTPException(
                status_code=404, detail="Customer not found in scenario"
            )

        scenario_customer.chat_history = history_data.history

        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario
