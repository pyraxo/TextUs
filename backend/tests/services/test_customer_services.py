import uuid
import pytest
from app.models.customer import CustomerCreate, CustomerUpdate
from app.services.customer_service import CustomersService


@pytest.mark.asyncio
async def test_get_customers(customers_service: CustomersService):
    # Test getting all customers
    await customers_service.create_customer(CustomerCreate(name="Customer A"))
    await customers_service.create_customer(CustomerCreate(name="Customer B"))
    customers = await customers_service.get_customers()
    assert len(customers) >= 2


@pytest.mark.asyncio
async def test_create_customer(customers_service: CustomersService):
    # Test creating a customer
    customer = await customers_service.create_customer(CustomerCreate(name="Create Test"))
    assert customer.name == "Create Test"


@pytest.mark.asyncio
async def test_get_customer(customers_service: CustomersService):
    # Test retrieving a customer by ID
    created = await customers_service.create_customer(CustomerCreate(name="Fetch Test"))
    fetched = await customers_service.get_customer(str(created.id))
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_get_customer_not_found(customers_service: CustomersService):
    # Test retrieving a non-existent customer returns None
    result = await customers_service.get_customer(str(uuid.uuid4()))
    assert result is None


@pytest.mark.asyncio
async def test_update_customer(customers_service: CustomersService):
    # Test updating customer fields
    created = await customers_service.create_customer(CustomerCreate(name="Old Name"))
    updated = await customers_service.update_customer(str(created.id), CustomerUpdate(name="New Name"))
    assert updated.name == "New Name"


@pytest.mark.asyncio
async def test_delete_customer(customers_service: CustomersService):
    # Test deleting a customer
    created = await customers_service.create_customer(CustomerCreate(name="Delete Me"))
    await customers_service.delete_customer(str(created.id))
    result = await customers_service.get_customer(str(created.id))
    assert result is None
