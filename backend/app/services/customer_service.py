from typing import List

from fastapi import Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.customer import Customer, CustomerCreate, CustomerRead, CustomerUpdate


class CustomersService:
    """Service to manage customer agents."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_customers(self) -> List[CustomerRead]:
        """Get all customers."""
        statement = select(Customer)
        results = (await self.session.exec(statement)).all()
        return [CustomerRead.from_customer(customer) for customer in results]

    async def get_customer(self, customer_id: str) -> CustomerRead:
        """Get a customer by ID."""
        customer_uuid = parse_uuid(customer_id)
        statement = select(Customer).where(Customer.id == customer_uuid)
        result = (await self.session.exec(statement)).one_or_none()
        return CustomerRead.from_customer(result) if result else None

    async def create_customer(self, customer: CustomerCreate) -> CustomerRead:
        """Create a new customer."""
        db_customer = Customer(**customer.model_dump())
        self.session.add(db_customer)
        await self.session.commit()
        await self.session.refresh(db_customer)
        return CustomerRead.from_customer(db_customer)

    async def update_customer(
        self, customer_id: str, customer_update: CustomerUpdate
    ) -> CustomerRead:
        """Update a customer."""
        customer_uuid = parse_uuid(customer_id)
        statement = select(Customer).where(Customer.id == customer_uuid)
        result = (await self.session.exec(statement)).one_or_none()

        # Get the update data, excluding unset fields
        update_data = customer_update.model_dump(exclude_unset=True)

        # Handle personality traits separately
        if "personality_traits" in update_data:
            result.personality_traits = update_data.pop("personality_traits")

        # Update remaining fields
        for key, value in update_data.items():
            setattr(result, key, value)

        result.update_timestamp()
        await self.session.commit()
        await self.session.refresh(result)
        return CustomerRead.from_customer(result)

    async def delete_customer(self, customer_id: str) -> None:
        """Delete a customer."""
        customer_uuid = parse_uuid(customer_id)
        statement = select(Customer).where(Customer.id == customer_uuid)
        result = (await self.session.exec(statement)).one_or_none()
        if result:
            await self.session.delete(result)
            await self.session.commit()
