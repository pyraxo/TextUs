import uuid
from datetime import datetime, timedelta

import pytest
from app.models.scenario import Scenario
from app.models.scenario_customer import ScenarioCustomer
from app.models.scenario_session import ScenarioSession, SessionStatus
from app.models.user import User
from app.services.trainee_service import TraineeService


@pytest.mark.asyncio
async def test_validate_scenario_prerequisites(trainee_service: TraineeService):
    # Test validation passes when trainee and scenario exist
    user = User(name="Test User")
    scenario = Scenario(name="Test Scenario")
    trainee_service.session.add(user)
    trainee_service.session.add(scenario)
    await trainee_service.session.commit()

    result = await trainee_service.validate_scenario_prerequisites(user.id, scenario.id)
    assert result[0].id == user.id
    assert result[1].id == scenario.id


@pytest.mark.asyncio
async def test_start_scenario(trainee_service: TraineeService):
    # Test starting a new scenario session
    user = User(name="Test User")
    scenario = Scenario(name="Test Scenario")
    trainee_service.session.add(user)
    trainee_service.session.add(scenario)
    await trainee_service.session.commit()

    session = await trainee_service.start_scenario(user.id, scenario.id)
    assert session.user_id == user.id
    assert session.scenario_id == scenario.id


@pytest.mark.asyncio
async def test_complete_scenario(trainee_service: TraineeService):
    # Test completing a session without active conversations
    session = ScenarioSession()
    trainee_service.session.add(session)
    await trainee_service.session.commit()

    completed = await trainee_service.complete_scenario(
        session.id, SessionStatus.COMPLETED
    )
    assert completed.end_timestamp is not None


@pytest.mark.asyncio
async def test_get_active_session_none(trainee_service: TraineeService):
    # Test getting active session returns None when none exists
    user = User(name="Test User")
    trainee_service.session.add(user)
    await trainee_service.session.commit()

    session = await trainee_service.get_active_session(user.id)
    assert session is None


@pytest.mark.asyncio
async def test_get_session_metrics(trainee_service: TraineeService):
    # Test session metrics calculation for completed session
    session = ScenarioSession(
        start_timestamp=datetime.now() - timedelta(minutes=5),
        end_timestamp=datetime.now(),
    )
    trainee_service.session.add(session)
    await trainee_service.session.commit()

    metrics = await trainee_service.get_session_metrics(session.id)
    assert metrics.duration_seconds is not None


# TODO: Below tests are outdated


@pytest.mark.asyncio
async def test_start_trainee_conversation(trainee_service: TraineeService):
    # Test starting a new trainee conversation
    scenario = Scenario(name="Test Scenario")
    customer = ScenarioCustomer(name="Customer", scenario_id=scenario.id)
    trainee_service.session.add(scenario)
    trainee_service.session.add(customer)
    await trainee_service.session.commit()

    conv = await trainee_service.start_trainee_conversation(
        scenario.id, customer.id, "Hello"
    )
    assert conv.customer_id == customer.id
    assert conv.scenario_id == scenario.id


@pytest.mark.asyncio
async def test__get_scenario_customer_valid(trainee_service: TraineeService):
    # Test successful retrieval of a scenario customer
    scenario = Scenario(name="Scenario A")
    customer = ScenarioCustomer(name="Customer A", scenario_id=scenario.id)
    trainee_service.session.add(scenario)
    trainee_service.session.add(customer)
    await trainee_service.session.commit()

    result = await trainee_service._get_scenario_customer(scenario.id, customer.id)
    assert result.id == customer.id


@pytest.mark.asyncio
async def test__get_scenario_customer_not_found(trainee_service: TraineeService):
    # Test retrieval failure when customer does not exist
    scenario_id = uuid.uuid4()
    customer_id = uuid.uuid4()
    with pytest.raises(ValueError):
        await trainee_service._get_scenario_customer(scenario_id, customer_id)
