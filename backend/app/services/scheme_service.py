from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.scenario import Scenario, ScenarioCreate
from app.models.scheme import Scheme, SchemeCreate, SchemeUpdate, generate_slug


class SchemeService:
    """Service for scheme operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_schemes(self):
        """Get all schemes."""
        statement = select(Scheme)
        results = (await self.session.exec(statement)).all()
        return results

    async def get_scheme(self, scheme_id: str) -> Scheme:
        """Get a scheme by ID."""
        try:
            statement = select(Scheme).where(Scheme.id == scheme_id)
            scheme = (await self.session.exec(statement)).first()
            if not scheme:
                raise HTTPException(status_code=404, detail="Scheme not found")
            return scheme
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid scheme_id format. Must be a valid UUID.",
            ) from e

    async def get_scheme_by_slug(self, slug: str) -> Scheme:
        """Get a scheme by slug."""
        statement = select(Scheme).where(Scheme.slug == slug)
        scheme = (await self.session.exec(statement)).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        return scheme

    async def create_scheme(self, scheme_data: SchemeCreate) -> Scheme:
        """Create a new scheme."""
        scheme_dict = scheme_data.model_dump()

        # Generate a slug if not provided
        if not scheme_dict.get("slug") and scheme_dict.get("name"):
            scheme_dict["slug"] = generate_slug(scheme_dict["name"])

        # Check if the slug already exists
        if scheme_dict.get("slug"):
            existing = (
                await self.session.exec(
                    select(Scheme).where(Scheme.slug == scheme_dict["slug"])
                )
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"A scheme with slug '{scheme_dict['slug']}' already exists",
                )

        scheme = Scheme.model_validate(scheme_dict)
        self.session.add(scheme)
        await self.session.commit()
        await self.session.refresh(scheme)
        return scheme

    async def update_scheme(
        self,
        scheme_id_or_slug: str,
        scheme_data: SchemeUpdate,
    ) -> Scheme:
        """Update a scheme."""
        scheme = await self.get_scheme_by_id_or_slug(scheme_id_or_slug)

        update_data = scheme_data.model_dump(exclude_unset=True)

        # If name is updated but slug isn't, generate new slug from name
        if "name" in update_data and "slug" not in update_data:
            update_data["slug"] = generate_slug(update_data["name"])

        # If slug is being updated, check if it already exists
        if "slug" in update_data and update_data["slug"] is not None:
            existing = (
                await self.session.exec(
                    select(Scheme).where(
                        Scheme.slug == update_data["slug"], Scheme.id != scheme.id
                    )
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
        self.session.add(scheme)
        await self.session.commit()
        await self.session.refresh(scheme)
        return scheme

    async def delete_scheme(self, scheme_id_or_slug: str):
        """Delete a scheme."""
        print(f"Deleting scheme: {scheme_id_or_slug}")
        scheme = await self.get_scheme_by_id_or_slug(scheme_id_or_slug)
        await self.session.delete(scheme)
        await self.session.commit()
        return None

    async def get_scheme_scenarios(self, scheme_id_or_slug: str):
        """Get all scenarios for a scheme."""
        scheme = await self.get_scheme_by_id_or_slug(scheme_id_or_slug)
        statement = select(Scenario).where(Scenario.scheme_id == scheme.id)
        scenarios = (await self.session.exec(statement)).all()
        return scenarios

    async def get_scheme_by_id_or_slug(self, id_or_slug: str) -> Scheme:
        """Get a scheme by either ID or slug."""
        # Try to get by ID first
        try:
            # Try to convert to UUID first
            scheme_uuid = parse_uuid(id_or_slug)
            statement = select(Scheme).where(Scheme.id == scheme_uuid)
            scheme = (await self.session.exec(statement)).first()
            if scheme:
                return scheme
        except ValueError:
            # Not a valid UUID, try by slug
            statement = select(Scheme).where(Scheme.slug == id_or_slug)
            scheme = (await self.session.exec(statement)).first()
            if not scheme:
                raise HTTPException(status_code=404, detail="Scheme not found")
            return scheme

        # If we got here, it was a valid UUID but no scheme found
        raise HTTPException(status_code=404, detail="Scheme not found")

    async def create_scheme_scenario(
        self,
        scheme_id: str,
        scenario_data: ScenarioCreate,
    ):
        """Create a new scenario for a scheme."""
        scheme = await self.get_scheme(scheme_id)
        scenario = Scenario.model_validate(scenario_data)
        scenario.scheme_id = scheme.id
        self.session.add(scenario)
        await self.session.commit()
        await self.session.refresh(scenario)
        return scenario
