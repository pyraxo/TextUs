import uuid
import pytest
from fastapi import HTTPException
from app.models.user import UserType
from app.services.auth_service import AuthService
from app.core.security import verify_password, TokenData


@pytest.mark.asyncio
async def test_create_user(auth_service: AuthService):
    # Test creating a new user
    user = await auth_service.create_user(
        name="Alice",
        username="alice123",
        email="alice@example.com",
        password="securepass",
        user_type=UserType.TRAINEE,
    )
    assert user.username == "alice123"
    assert verify_password("securepass", user.password)


@pytest.mark.asyncio
async def test_create_user_duplicate_username(auth_service: AuthService):
    # Test creating a user with a duplicate username
    await auth_service.create_user("Bob", "bob123", "bob@example.com", "pass")
    with pytest.raises(HTTPException) as exc:
        await auth_service.create_user("Bobby", "bob123", "bobby@example.com", "pass")
    assert exc.value.status_code == 400
    assert "Username already registered" in exc.value.detail


@pytest.mark.asyncio
async def test_create_user_duplicate_email(auth_service: AuthService):
    # Test creating a user with a duplicate email
    await auth_service.create_user("Charlie", "charlie1", "charlie@example.com", "pass")
    with pytest.raises(HTTPException) as exc:
        await auth_service.create_user("Chuck", "charlie2", "charlie@example.com", "pass")
    assert exc.value.status_code == 400
    assert "Email already registered" in exc.value.detail


@pytest.mark.asyncio
async def test_authenticate_user_success(auth_service: AuthService):
    # Test authenticating a user with correct credentials
    await auth_service.create_user("Dana", "dana123", "dana@example.com", "mypass")
    user = await auth_service.authenticate_user("dana123", "mypass")
    assert user is not None
    assert user.username == "dana123"


@pytest.mark.asyncio
async def test_authenticate_user_invalid_password(auth_service: AuthService):
    # Test authentication fails with wrong password
    await auth_service.create_user("Eve", "eve123", "eve@example.com", "rightpass")
    user = await auth_service.authenticate_user("eve123", "wrongpass")
    assert user is None


@pytest.mark.asyncio
async def test_get_user_by_id(auth_service: AuthService):
    # Test retrieving a user by ID
    created = await auth_service.create_user("Finn", "finn123", "finn@example.com", "secure")
    fetched = await auth_service.get_user_by_id(created.id)
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_create_access_token_for_user(auth_service: AuthService):
    # Test access token creation
    user = await auth_service.create_user("Grace", "grace123", "grace@example.com", "secret")
    token = await auth_service.create_access_token_for_user(user)
    assert token.access_token is not None
    assert token.token_type == "bearer"


@pytest.mark.asyncio
async def test_get_current_user(auth_service: AuthService):
    # Test retrieving the current user from token data
    user = await auth_service.create_user("Hank", "hank123", "hank@example.com", "tokenpass")
    token_data = TokenData(user_id=user.id)
    current = await auth_service.get_current_user(token_data)
    assert current.id == user.id