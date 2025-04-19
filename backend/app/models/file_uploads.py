from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.scenario import Scenario
    from app.models.user import User


class FileUploadType(str, Enum):
    CSV = "csv"
    XLSX = "xlsx"


# Association table for many-to-many relationship between Scenario and FileUpload
class ScenarioFileUploadLink(SQLModel, table=True):
    __tablename__ = "scenario_file_upload_link"
    scenario_id: UUID = Field(foreign_key="scenarios.id", primary_key=True)
    file_upload_id: UUID = Field(foreign_key="file_uploads.id", primary_key=True)


class FileUpload(SQLModel, table=True):
    __tablename__ = "file_uploads"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    file_name: str
    file_type: FileUploadType = Field(default=FileUploadType.CSV)
    file_path: str = Field(default=None)

    uploaded_by_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    uploaded_by: Optional["User"] = Relationship(back_populates="file_uploads")
    upload_date: datetime = Field(default_factory=datetime.now)

    # Many-to-many relationship to Scenario
    scenarios: list["Scenario"] = Relationship(
        back_populates="file_uploads", link_model=ScenarioFileUploadLink
    )


class FileUploadRead(SQLModel):
    id: UUID
    file_name: str
    file_type: FileUploadType
    uploaded_by_id: Optional[UUID] = None
    upload_date: datetime


class FileUploadRenameRequest(SQLModel):
    file_name: str
