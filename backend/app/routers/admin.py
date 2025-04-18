import os
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session, desc, select

from app.core.common import parse_uuid
from app.core.db import get_session
from app.core.security import get_current_admin
from app.models.file_uploads import (
    FileUpload,
    FileUploadRead,
    FileUploadRenameRequest,
    FileUploadType,
)
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


# Service function (should be placed in services/csv_upload_service.py and imported here)
def save_file_upload(
    file: UploadFile, user_id: str, upload_dir: str = "data/uploads"
) -> FileUpload:
    # Ensure directory exists
    os.makedirs(upload_dir, exist_ok=True)
    file_name = ".".join(file.filename.split(".")[0:-1])
    file_ext = file.filename.split(".")[-1]
    allowed_exts = {ext.value for ext in FileUploadType}
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="File type not allowed.")
    upload = FileUpload(
        file_name=file_name,
        uploaded_by_id=parse_uuid(user_id),
        file_type=file_ext,
    )
    file_path = os.path.join(upload_dir, f"{upload.id}.{file_ext}")
    upload.file_path = file_path

    # Save file
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return upload


def delete_file_upload(upload: FileUpload):
    if os.path.exists(upload.file_path):
        os.remove(upload.file_path)


@router.post("/uploads", response_model=FileUploadRead)
async def upload_file(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)],
    file: UploadFile = File(...),
):
    """Upload a CSV file (admin only)."""
    upload = save_file_upload(file, str(current_user.id))
    session.add(upload)
    await session.commit()
    await session.refresh(upload)
    return upload


@router.get("/uploads", response_model=List[FileUploadRead])
async def list_file_uploads(
    session: Annotated[Session, Depends(get_session)],
):
    """List all uploaded CSV/Excel files (admin only)."""
    uploads = (
        await session.exec(select(FileUpload).order_by(desc(FileUpload.upload_date)))
    ).all()
    return uploads


@router.patch("/uploads/{upload_id}", response_model=FileUploadRead)
async def rename_file(
    upload_id: str,
    req: FileUploadRenameRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_admin)],
):
    """Rename a file upload (admin only)."""
    upload_uuid = parse_uuid(upload_id)
    upload: FileUpload | None = await session.get(FileUpload, upload_uuid)
    if not upload:
        raise HTTPException(status_code=404, detail="File upload not found")
    upload.file_name = req.file_name
    upload.uploaded_by = current_user
    session.add(upload)
    await session.commit()
    await session.refresh(upload)
    return upload


@router.delete("/uploads/{upload_id}", response_model=None, status_code=204)
async def delete_file(
    upload_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    """Delete a file upload (admin only)."""
    upload_uuid = parse_uuid(upload_id)
    upload: FileUpload | None = await session.get(FileUpload, upload_uuid)
    if not upload:
        raise HTTPException(status_code=404, detail="File upload not found")
    await session.delete(upload)
    await session.commit()
    delete_file_upload(upload)
    return
