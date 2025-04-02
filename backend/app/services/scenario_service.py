from typing import List

from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.customer import Customer
from app.models.scenario import (
    Scenario,
    ScenarioAddCustomer,
    ScenarioCreate,
    ScenarioRemoveCustomer,
    ScenarioUpdate,
)
from app.models.scenario_customer import ScenarioCustomer, ScenarioCustomerUpdate


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
        # Convert string to UUID
        scenario_uuid = parse_uuid(scenario_id)
        statement = select(Scenario).where(Scenario.id == scenario_uuid)
        scenario = (await self.session.exec(statement)).first()
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return scenario

    async def get_scenario_customers(self, scenario_id: str) -> List[ScenarioCustomer]:
        """Get all customers for a scenario."""
        scenario = await self.get_scenario(scenario_id)
        scenario_customers = select(ScenarioCustomer).where(
            ScenarioCustomer.scenario_id == scenario.id
        )
        return (await self.session.exec(scenario_customers)).all()

    async def get_scenario_customer(
        self, scenario_id: str, customer_id: str
    ) -> ScenarioCustomer:
        """Get a scenario-specific customer."""
        scenario_uuid = parse_uuid(scenario_id)
        customer_uuid = parse_uuid(customer_id)
        scenario_customer = select(ScenarioCustomer).where(
            ScenarioCustomer.scenario_id == scenario_uuid,
            ScenarioCustomer.customer_id == customer_uuid,
        )
        return (await self.session.exec(scenario_customer)).first()

    async def update_scenario(
        self,
        scenario_id: str,
        scenario_data: ScenarioUpdate,
    ) -> Scenario:
        """Update a scenario."""
        scenario = await self.get_scenario(scenario_id)

        # Update scenario fields
        for key, value in scenario_data.model_dump(exclude_unset=True).items():
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

        # Explicitly load scenario_customers before appending to it
        await self.session.refresh(scenario, ["scenario_customers"])

        # Use provided name or default to customer name
        customer_name = customer_data.name if customer_data.name else customer.name

        # Now we can safely append to the relationship
        scenario.scenario_customers.append(
            ScenarioCustomer(customer=customer, name=customer_name)
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
        customer_uuid = customer_data.customer_id

        # Explicitly load scenario_customers before accessing it
        await self.session.refresh(scenario, ["scenario_customers"])

        # Use the id field from customer_data to specifically identify which customer instance to remove
        if hasattr(customer_data, "id") and customer_data.id:
            # If specific scenario_customer ID is provided, use it
            statement = select(ScenarioCustomer).where(
                ScenarioCustomer.id == customer_data.id,
                ScenarioCustomer.scenario_id == scenario.id,
            )
            scenario_customer = (await self.session.exec(statement)).first()
        else:
            # Find the first scenario_customer with matching customer_id
            # This is the legacy behavior but can cause issues with multiple instances
            scenario_customer = None
            for cs in scenario.scenario_customers:
                if cs.customer_id == customer_uuid:
                    scenario_customer = cs
                    break

        if not scenario_customer:
            raise HTTPException(
                status_code=400, detail="Customer not found in scenario"
            )

        # Instead of modifying the relationship directly, delete the scenario_customer
        await self.session.delete(scenario_customer)
        await self.session.commit()

        # Refresh the scenario to reflect the changes
        await self.session.refresh(scenario, ["scenario_customers"])
        return scenario

    async def update_scenario_customer(
        self,
        scenario_id: str,
        customer_id: str,
        customer_data: ScenarioCustomerUpdate,
    ) -> ScenarioCustomer:
        """Update a customer in a scenario."""
        scenario = await self.get_scenario(scenario_id)
        customer_uuid = parse_uuid(customer_id)

        # Explicitly load scenario_customers before accessing
        await self.session.refresh(scenario, ["scenario_customers"])

        # Find the scenario_customer to update
        scenario_customer = None
        for cs in scenario.scenario_customers:
            if cs.customer_id == customer_uuid:
                scenario_customer = cs
                break

        if not scenario_customer:
            raise HTTPException(
                status_code=404, detail="Customer not found in scenario"
            )

        # Update scenario_customer fields
        for key, value in customer_data.model_dump(exclude_unset=True).items():
            if key == "expected_queries":
                scenario_customer.expected_queries = value
            else:
                setattr(scenario_customer, key, value)

        self.session.add(scenario_customer)
        await self.session.commit()
        await self.session.refresh(scenario_customer)
        return scenario_customer

    async def delete_scenario(self, scenario_id: str) -> None:
        """Delete a scenario by ID."""
        scenario = await self.get_scenario(scenario_id)

        # Delete the scenario
        await self.session.delete(scenario)
        await self.session.commit()
        return None

    # async def update_scenario_history(
    #     self,
    #     scenario_id: str,
    #     history_data: ScenarioUpdateHistory,
    # ) -> Scenario:
    #     """Update the history of a scenario."""
    #     scenario = await self.get_scenario(scenario_id)

    #     # Find the customer scenario
    #     scenario_customer = None
    #     for cs in scenario.scenario_customers:
    #         if cs.customer_id == history_data.customer_id:
    #             scenario_customer = cs
    #             break

    #     if not scenario_customer:
    #         raise HTTPException(
    #             status_code=404, detail="Customer not found in scenario"
    #         )

    #     scenario_customer.chat_history = history_data.history

    #     self.session.add(scenario)
    #     await self.session.commit()
    #     await self.session.refresh(scenario)
    #     return scenario
