from typing import List, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.user import User, UserCreate, UserType


class UserService:
    """Service for user management operations."""

    def __init__(self, session: Session = Depends(get_session)):
        self.session = session

    async def get_users(
        self, skip: int = 0, limit: int = 100, user_type: Optional[UserType] = None
    ) -> List[User]:
        """Get all users with pagination and optional filtering by user type."""
        query = select(User)
        if user_type:
            query = query.where(User.user_type == user_type)

        query = query.offset(skip).limit(limit)
        return self.session.exec(query).all()

    async def get_user(self, user_id: UUID) -> User:
        """Get a user by ID."""
        user = self.session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get a user by username."""
        return self.session.exec(select(User).where(User.username == username)).first()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return self.session.exec(select(User).where(User.email == email)).first()

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user."""
        db_user = User.from_orm(user)
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    async def update_user(self, user_id: UUID, update_data: dict) -> User:
        """Update a user."""
        user = await self.get_user(user_id)

        # Check if username is being updated and is unique
        if "username" in update_data and update_data["username"] != user.username:
            existing_user = await self.get_user_by_username(update_data["username"])
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken",
                )

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
        self.session.commit()
        self.session.refresh(user)

        return user

    async def delete_user(self, user_id: UUID) -> None:
        """Delete a user."""
        user = await self.get_user(user_id)
        self.session.delete(user)
        self.session.commit()
