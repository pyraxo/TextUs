import pytest
import uuid
from fastapi import HTTPException
from app.models.scenario import ScenarioCreate, ScenarioUpdate, ScenarioAddCustomer, ScenarioRemoveCustomer
from app.models.scenario_customer import ScenarioCustomerUpdate
from app.models.customer import Customer
from app.services.scenario_service import ScenarioService


@pytest.mark.asyncio
async def test_get_scenarios(scenario_service: ScenarioService):
    # Test retrieving all scenarios
    await scenario_service.create_scenario(ScenarioCreate(name="Scenario A"))
    await scenario_service.create_scenario(ScenarioCreate(name="Scenario B"))
    scenarios = await scenario_service.get_scenarios()
    assert len(scenarios) >= 2


@pytest.mark.asyncio
async def test_create_scenario(scenario_service: ScenarioService):
    # Test creating a scenario
    scenario = await scenario_service.create_scenario(ScenarioCreate(name="Create Test"))
    assert scenario.name == "Create Test"


@pytest.mark.asyncio
async def test_get_scenario(scenario_service: ScenarioService):
    # Test retrieving a scenario by ID
    created = await scenario_service.create_scenario(ScenarioCreate(name="Get Test"))
    fetched = await scenario_service.get_scenario(str(created.id))
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_get_scenario_not_found(scenario_service: ScenarioService):
    # Test retrieving a non-existent scenario
    with pytest.raises(HTTPException) as exc:
        await scenario_service.get_scenario(str(uuid.uuid4()))
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_update_scenario(scenario_service: ScenarioService):
    # Test updating a scenario
    created = await scenario_service.create_scenario(ScenarioCreate(name="Update Me"))
    updated = await scenario_service.update_scenario(str(created.id), ScenarioUpdate(name="Updated Name"))
    assert updated.name == "Updated Name"


@pytest.mark.asyncio
async def test_add_customer_to_scenario(scenario_service: ScenarioService):
    # Test adding a customer to a scenario
    scenario = await scenario_service.create_scenario(ScenarioCreate(name="AddCust"))
    customer = Customer(name="Customer A")
    scenario_service.session.add(customer)
    await scenario_service.session.commit()

    updated = await scenario_service.add_customer_to_scenario(
        str(scenario.id),
        ScenarioAddCustomer(customer_id=customer.id, name="Alias")
    )
    assert len(updated.scenario_customers) == 1


@pytest.mark.asyncio
async def test_remove_customer_from_scenario(scenario_service: ScenarioService):
    # Test removing a customer from a scenario
    scenario = await scenario_service.create_scenario(ScenarioCreate(name="RemoveCust"))
    customer = Customer(name="Customer B")
    scenario_service.session.add(customer)
    await scenario_service.session.commit()
    updated = await scenario_service.add_customer_to_scenario(
        str(scenario.id),
        ScenarioAddCustomer(customer_id=customer.id)
    )
    removed = await scenario_service.remove_customer_from_scenario(
        str(scenario.id),
        ScenarioRemoveCustomer(customer_id=customer.id)
    )
    assert len(removed.scenario_customers) == 0


@pytest.mark.asyncio
async def test_update_scenario_customer(scenario_service: ScenarioService):
    # Test updating scenario customer attributes
    scenario = await scenario_service.create_scenario(ScenarioCreate(name="CustUpdate"))
    customer = Customer(name="Customer C")
    scenario_service.session.add(customer)
    await scenario_service.session.commit()
    updated = await scenario_service.add_customer_to_scenario(
        str(scenario.id), ScenarioAddCustomer(customer_id=customer.id)
    )
    updated_cust = await scenario_service.update_scenario_customer(
        str(scenario.id), str(customer.id), ScenarioCustomerUpdate(name="NewName")
    )
    assert updated_cust.name == "NewName"


@pytest.mark.asyncio
async def test_delete_scenario(scenario_service: ScenarioService):
    # Test deleting a scenario
    scenario = await scenario_service.create_scenario(ScenarioCreate(name="DeleteTest"))
    await scenario_service.delete_scenario(str(scenario.id))
    with pytest.raises(HTTPException):
        await scenario_service.get_scenario(str(scenario.id))