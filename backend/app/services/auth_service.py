from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.db import get_session
from app.core.security import (
    Token,
    TokenData,
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserType

settings = get_settings()


class AuthService:
    """Service for authentication operations."""

    def __init__(self, session: Session = Depends(get_session)):
        self.session = session

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate a user by username and password."""
        query = select(User).where(User.username == username)
        user = self.session.exec(query).first()

        if not user:
            return None
        if not verify_password(password, user.password):
            return None

        return user

    async def create_user(
        self,
        name: str,
        username: str,
        email: str,
        password: str,
        user_type: UserType = UserType.TRAINEE,
    ) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = self.session.exec(
            select(User).where((User.username == username) | (User.email == email))
        ).first()

        if existing_user:
            if existing_user.username == username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered",
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )

        # Create new user with hashed password
        hashed_password = get_password_hash(password)
        new_user = User(
            name=name,
            username=username,
            email=email,
            password=hashed_password,
            user_type=user_type,
        )

        self.session.add(new_user)
        self.session.commit()
        self.session.refresh(new_user)

        return new_user

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return self.session.get(User, user_id)

    async def create_access_token_for_user(self, user: User) -> Token:
        """Create an access token for a user."""
        token_data = {"sub": str(user.id), "type": user.user_type}

        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(data=token_data, expires_delta=expires_delta)

        return Token(access_token=access_token, token_type="bearer")

    async def get_current_user(self, token_data: TokenData) -> Optional[User]:
        """Get the current user from token data."""
        user = await self.get_user_by_id(token_data.user_id)
        if not user:
            return None
        return user
