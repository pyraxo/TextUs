from datetime import datetime, timedelta
from typing import Optional, Tuple
from uuid import UUID

from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.models.chat import MessageType
from app.models.scenario import Scenario
from app.models.scenario_session import ScenarioSession, SessionMetrics, SessionStatus
from app.models.user import User


class TraineeService:
    """Service for trainee operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def validate_scenario_prerequisites(
        self, trainee_id: str, scenario_id: str
    ) -> Tuple[User, Scenario]:
        """Validate prerequisites for starting a scenario.

        Returns:
            Tuple[User, Scenario]: The validated user and scenario objects

        Raises:
            HTTPException: If validation fails
        """
        # Validate trainee exists
        trainee = await self.session.get(User, trainee_id)
        if not trainee:
            raise HTTPException(status_code=404, detail="Trainee not found")

        # Validate scenario exists and is available
        scenario = await self.session.get(Scenario, scenario_id)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")

        return trainee, scenario

    async def start_scenario(
        self, trainee_id: UUID, scenario_id: UUID
    ) -> ScenarioSession:
        """Start or continue a scenario session for a trainee."""
        # Validate scenario exists
        await self.validate_scenario_prerequisites(trainee_id, scenario_id)

        # Check for existing session for this user and scenario
        statement = select(ScenarioSession).where(
            ScenarioSession.user_id == trainee_id,
            ScenarioSession.scenario_id == scenario_id,
        )
        existing_session = (await self.session.exec(statement)).first()

        if not existing_session:
            # Create new session if none exists
            existing_session = ScenarioSession(
                user_id=trainee_id,
                scenario_id=scenario_id,
            )
            self.session.add(existing_session)
            await self.session.commit()
            await self.session.refresh(existing_session)

        return existing_session

    async def complete_scenario(
        self, session_id: str, status: SessionStatus
    ) -> ScenarioSession:
        """Complete a scenario session with a specific status."""
        # Get and validate session
        user_session = await self.session.get(ScenarioSession, session_id)
        if not user_session:
            raise HTTPException(status_code=404, detail="Session not found")

        if user_session.end_timestamp:
            raise HTTPException(status_code=400, detail="Session is already completed")

        # Validate all conversations are in a valid state
        active_conversations = [
            conv
            for conv in user_session.chat_conversations
            if not conv.ended_at and conv.messages  # Has messages but not ended
        ]
        if active_conversations and status == SessionStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="Cannot complete session with active conversations",
            )

        # End all conversations
        now = datetime.now()
        for conversation in user_session.chat_conversations:
            if not conversation.ended_at:
                conversation.ended_at = now
                self.session.add(conversation)

        # Complete the session
        user_session.end_timestamp = now
        # TODO: Store completion status in the model

        # Calculate and store final metrics
        metrics = await self.get_session_metrics(session_id)
        # TODO: Store metrics in the model

        self.session.add(user_session)
        await self.session.commit()
        await self.session.refresh(user_session)
        return user_session

    async def get_active_session(self, trainee_id: str) -> Optional[ScenarioSession]:
        """Get trainee's active scenario session if any exists."""
        # Check for sessions without end timestamp and not too old
        timeout_threshold = datetime.now() - timedelta(hours=24)  # 24 hour timeout

        statement = select(ScenarioSession).where(
            ScenarioSession.user_id == trainee_id,
            ScenarioSession.end_timestamp == None,  # noqa: E711
            ScenarioSession.start_timestamp > timeout_threshold,
        )
        results = (await self.session.exec(statement)).first()

        if results and results.start_timestamp <= timeout_threshold:
            # Auto-complete timed out session
            await self.complete_scenario(results.id, SessionStatus.TIMED_OUT)
            return None

        return results

    async def get_session_metrics(self, session_id: str) -> SessionMetrics:
        """Get comprehensive metrics for a session."""
        user_session = await self.session.get(ScenarioSession, session_id)
        if not user_session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Initialize metrics
        metrics = {
            "duration_seconds": None,
            "total_messages": 0,
            "user_messages": 0,
            "bot_messages": 0,
            "conversations": len(user_session.chat_conversations),
            "avg_response_time": None,
            "completion_rate": 0.0,
        }

        # Calculate duration if session is completed
        if user_session.end_timestamp:
            duration = user_session.end_timestamp - user_session.start_timestamp
            metrics["duration_seconds"] = duration.total_seconds()

        # Calculate message metrics and response times
        total_response_time = 0.0
        response_count = 0
        last_message_time = None

        for conversation in user_session.chat_conversations:
            # Sort messages by timestamp for accurate response time calculation
            messages = sorted(conversation.messages, key=lambda m: m.timestamp)

            for message in messages:
                metrics["total_messages"] += 1
                if message.message_type == MessageType.USER:
                    metrics["user_messages"] += 1
                else:
                    metrics["bot_messages"] += 1

                # Calculate response time
                if last_message_time and message.message_type != MessageType.USER:
                    response_time = (
                        message.timestamp - last_message_time
                    ).total_seconds()
                    if response_time < 300:  # Ignore gaps > 5 minutes
                        total_response_time += response_time
                        response_count += 1

                last_message_time = message.timestamp

        # Calculate average response time if we have responses
        if response_count > 0:
            metrics["avg_response_time"] = total_response_time / response_count

        # Calculate completion rate
        total_scenarios = len(user_session.scenario.customer_scenarios)
        completed_conversations = len(
            [
                c
                for c in user_session.chat_conversations
                if c.messages and c.ended_at  # Has messages and was properly ended
            ]
        )
        metrics["completion_rate"] = (
            completed_conversations / total_scenarios if total_scenarios > 0 else 0.0
        )

        return SessionMetrics(**metrics)
