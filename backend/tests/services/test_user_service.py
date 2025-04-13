import uuid
from datetime import UTC, datetime

import pytest
from app.models.user import UserCreate, UserType
from app.services.user_service import UserService
from fastapi import HTTPException


def create_test_user_data(identifier: str = "") -> UserCreate:
    """Create unique test user data."""
    timestamp = datetime.now(UTC).isoformat()
    return UserCreate(
        name=f"Test User {identifier}",
        email=f"test_{identifier}_{timestamp}@example.com",
        password="testpassword123",
        user_type=UserType.TRAINEE,
        joined_at=datetime.now(UTC),
        last_login=datetime.now(UTC),
    )


@pytest.mark.asyncio
async def test_create_user(user_service: UserService):
    """Test user creation."""
    user_data = create_test_user_data("create")
    user = await user_service.create_user(user_data)

    assert user.name == user_data.name
    assert user.email == user_data.email
    assert user.user_type == user_data.user_type
    assert user.password != user_data.password  # Password should be hashed


@pytest.mark.asyncio
async def test_get_user(user_service: UserService):
    """Test getting a user by ID."""
    user_data = create_test_user_data("get")
    created_user = await user_service.create_user(user_data)

    retrieved_user = await user_service.get_user(created_user.id)
    assert retrieved_user.id == created_user.id


@pytest.mark.asyncio
async def test_get_user_not_found(user_service: UserService):
    """Test getting a non-existent user."""
    with pytest.raises(HTTPException) as exc_info:
        await user_service.get_user(uuid.uuid4())
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_user_by_email(user_service: UserService):
    """Test getting a user by email."""
    user_data = create_test_user_data("email")
    created_user = await user_service.create_user(user_data)

    retrieved_user = await user_service.get_user_by_email(created_user.email)
    assert retrieved_user is not None
    assert retrieved_user.id == created_user.id


@pytest.mark.asyncio
async def test_get_users(user_service: UserService):
    """Test getting all users with pagination."""
    # Create multiple users
    await user_service.create_user(create_test_user_data("list1"))
    await user_service.create_user(create_test_user_data("list2"))

    users = await user_service.get_users(skip=0, limit=10)
    assert len(users) == 2


@pytest.mark.asyncio
async def test_get_users_by_type(user_service: UserService):
    """Test getting users filtered by type."""
    # Create users with different types
    trainee_data = create_test_user_data("trainee")
    await user_service.create_user(trainee_data)

    admin_data = create_test_user_data("admin")
    admin_data.user_type = UserType.ADMIN
    await user_service.create_user(admin_data)

    trainee_users = await user_service.get_users(user_type=UserType.TRAINEE)
    assert len(trainee_users) == 1
    assert trainee_users[0].user_type == UserType.TRAINEE


@pytest.mark.asyncio
async def test_update_user(user_service: UserService):
    """Test updating a user."""
    user_data = create_test_user_data("update")
    created_user = await user_service.create_user(user_data)

    update_data = {
        "name": "Updated Name",
        "email": f"updated_{datetime.now(UTC).isoformat()}@example.com",
    }

    updated_user = await user_service.update_user(created_user.id, update_data)
    assert updated_user.name == update_data["name"]
    assert updated_user.email == update_data["email"]


@pytest.mark.asyncio
async def test_update_user_duplicate_email(user_service: UserService):
    """Test updating a user with a duplicate email."""
    # Create first user
    first_user_data = create_test_user_data("first")
    await user_service.create_user(first_user_data)

    # Create second user
    second_user_data = create_test_user_data("second")
    second_user = await user_service.create_user(second_user_data)

    # Try to update second user with first user's email
    with pytest.raises(HTTPException) as exc_info:
        await user_service.update_user(second_user.id, {"email": first_user_data.email})
    assert exc_info.value.status_code == 400
    assert "Email already registered" in exc_info.value.detail


@pytest.mark.asyncio
async def test_delete_user(user_service: UserService):
    """Test deleting a user."""
    user_data = create_test_user_data("delete")
    created_user = await user_service.create_user(user_data)

    # Delete the user
    await user_service.delete_user(created_user.id)

    # Verify user is deleted
    with pytest.raises(HTTPException) as exc_info:
        await user_service.get_user(created_user.id)
    assert exc_info.value.status_code == 404
