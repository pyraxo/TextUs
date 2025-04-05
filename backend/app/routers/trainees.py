from typing import Annotated, Optional

from fastapi import APIRouter, Depends

from app.models.scenario_session import ScenarioSession
from app.services.trainee_service import TraineeService

router = APIRouter(prefix="/trainees", tags=["Trainees"])


@router.get("/{trainee_id}/session")
async def get_scenario_session(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> Optional[ScenarioSession]:
    """Get the active scenario session for a trainee."""
    return await trainee_service.get_active_session(trainee_id)
