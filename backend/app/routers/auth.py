from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core.security import Token, get_current_user
from app.models.user import User, UserRead
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: Annotated[AuthService, Depends()],
):
    """Get access token for authenticated user."""
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = await auth_service.create_access_token_for_user(user)

    # Return token in response body and set HTTP-only cookie
    return token


@router.post("/login", response_model=UserRead)
async def login(
    login_request: LoginRequest,
    response: Response,
    auth_service: Annotated[AuthService, Depends()],
):
    """Login user and set JWT cookie."""
    user = await auth_service.authenticate_user(
        login_request.username, login_request.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = await auth_service.create_access_token_for_user(user)

    # Set HTTP-only cookie with the JWT token
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token.access_token}",
        httponly=True,
        max_age=1800,  # 30 minutes in seconds
        expires=1800,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
    )

    # Return user information (without password)
    return UserRead(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        user_type=user.user_type,
        joined_at=user.joined_at,
        last_login=user.last_login,
    )


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing JWT cookie."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
    )
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current authenticated user."""
    return UserRead(
        id=current_user.id,
        name=current_user.name,
        username=current_user.username,
        email=current_user.email,
        user_type=current_user.user_type,
        joined_at=current_user.joined_at,
        last_login=current_user.last_login,
    )
