import uuid


import pytest
from app.models.scheme import SchemeCreate, SchemeUpdate
from app.services.scheme_service import SchemeService
from fastapi import HTTPException


def create_test_scheme_data(identifier: str = "") -> SchemeCreate:
    return SchemeCreate(
        name=f"Test Scheme {identifier}",
        description="Test scheme description",
    )


@pytest.mark.asyncio
async def test_get_schemes(scheme_service: SchemeService):
    # Test fetching all schemes returns created entries
    await scheme_service.create_scheme(create_test_scheme_data("list1"))
    await scheme_service.create_scheme(create_test_scheme_data("list2"))
    schemes = await scheme_service.get_schemes()
    assert len(schemes) >= 2


@pytest.mark.asyncio
async def test_create_scheme(scheme_service: SchemeService):
    # Test creating a new scheme and slug generation
    scheme_data = create_test_scheme_data("create")
    scheme = await scheme_service.create_scheme(scheme_data)

    assert scheme.name == scheme_data.name
    assert scheme.slug is not None
    assert scheme.description == scheme_data.description


@pytest.mark.asyncio
async def test_get_scheme(scheme_service: SchemeService):
    # Test retrieving a scheme by ID
    scheme_data = create_test_scheme_data("get")
    created = await scheme_service.create_scheme(scheme_data)
    fetched = await scheme_service.get_scheme(created.id)

    assert fetched.id == created.id
    assert fetched.name == created.name


@pytest.mark.asyncio
async def test_get_scheme_not_found(scheme_service: SchemeService):
    # Test retrieving a non-existent scheme raises 404
    with pytest.raises(HTTPException) as exc_info:
        await scheme_service.get_scheme(str(uuid.uuid4()))
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_scheme_by_slug(scheme_service: SchemeService):
    # Test retrieving a scheme by slug
    scheme_data = create_test_scheme_data("slug")
    created = await scheme_service.create_scheme(scheme_data)
    fetched = await scheme_service.get_scheme_by_slug(created.slug)
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_update_scheme(scheme_service: SchemeService):
    # Test updating a scheme's name and auto-generating a new slug
    scheme_data = create_test_scheme_data("update")
    created = await scheme_service.create_scheme(scheme_data)
    update_data = SchemeUpdate(name="Updated Scheme Name")
    updated = await scheme_service.update_scheme(created.id, update_data)

    assert updated.name == update_data.name
    assert updated.slug.startswith("updated-scheme-name")


@pytest.mark.asyncio
async def test_update_scheme_duplicate_slug(scheme_service: SchemeService):
    # Test updating a scheme to use an already-existing slug raises 400
    scheme1 = await scheme_service.create_scheme(create_test_scheme_data("dup1"))
    scheme2 = await scheme_service.create_scheme(create_test_scheme_data("dup2"))
    update_data = SchemeUpdate(slug=scheme1.slug)

    with pytest.raises(HTTPException) as exc_info:
        await scheme_service.update_scheme(scheme2.id, update_data)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_delete_scheme(scheme_service: SchemeService):
    # Test deleting a scheme and ensuring it no longer exists
    scheme = await scheme_service.create_scheme(create_test_scheme_data("delete"))
    await scheme_service.delete_scheme(scheme.id)

    with pytest.raises(HTTPException) as exc_info:
        await scheme_service.get_scheme(scheme.id)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_scheme_scenarios(scheme_service: SchemeService):
    # Test fetching scenarios related to a scheme returns a list
    scheme = await scheme_service.create_scheme(create_test_scheme_data("scenarios"))
    scenarios = await scheme_service.get_scheme_scenarios(scheme.id)
    assert isinstance(scenarios, list)


@pytest.mark.asyncio
async def test_create_scheme_scenario(scheme_service: SchemeService):
    # Test creating a scenario for a scheme
    from app.models.scenario import ScenarioCreate

    scheme = await scheme_service.create_scheme(create_test_scheme_data("scenario"))
    scenario_data = ScenarioCreate(
        name="Scenario 1",
        description="Test scenario",
    )

    scenario = await scheme_service.create_scheme_scenario(scheme.id, scenario_data)
    assert scenario.name == scenario_data.name
    assert scenario.scheme_id == scheme.id
