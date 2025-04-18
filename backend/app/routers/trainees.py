from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends

from app.core.common import parse_uuid
from app.models.response import (
    ConversationListResponse,
    ScenarioBrief,
    ScenarioSessionResponse,
)
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


@router.get("/{trainee_id}/sessions", response_model=list[ScenarioSessionResponse])
async def get_scenario_sessions(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
) -> list[ScenarioSessionResponse]:
    """Get all scenario sessions (completed and pending) for a trainee."""
    sessions = await trainee_service.get_scenario_sessions(parse_uuid(trainee_id))

    # Serialize scenario as nested object (id, name)
    def serialize(session: ScenarioSession) -> ScenarioSessionResponse:
        scenario = None
        if session.scenario:
            scenario = ScenarioBrief(
                id=session.scenario.id,
                name=session.scenario.name,
                scheme_id=session.scenario.scheme_id,
                scheme_name=session.scenario.name,
            )
        return ScenarioSessionResponse(
            id=session.id,
            user_id=session.user_id,
            scenario_id=session.scenario_id,
            start_timestamp=session.start_timestamp,
            end_timestamp=session.end_timestamp,
            status=session.status.value if session.status else None,
            metrics=getattr(session, "metrics", None),
            scenario=scenario,
        )

    return [serialize(s) for s in sessions]
