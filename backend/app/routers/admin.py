from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.common import parse_uuid
from app.core.db import get_session
from app.core.security import get_current_admin
from app.models.user import User, UserCreate, UserRead
from app.services.user_service import UserService

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],  # All routes require admin access
)


@router.get("/users", response_model=List[UserRead])
async def get_users(
    session: Annotated[Session, Depends(get_session)],
    skip: int = 0,
    limit: int = 100,
):
    """Get all users (admin only)."""
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    return users


@router.post("/users", response_model=UserRead)
async def create_user_route(
    user: UserCreate,
    user_service: Annotated[UserService, Depends()],
):
    """Create a new user (admin only)."""
    return await user_service.create_user(user)


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(
    user_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Get a specific user by ID (admin only)."""
    user = session.get(User, parse_uuid(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/dashboard")
async def admin_dashboard():
    """Admin dashboard data."""
    # Placeholder for future admin dashboard data
    return {"message": "Admin dashboard data will be implemented later", "status": "ok"}
