from typing import List, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.core.security import get_password_hash
from app.models.user import User, UserCreate, UserType


class UserService:
    """Service for user management operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_users(
        self, skip: int = 0, limit: int = 100, user_type: Optional[UserType] = None
    ) -> List[User]:
        """Get all users with pagination and optional filtering by user type."""
        query = select(User)
        if user_type:
            query = query.where(User.user_type == user_type)

        query = query.offset(skip).limit(limit)
        return (await self.session.exec(query)).all()

    async def get_user(self, user_id: UUID) -> User:
        """Get a user by ID."""
        user = await self.session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return (
            await self.session.exec(select(User).where(User.email == email))
        ).first()

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user."""
        # Hash the password before storing
        hashed_password = get_password_hash(user.password)

        # Create user with hashed password
        db_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password,
            user_type=user.user_type,
            joined_at=user.joined_at,
            last_login=user.last_login,
        )

        self.session.add(db_user)
        await self.session.commit()
        await self.session.refresh(db_user)
        return db_user

    async def update_user(self, user_id: UUID, update_data: dict) -> User:
        """Update a user."""
        user = await self.get_user(user_id)

        # Check if email is being updated and is unique
        if "email" in update_data and update_data["email"] != user.email:
            existing_user = await self.get_user_by_email(update_data["email"])
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )

        # Update user attributes
        for key, value in update_data.items():
            setattr(user, key, value)

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return user

    async def delete_user(self, user_id: UUID) -> None:
        """Delete a user."""
        user = await self.get_user(user_id)
        await self.session.delete(user)
        await self.session.commit()
