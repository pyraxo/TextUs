from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.models.scheme import SchemeCreate, SchemeRead, SchemeUpdate
from app.services import scheme_service

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("/", response_model=List[SchemeRead])
async def get_schemes(
    session: Session = Depends(get_session),
):
    """Get all schemes."""
    return await scheme_service.get_schemes(session)


@router.post("/", response_model=SchemeRead, status_code=201)
async def create_scheme(scheme: SchemeCreate, session: Session = Depends(get_session)):
    """Create a new scheme."""
    return await scheme_service.create_scheme(scheme, session)


@router.get("/{id_or_slug}", response_model=SchemeRead)
async def get_scheme(id_or_slug: str, session: Session = Depends(get_session)):
    """Get a scheme by ID or slug."""
    return await scheme_service.get_scheme_by_id_or_slug(id_or_slug, session)


@router.put("/{id_or_slug}", response_model=SchemeRead)
async def update_scheme(
    id_or_slug: str, scheme: SchemeUpdate, session: Session = Depends(get_session)
):
    """Update a scheme."""
    # First find the scheme by ID or slug
    existing_scheme = await scheme_service.get_scheme_by_id_or_slug(id_or_slug, session)
    return await scheme_service.update_scheme(str(existing_scheme.id), scheme, session)


@router.delete("/{id_or_slug}")
async def delete_scheme(id_or_slug: str, session: Session = Depends(get_session)):
    """Delete a scheme."""
    # First find the scheme by ID or slug
    existing_scheme = await scheme_service.get_scheme_by_id_or_slug(id_or_slug, session)
    return await scheme_service.delete_scheme(str(existing_scheme.id), session)


@router.get("/{id_or_slug}/scenarios")
async def get_scheme_scenarios(
    id_or_slug: str, session: Session = Depends(get_session)
):
    """Get all scenarios for a scheme."""
    # First find the scheme by ID or slug
    existing_scheme = await scheme_service.get_scheme_by_id_or_slug(id_or_slug, session)
    return await scheme_service.get_scheme_scenarios(str(existing_scheme.id), session)
