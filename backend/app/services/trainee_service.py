from datetime import datetime, timedelta
from functools import partial
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import Depends, HTTPException
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from sqlalchemy.orm import selectinload
from sqlmodel import delete, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.chat_types import State
from app.chatter.utils import get_patience_level
from app.chatter.workflow import CHECKPOINT_DB_URL, workflow
from app.core.common import parse_uuid
from app.core.config import get_settings
from app.core.db import get_session
from app.core.events import EventType, event_bus
from app.models.chat import ChatConversation, ChatMessage, MessageType
from app.models.response import ConversationListResponse
from app.models.scenario import Scenario
from app.models.scenario_session import ScenarioSession, SessionMetrics, SessionStatus
from app.models.user import User
from app.routers.ws import create_message, end_chat
from app.services.conversation_service import ConversationService
from app.services.scenario_service import ScenarioService
from app.services.user_service import UserService

settings = get_settings()


class TraineeService:
    """Service for trainee operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session
        self._scenario_service = ScenarioService(session=session)
        self._user_service = UserService(session=session)
        self._conversation_service = ConversationService(session=session)
        self._bot = None

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
        trainee = await self._user_service.get_user(trainee_id)
        if not trainee:
            raise HTTPException(status_code=404, detail="Trainee not found")

        # Validate scenario exists and is available
        scenario = await self._scenario_service.get_scenario(scenario_id)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")

        return trainee, scenario

    async def create_or_get_session(
        self, trainee_id: UUID, scenario_id: UUID
    ) -> ScenarioSession:
        """Create or get an existing scenario session for a trainee.

        If an active session already exists, it will be returned.
        If no active session exists, a new one will be created.

        Args:
            trainee_id: UUID of the trainee
            scenario_id: UUID of the scenario
        """
        # Only get active (non-completed) sessions
        scenario_session = await self.get_active_session(trainee_id)

        # If there's an active session for a different scenario, that's handled elsewhere
        # If no active session or the active session is for a different scenario, create a new one
        if not scenario_session or scenario_session.scenario_id != scenario_id:
            scenario_session = ScenarioSession(
                user_id=trainee_id,
                scenario_id=scenario_id,
            )
            self.session.add(scenario_session)
            await self.session.commit()
            await self.session.refresh(scenario_session)

        return scenario_session

    async def start_scenario(
        self, trainee_id: UUID, scenario_id: UUID
    ) -> ScenarioSession:
        """Start or resumes a scenario session for a trainee.

        This will:
        1. Check for any active sessions and validate they match the requested scenario
        2. Create or get a ScenarioSession
        3. Load all ScenarioCustomers for the scenario
        4. Create ChatConversations for each ScenarioCustomer
        5. Initialize the ChatBot for each conversation
        6. Register conversations with the scheduler

        Args:
            trainee_id: UUID of the trainee
            scenario_id: UUID of the scenario to start

        Returns:
            The created/updated ScenarioSession

        Raises:
            HTTPException: If user has an active session for a different scenario
        """
        # Check for active session first
        active_session = await self.get_active_session(trainee_id)

        # If active session exists but is for a different scenario, prevent starting a new one
        if active_session and active_session.scenario_id != scenario_id:
            raise HTTPException(
                status_code=400,
                detail="You have an active scenario in progress. Please complete it before starting a new one.",
            )

        # Validate scenario exists and get trainee
        trainee, scenario = await self.validate_scenario_prerequisites(
            trainee_id, scenario_id
        )

        # Get or create a session for this scenario
        if active_session and active_session.scenario_id == scenario_id:
            print(
                f"Resuming existing active session {active_session.id} for scenario {scenario_id}"
            )
            scenario_session = active_session
        else:
            # Create a new session - either there's no active session or it's for a different scenario
            print(
                f"Creating new session for trainee {trainee_id} and scenario {scenario_id}"
            )
            scenario_session = ScenarioSession(
                user_id=trainee.id,
                scenario_id=scenario.id,
            )
            self.session.add(scenario_session)
            await self.session.commit()

        # Refresh session to get current state
        await self.session.refresh(scenario_session, ["chat_conversations"])

        # Get all scenario customers
        scenario_customers = (
            await self._scenario_service.get_scenario_customers_by_scenario_id(
                scenario_id
            )
        )

        print(f"Found {len(scenario_customers)} scenario customers:")
        for sc in scenario_customers:
            print(
                f"  - Customer ID: {sc.customer_id}, Name: {sc.name}, ScenarioCustomer ID: {sc.id}"
            )

        # Verify that the scenario has customers
        if not scenario_customers:
            raise HTTPException(
                status_code=400,
                detail="Cannot start scenario: no customers are associated with this scenario",
            )

        print(f"Current conversations in session {scenario_session.id}:")
        for conv in scenario_session.get_all_conversations():
            print(
                f"  - Conv ID: {conv.id}, Customer ID: {conv.scenario_customer_id}, Ended: {conv.ended_at}"
            )

        # Initialize conversations for each scenario customer that doesn't have one
        for scenario_customer in scenario_customers:
            print(f"\nProcessing customer {scenario_customer.id}:")
            print(f"  Name: {scenario_customer.name}")
            print(f"  Customer ID: {scenario_customer.customer_id}")

            # Check if this customer already has an active conversation in this session
            existing_conversation = scenario_session.get_customer_scenario_conversation(
                scenario_customer.id
            )
            if existing_conversation and not existing_conversation.ended_at:
                print(f"  Found existing conversation: {existing_conversation.id}")
            else:
                print("  No existing conversation found, creating new one")
                # Create new conversation for this customer
                new_conv = await self.start_trainee_conversation(
                    trainee_id=trainee.id,
                    scenario_customer_id=scenario_customer.id,
                )
                print(f"  Created new conversation: {new_conv.id}")
                scenario_session.add_chat_conversation(new_conv)
                self.session.add(scenario_session)
                await self.session.commit()

        # Refresh session to get all relationships
        await self.session.refresh(scenario_session, ["chat_conversations"])

        # Collect conversation data while still in async context
        conversation_summaries = [
            {
                "id": conv.id,
                "customer_id": conv.scenario_customer_id,
                "ended_at": conv.ended_at,
            }
            for conv in scenario_session.get_all_conversations()
        ]

        print("\nFinal conversations in session:")
        for summary in conversation_summaries:
            print(
                f"  - Conv ID: {summary['id']}, Customer ID: {summary['customer_id']}, Ended: {summary['ended_at']}"
            )

        return scenario_session

    async def complete_scenario(
        self, trainee_id: str, session_id: str, status: SessionStatus
    ) -> ScenarioSession:
        """Complete a scenario session with a specific status.

        Args:
            trainee_id: ID of the trainee
            session_id: ID of the session to complete
            status: Final status of the session (COMPLETED, FAILED, etc.)

        Returns:
            The updated session with final metrics

        Raises:
            HTTPException: If session not found or already completed
        """
        # Get and validate session
        trainee_uuid = parse_uuid(trainee_id)
        session_uuid = parse_uuid(session_id)
        scenario_session = await self.session.get(
            ScenarioSession, session_uuid, ScenarioSession.user_id == trainee_uuid
        )

        if not scenario_session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Validate all conversations are in a valid state
        active_conversations = [
            conv
            for conv in scenario_session.chat_conversations
            if not conv.ended_at and conv.messages  # Has messages but not ended
        ]
        if active_conversations and status == SessionStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail="Cannot complete session with active conversations",
            )

        # End all conversations
        now = datetime.now()
        for conversation in scenario_session.chat_conversations:
            if not conversation.ended_at:
                conversation.ended_at = now

        # Complete the session
        scenario_session.end_timestamp = now
        scenario_session.status = status  # Store the completion status

        # Calculate and store final metrics
        # metrics = await self.get_session_metrics(session_id)
        # scenario_session.metrics = metrics  # This will use our new property setter

        self.session.add(scenario_session)
        await self.session.commit()
        await self.session.refresh(scenario_session)
        return scenario_session

    async def end_all_conversations(self, session_id: str) -> None:
        """End all active conversations for a scenario session.

        Args:
            session_id: ID of the session

        Returns:
            None
        """
        session_uuid = parse_uuid(session_id)
        scenario_session = await self.session.get(ScenarioSession, session_uuid)

        if not scenario_session:
            raise HTTPException(status_code=404, detail="Session not found")

        # End all active conversations
        now = datetime.now()
        for conversation in scenario_session.chat_conversations:
            if not conversation.ended_at:
                conversation.ended_at = now
                self.session.add(conversation)

        await self.session.commit()

    async def get_active_session(self, trainee_id: str) -> Optional[ScenarioSession]:
        """Get trainee's active scenario session if any exists."""
        trainee_uuid = parse_uuid(trainee_id)
        # Check for sessions without end timestamp and not too old
        timeout_threshold = datetime.now() - timedelta(hours=24)  # 24 hour timeout

        print("Getting active session for trainee", trainee_uuid)

        statement = select(ScenarioSession).where(
            ScenarioSession.user_id == trainee_uuid,
            ScenarioSession.end_timestamp == None,  # noqa: E711
            ScenarioSession.start_timestamp > timeout_threshold,
        )
        results = (await self.session.exec(statement)).first()

        print("Results", results)

        if results and results.start_timestamp <= timeout_threshold:
            # Auto-complete timed out session
            await self.complete_scenario(
                results.user_id, results.id, status=SessionStatus.TIMED_OUT
            )
            return None

        return results

    async def get_session_metrics(self, session_id: str) -> SessionMetrics:
        """Get comprehensive metrics for a session."""
        session_uuid = parse_uuid(session_id)
        statement = (
            select(ScenarioSession)
            .where(ScenarioSession.id == session_uuid)
            .options(
                selectinload(ScenarioSession.chat_conversations).selectinload(
                    ChatConversation.messages
                ),
                selectinload(ScenarioSession.scenario).selectinload(
                    Scenario.scenario_customers
                ),
            )
        )
        result = await self.session.exec(statement)
        user_session = result.one_or_none()

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
        total_scenarios = len(user_session.scenario.scenario_customers)
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

    async def delete_active_session(self, trainee_id: str) -> None:
        """Delete the active scenario session for a trainee."""

        # Delete the active session, any attached conversations, and any messages
        active_session = await self.get_active_session(trainee_id)
        for conversation in active_session.chat_conversations:
            await self.session.exec(
                delete(ChatMessage).where(
                    ChatMessage.conversation_id == conversation.id
                )
            )
            await self.session.exec(
                delete(ChatConversation).where(
                    ChatConversation.scenario_customer_id == None
                )
            )
        await self.session.exec(
            delete(ScenarioSession).where(ScenarioSession.user_id == trainee_id)
        )
        await self.session.commit()

    async def check_session_completion(self, session_id: UUID) -> bool:
        """Check if all conversations in a session have ended and complete session if needed.

        Args:
            session_id: UUID of the session to check

        Returns:
            bool: True if session was completed, False otherwise
        """
        # Get the session with all conversations loaded
        scenario_session = await self.session.get(ScenarioSession, session_id)
        if not scenario_session:
            return False

        # Refresh to get updated conversation data
        await self.session.refresh(scenario_session, ["chat_conversations"])

        # Check if all conversations have ended
        active_conversations = [
            conv
            for conv in scenario_session.chat_conversations
            if not conv.ended_at and conv.messages  # Has messages but not ended
        ]

        # If there are no active conversations, complete the session
        if (
            not active_conversations
            and scenario_session.status != SessionStatus.COMPLETED
        ):
            try:
                # First, complete all database operations within the AsyncSession context
                scenario_session.status = SessionStatus.COMPLETED
                scenario_session.end_timestamp = datetime.now()

                # Store metrics in memory while we have database access
                session_metrics = await self.get_session_metrics(session_id)
                conversation_ids = [
                    str(conv.id) for conv in scenario_session.chat_conversations
                ]

                # Commit the session changes
                self.session.add(scenario_session)
                await self.session.commit()

                # After database operations are complete, broadcast the event with our stored metrics
                event_data = {
                    "session_id": str(session_id),
                    "user_id": str(scenario_session.user_id),
                    "scenario_id": str(scenario_session.scenario_id),
                    "status": scenario_session.status,
                    "metrics": session_metrics.dict(),
                    "conversation_ids": conversation_ids,
                }

                try:
                    await event_bus.publish(EventType.SESSION_COMPLETED, event_data)
                except Exception as e:
                    # Log event publishing error but don't fail the completion
                    print(f"Error publishing session completion event: {e}")

                print(f"Session {session_id} completed with metrics: {session_metrics}")
                return True

            except Exception as e:
                print(f"Error during session completion: {e}")
                # Ensure session is still marked as completed even if metrics calculation fails
                scenario_session.status = SessionStatus.COMPLETED
                scenario_session.end_timestamp = datetime.now()
                self.session.add(scenario_session)
                await self.session.commit()
                return True

        return False

    async def get_session_conversations(
        self, trainee_id: str, session_id: str
    ) -> List[ConversationListResponse]:
        """Get all conversations for a specific session.

        Args:
            trainee_id: UUID of the trainee
            session_id: UUID of the session

        Returns:
            List of conversations for the session

        Raises:
            HTTPException: If user is not authorized to access this session
                          or if session doesn't exist
        """
        # Validate UUIDs
        trainee_uuid = parse_uuid(trainee_id)
        session_uuid = parse_uuid(session_id)

        # Get the session and validate trainee access
        scenario_session = await self.session.get(ScenarioSession, session_uuid)

        if not scenario_session:
            raise HTTPException(status_code=404, detail="Session not found")

        if scenario_session.user_id != trainee_uuid:
            # User doesn't own this session
            raise HTTPException(
                status_code=403, detail="Not authorized to access this session"
            )

        # Fetch chat conversations directly with a separate query instead of using relationships
        statement = (
            select(ChatConversation)
            .where(ChatConversation.scenario_session_id == session_uuid)
            .options(
                selectinload(ChatConversation.scenario_customer),
                selectinload(ChatConversation.messages),
            )
        )

        result = await self.session.exec(statement)
        conversations = result.all()

        # Format conversations to match the API response format
        return [
            {
                "id": conv.id,
                "scenario_id": conv.scenario_customer.scenario_id,
                "customer_id": conv.scenario_customer.customer_id,
                "started_at": conv.started_at.isoformat(),
                "ended_at": conv.ended_at.isoformat() if conv.ended_at else None,
                "scenario_name": conv.scenario_customer.name,
                "latest_message_timestamp": max(
                    (msg.timestamp.isoformat() for msg in conv.messages),
                    default=conv.started_at.isoformat(),
                ),
            }
            for conv in conversations
        ]

    async def start_trainee_conversation(
        self, trainee_id: UUID, scenario_customer_id: UUID
    ) -> ChatConversation:
        """Start a new trainee conversation with a customer.

        Args:
            scenario_id: ID of the scenario
            customer_id: ID of the customer to chat with

        Returns:
            The created conversation
        """
        print(
            f"Starting trainee conversation for {trainee_id} with {scenario_customer_id}"
        )
        scenario_customer_uuid = parse_uuid(scenario_customer_id)
        scenario_customer = await self._scenario_service.get_scenario_customer_by_id(
            scenario_customer_uuid
        )

        # Check if scenario_customer exists
        if not scenario_customer:
            raise HTTPException(
                status_code=404,
                detail=f"Customer {scenario_customer_id} not found in scenario {scenario_customer_uuid}",
            )

        active_session = await self.create_or_get_session(
            trainee_id, scenario_customer.scenario_id
        )

        conv = None

        # First await the exec() call to get the result
        # Only look for non-ended conversations for this scenario customer
        result = await self.session.exec(
            select(ChatConversation).where(
                ChatConversation.scenario_customer_id == scenario_customer_uuid,
                ChatConversation.ended_at == None,  # noqa: E711
                ChatConversation.scenario_session_id == active_session.id,
            )
        )
        # Then call first() on the result
        existing_conversation = result.first()

        if existing_conversation:
            conv = existing_conversation
            print(f"Active conversation found: {conv.id}")
        else:
            # Create a new conversation
            conv = ChatConversation(
                scenario_customer_id=scenario_customer.id,
                trainee_id=trainee_id,
                customer_id=scenario_customer.customer_id,
                scenario_session_id=active_session.id,
                started_at=datetime.now(),
            )
            print(f"New conversation created: {conv.id}")
            self.session.add(conv)
            await self.session.commit()
            await self.session.refresh(conv)

        # Add conversation to session if not already added
        if conv not in active_session.chat_conversations:
            active_session.chat_conversations.append(conv)
            self.session.add(active_session)
            await self.session.commit()
            await self.session.refresh(conv)

        async with AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB_URL) as checkpointer:
            bot = workflow.compile(checkpointer=checkpointer)

            chat_state = State(
                scenario_id=str(scenario_customer_uuid),
                conversation_id=str(conv.id),
                trainee_id=str(trainee_id),
                customer_id=str(scenario_customer.customer_id),
                scenario_prompt=scenario_customer.scenario_prompt,
                patience_level=get_patience_level(
                    scenario_customer.scenario_prompt,
                    name=scenario_customer.name,
                ),
                conversation_history=[],
            )

            print(f"INVOKING CHAT: {conv.id}")

            # Start the chat with the chatbot
            await bot.ainvoke(
                input=chat_state,
                config={
                    "configurable": {
                        "send_message_func": partial(create_message, self.session),
                        "thread_id": str(conv.id),
                        "end_chat_func": partial(end_chat, self.session),
                    }
                },
            )
            # NOTE: This outputs the interrupt value

            return conv

    async def get_scenario_sessions(self, trainee_id: str) -> list[ScenarioSession]:
        """Get all scenario sessions (completed and pending) for a trainee, including scenario info."""
        trainee_uuid = parse_uuid(trainee_id)
        statement = (
            select(ScenarioSession)
            .where(ScenarioSession.user_id == trainee_uuid)
            .options(selectinload(ScenarioSession.scenario))
        )
        results = (await self.session.exec(statement)).all()
        return results
