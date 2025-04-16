from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends

from app.core.common import parse_uuid
from app.models.response import ConversationListResponse
from app.models.scenario_session import ScenarioSession, SessionStatus
from app.services.trainee_service import TraineeService

router = APIRouter(prefix="/trainees", tags=["Trainees"])


@router.get("/{trainee_id}/session")
async def get_scenario_session(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> Optional[ScenarioSession]:
    """Get the active scenario session for a trainee."""
    return await trainee_service.get_active_session(parse_uuid(trainee_id))


@router.get("/{trainee_id}/sessions/{session_id}/conversations")
async def get_session_conversations(
    trainee_id: str,
    session_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> List[ConversationListResponse]:
    """Get all conversations for a specific session."""
    return await trainee_service.get_session_conversations(
        parse_uuid(trainee_id), parse_uuid(session_id)
    )


@router.delete("/{trainee_id}/session")
async def delete_scenario_session(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> None:
    """Delete the active scenario session for a trainee."""
    await trainee_service.delete_active_session(parse_uuid(trainee_id))


@router.post("/{trainee_id}/sessions/{session_id}/stop")
async def complete_scenario_session(
    trainee_id: str,
    session_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> None:
    """Stop the active scenario session for a trainee prematurely."""
    await trainee_service.complete_scenario(
        parse_uuid(trainee_id), parse_uuid(session_id), status=SessionStatus.ABANDONED
    )


@router.post("/{trainee_id}/sessions/{session_id}/restart")
async def restart_scenario_session(
    trainee_id: str,
    session_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> None:
    """Complete the current session and allow starting a new scenario.

    This ensures that any active session is properly ended so a new one can begin.
    """
    # First end all active conversations
    await trainee_service.end_all_conversations(session_id)

    # Then complete the session
    await trainee_service.complete_scenario(
        parse_uuid(trainee_id), parse_uuid(session_id), status=SessionStatus.COMPLETED
    )
