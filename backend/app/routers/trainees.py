from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends

from app.models.response import ConversationListResponse
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


@router.get("/{trainee_id}/sessions/{session_id}/conversations")
async def get_session_conversations(
    trainee_id: str,
    session_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> List[ConversationListResponse]:
    """Get all conversations for a specific session."""
    return await trainee_service.get_session_conversations(trainee_id, session_id)


@router.delete("/{trainee_id}/session")
async def delete_scenario_session(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> None:
    """Delete the active scenario session for a trainee."""
    await trainee_service.delete_active_session(trainee_id)
