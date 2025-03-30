from typing import Annotated, List

from fastapi import APIRouter, Depends, status

from app.models.scenario import Scenario
from app.models.scheme import SchemeCreate, SchemeRead, SchemeUpdate
from app.services.scheme_service import SchemeService

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("/", response_model=List[SchemeRead])
async def get_schemes(
    scheme_service: Annotated[SchemeService, Depends()],
):
    """Get all schemes."""
    return await scheme_service.get_schemes()


@router.post("/", response_model=SchemeRead, status_code=201)
async def create_scheme(
    scheme: SchemeCreate, scheme_service: Annotated[SchemeService, Depends()]
):
    """Create a new scheme."""
    return await scheme_service.create_scheme(scheme)


@router.get("/{id_or_slug}", response_model=SchemeRead)
async def get_scheme(
    id_or_slug: str, scheme_service: Annotated[SchemeService, Depends()]
):
    """Get a scheme by ID or slug."""
    return await scheme_service.get_scheme_by_id_or_slug(id_or_slug)


@router.put("/{id_or_slug}", response_model=SchemeRead)
async def update_scheme(
    id_or_slug: str,
    scheme: SchemeUpdate,
    scheme_service: Annotated[SchemeService, Depends()],
):
    """Update a scheme."""
    return await scheme_service.update_scheme(id_or_slug, scheme)


@router.delete("/{id_or_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scheme(
    id_or_slug: str, scheme_service: Annotated[SchemeService, Depends()]
):
    """Delete a scheme."""
    await scheme_service.delete_scheme(id_or_slug)
    return None


@router.get("/{id_or_slug}/scenarios")
async def get_scheme_scenarios(
    id_or_slug: str, scheme_service: Annotated[SchemeService, Depends()]
) -> List[Scenario]:
    """Get all scenarios for a scheme."""
    return await scheme_service.get_scheme_scenarios(id_or_slug)
