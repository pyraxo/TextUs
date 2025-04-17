from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.common import parse_uuid
from app.core.security import get_current_user
from app.models.user import User, UserRead, UserType
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


class UserUpdate(BaseModel):
    """User update schema."""

    name: Optional[str] = None
    email: Optional[str] = None
    user_type: Optional[UserType] = None


@router.get("/", response_model=List[UserRead])
async def get_users_route(
    current_user: Annotated[User, Depends(get_current_user)],
    user_service: Annotated[UserService, Depends()],
    skip: int = 0,
    limit: int = 100,
    user_type: Optional[UserType] = None,
):
    """
    Get all users with pagination and optional filtering.
    Only admin users can see all users.
    """
    # Check if user is admin or trainer
    if current_user.user_type not in [UserType.ADMIN, UserType.TRAINER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return await user_service.get_users(skip=skip, limit=limit, user_type=user_type)


@router.get("/{user_id}", response_model=UserRead)
async def get_user_route(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    user_service: Annotated[UserService, Depends()],
):
    """
    Get a user by ID.
    Users can only see their own profile unless they are admins.
    """
    # Check if user is admin or trying to access their own profile
    if current_user.user_type != UserType.ADMIN and current_user.id != parse_uuid(
        user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return await user_service.get_user(parse_uuid(user_id))


@router.put("/{user_id}", response_model=UserRead)
async def update_user_route(
    user_id: str,
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    user_service: Annotated[UserService, Depends()],
):
    """
    Update a user.
    Users can only update their own profile unless they are admins.
    Only admins can change user types.
    """
    # Check if user is admin or trying to update their own profile
    if current_user.user_type != UserType.ADMIN and current_user.id != parse_uuid(
        user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Only admins can change user_type
    if user_update.user_type and current_user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user types",
        )

    # Filter out None values from user_update
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}

    return await user_service.update_user(parse_uuid(user_id), update_data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_route(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    user_service: Annotated[UserService, Depends()],
):
    """
    Delete a user.
    Only admins can delete users.
    """
    # Check if user is admin
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    await user_service.delete_user(parse_uuid(user_id))
    return None
