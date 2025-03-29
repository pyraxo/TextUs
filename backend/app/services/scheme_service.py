from uuid import UUID

from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.scenario import Scenario, ScenarioCreate
from app.models.scheme import Scheme, SchemeCreate, SchemeUpdate, generate_slug


async def get_schemes(session: Session = Depends(get_session)):
    """Get all schemes."""
    statement = select(Scheme)
    results = session.exec(statement).all()
    return results


async def get_scheme(scheme_id: str, session: Session = Depends(get_session)):
    """Get a scheme by ID."""
    try:
        statement = select(Scheme).where(Scheme.id == scheme_id)
        scheme = session.exec(statement).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        return scheme
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid scheme_id format. Must be a valid UUID.",
        ) from e


async def get_scheme_by_slug(slug: str, session: Session = Depends(get_session)):
    """Get a scheme by slug."""
    statement = select(Scheme).where(Scheme.slug == slug)
    scheme = session.exec(statement).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


async def create_scheme(
    scheme_data: SchemeCreate, session: Session = Depends(get_session)
) -> Scheme:
    """Create a new scheme."""
    scheme_dict = scheme_data.model_dump()

    # Generate a slug if not provided
    if not scheme_dict.get("slug") and scheme_dict.get("name"):
        scheme_dict["slug"] = generate_slug(scheme_dict["name"])

    # Check if the slug already exists
    if scheme_dict.get("slug"):
        existing = session.exec(
            select(Scheme).where(Scheme.slug == scheme_dict["slug"])
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"A scheme with slug '{scheme_dict['slug']}' already exists",
            )

    scheme = Scheme.model_validate(scheme_dict)
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme


async def update_scheme(
    scheme_id: str,
    scheme_data: SchemeUpdate,
    session: Session = Depends(get_session),
) -> Scheme:
    """Update a scheme."""
    scheme = await get_scheme(scheme_id, session)

    update_data = scheme_data.model_dump(exclude_unset=True)

    # If name is updated but slug isn't, generate new slug from name
    if "name" in update_data and "slug" not in update_data:
        update_data["slug"] = generate_slug(update_data["name"])

    # If slug is being updated, check if it already exists
    if "slug" in update_data and update_data["slug"] is not None:
        existing = session.exec(
            select(Scheme).where(
                Scheme.slug == update_data["slug"], Scheme.id != scheme_id
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"A scheme with slug '{update_data['slug']}' already exists",
            )

    for key, value in update_data.items():
        setattr(scheme, key, value)

    scheme.update_timestamp()
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme


async def delete_scheme(scheme_id: str, session: Session = Depends(get_session)):
    """Delete a scheme."""
    scheme = await get_scheme(scheme_id, session)
    session.delete(scheme)
    session.commit()
    return {"message": f"Scheme {scheme_id} deleted successfully"}


async def get_scheme_scenarios(scheme_id: str, session: Session = Depends(get_session)):
    """Get all scenarios for a scheme."""
    scheme = await get_scheme_by_id_or_slug(scheme_id, session)
    statement = select(Scenario).where(Scenario.scheme_id == scheme.id)
    scenarios = session.exec(statement).all()
    return scenarios


async def get_scheme_by_id_or_slug(
    id_or_slug: str, session: Session = Depends(get_session)
):
    """Get a scheme by either ID or slug."""
    # Try to get by ID first
    try:
        # Try to convert to UUID first
        scheme_uuid = UUID(id_or_slug)
        statement = select(Scheme).where(Scheme.id == scheme_uuid)
        scheme = session.exec(statement).first()
        if scheme:
            return scheme
    except ValueError:
        # Not a valid UUID, try by slug
        statement = select(Scheme).where(Scheme.slug == id_or_slug)
        scheme = session.exec(statement).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        return scheme

    # If we got here, it was a valid UUID but no scheme found
    raise HTTPException(status_code=404, detail="Scheme not found")


async def create_scheme_scenario(
    scheme_id: str,
    scenario_data: ScenarioCreate,
    session: Session = Depends(get_session),
):
    """Create a new scenario for a scheme."""
    scheme = await get_scheme(scheme_id, session)
    scenario = Scenario.model_validate(scenario_data)
    scenario.scheme_id = scheme.id
    session.add(scenario)
    session.commit()
    session.refresh(scenario)
    return scenario
