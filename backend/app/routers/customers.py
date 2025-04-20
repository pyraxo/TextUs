from typing import List

from fastapi import APIRouter, Depends

from app.core.common import parse_uuid
from app.models.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services.customer_service import CustomersService

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
)


@router.get("", response_model=List[CustomerRead])
async def get_customers_route(
    customers_service: CustomersService = Depends(CustomersService),
) -> List[CustomerRead]:
    """Get all customers."""
    return await customers_service.get_customers()


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer_route(
    customer_id: str, customers_service: CustomersService = Depends(CustomersService)
) -> CustomerRead:
    """Get a customer by ID."""
    return await customers_service.get_customer(parse_uuid(customer_id))


@router.post("", response_model=CustomerRead)
async def create_customer_route(
    customer: CustomerCreate,
    customers_service: CustomersService = Depends(CustomersService),
) -> CustomerRead:
    """Create a new customer."""
    return await customers_service.create_customer(customer)


@router.put("/{customer_id}", response_model=CustomerRead)
async def update_customer_route(
    customer_id: str,
    customer: CustomerUpdate,
    customers_service: CustomersService = Depends(CustomersService),
) -> CustomerRead:
    """Update a customer."""
    return await customers_service.update_customer(parse_uuid(customer_id), customer)


@router.delete("/{customer_id}")
async def delete_customer_route(
    customer_id: str, customers_service: CustomersService = Depends(CustomersService)
) -> None:
    """Delete a customer."""
    return await customers_service.delete_customer(parse_uuid(customer_id))
