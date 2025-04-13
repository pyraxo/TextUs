import pytest
from app.core.security import TokenData, verify_password
from app.models.user import UserType
from app.services.auth_service import AuthService
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_create_user(auth_service: AuthService):
    # Test creating a new user
    user = await auth_service.create_user(
        name="Alice",
        email="alice@example.com",
        password="securepass",
        user_type=UserType.TRAINEE,
    )
    assert user.email == "alice@example.com"
    assert verify_password("securepass", user.password)


@pytest.mark.asyncio
async def test_create_user_duplicate_email(auth_service: AuthService):
    # Test creating a user with a duplicate email
    await auth_service.create_user("Bob", "bob@example.com", "pass")
    with pytest.raises(HTTPException) as exc:
        await auth_service.create_user("Bobby", "bob@example.com", "pass")
    assert exc.value.status_code == 400
    assert "Email already registered" in exc.value.detail


@pytest.mark.asyncio
async def test_create_user_duplicate_email(auth_service: AuthService):
    # Test creating a user with a duplicate email
    await auth_service.create_user("Charlie", "charlie@example.com", "pass")
    with pytest.raises(HTTPException) as exc:
        await auth_service.create_user("Chuck", "charlie@example.com", "pass")
    assert exc.value.status_code == 400
    assert "Email already registered" in exc.value.detail


@pytest.mark.asyncio
async def test_authenticate_user_success(auth_service: AuthService):
    # Test authenticating a user with correct credentials
    await auth_service.create_user("Dana", "danam", "mypass")
    user = await auth_service.authenticate_user("dana@example.comample.com", "mypass")
    assert user is not None
    assert user.email == "dana@example.com"


@pytest.mark.asyncio
async def test_authenticate_user_invalid_password(auth_service: AuthService):
    # Test authentication fails with wrong password
    await auth_service.create_user("Eve", "eve@example.com", "rightpass")
    user = await auth_service.authenticate_user("eve@example.com", "wrongpass")
    assert user is None


@pytest.mark.asyncio
async def test_get_user_by_id(auth_service: AuthService):
    # Test retrieving a user by ID
    created = await auth_service.create_user("Finn", "finn@example.com", "secure")
    fetched = await auth_service.get_user_by_id(created.id)
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_create_access_token_for_user(auth_service: AuthService):
    # Test access token creation
    user = await auth_service.create_user("Grace", "grace@example.com", "secret")
    token = await auth_service.create_access_token_for_user(user)
    assert token.access_token is not None
    assert token.token_type == "bearer"


@pytest.mark.asyncio
async def test_get_current_user(auth_service: AuthService):
    # Test retrieving the current user from token data
    user = await auth_service.create_user("Hank", "hank@example.com", "tokenpass")
    token_data = TokenData(user_id=user.id)
    current = await auth_service.get_current_user(token_data)
    assert current.id == user.id
