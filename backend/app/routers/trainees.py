from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.chat import ChatEvaluation
from app.models.response import (
    ConversationListResponse,
    DashboardSummaryResponse,
    LatestAttemptResponse,
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


@router.get("/{trainee_id}/dashboard-summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    trainee_id: str,
    trainee_service: Annotated[TraineeService, Depends()],
    session: Annotated[Session, Depends(get_session)],
) -> DashboardSummaryResponse:
    """Get dashboard summary for a trainee: latest attempt, scenario progression, total sessions, and lifetime metrics."""
    sessions = await trainee_service.get_scenario_sessions(parse_uuid(trainee_id))
    if not sessions:
        return DashboardSummaryResponse(
            latest_attempt=None,
            scenario_progression=0,
            total_practice_sessions=0,
            metrics={
                "comprehension": 0,
                "tone": 0,
                "accuracy": 0,
                "chat_handling": 0,
                "averageScore": 0,
            },
        )

    # Latest attempt: most recent completed session
    completed_sessions = [s for s in sessions if s.status == SessionStatus.COMPLETED]
    latest_attempt: Optional[ScenarioSession] = (
        max(completed_sessions, key=lambda s: s.end_timestamp)
        if completed_sessions
        else None
    )

    # Scenario progression: unique scenarios completed
    scenario_progression = len(set(s.scenario_id for s in completed_sessions))

    # Total practice sessions: all completed sessions
    total_practice_sessions = len(completed_sessions)

    # Lifetime metrics: average of each metric across all ChatEvaluation records for this trainee
    metric_keys = ["comprehension", "tone", "accuracy", "chat_handling"]
    metric_sums = {k: 0 for k in metric_keys}
    metric_counts = {k: 0 for k in metric_keys}

    chat_evaluations: List[ChatEvaluation] = (
        await session.exec(
            select(ChatEvaluation).where(
                ChatEvaluation.trainee_id == parse_uuid(trainee_id)
            )
        )
    ).all()
    for evaluation in chat_evaluations:
        results = evaluation.evaluation_results or {}
        for k in metric_keys:
            v = results.get(k)
            score = None
            if isinstance(v, dict) and "score" in v:
                score = v["score"]
            elif isinstance(v, (int, float)):
                score = v
            if isinstance(score, (int, float)):
                metric_sums[k] += score
                metric_counts[k] += 1
    metrics = {
        k: (metric_sums[k] / metric_counts[k] if metric_counts[k] else 0)
        for k in metric_keys
    }
    metrics["averageScore"] = sum(metrics.values()) / len(metrics)

    # Serialize latest attempt
    def serialize(session: ScenarioSession) -> LatestAttemptResponse:
        if not session.scenario:
            return LatestAttemptResponse(
                score=0,
                time_taken=0,
                scenario_name="",
                scheme_name="",
            )
        return LatestAttemptResponse(
            score=session.metrics.get("score", 0),
            time_taken=int(
                (session.end_timestamp - session.start_timestamp).total_seconds()
            ),
            scenario_name=session.scenario.name,
            scheme_name="",  # TODO: Fetch scheme name
        )

    return DashboardSummaryResponse(
        latest_attempt=serialize(latest_attempt) if latest_attempt else None,
        scenario_progression=scenario_progression,
        total_practice_sessions=total_practice_sessions,
        metrics=metrics,
    )
