from datetime import datetime, timedelta
from functools import partial
from typing import Optional, Tuple
from uuid import UUID

from fastapi import Depends, HTTPException
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.chat_types import State
from app.chatter.utils import get_patience_level
from app.chatter.workflow import CHECKPOINT_DB_URL, workflow
from app.core.common import parse_uuid
from app.core.config import get_settings
from app.core.db import get_session
from app.models.chat import ChatConversation, MessageType
from app.models.scenario import Scenario
from app.models.scenario_session import ScenarioSession, SessionMetrics, SessionStatus
from app.models.user import User
from app.routers.ws import create_message
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

        If a session already exists, it will be returned.
        If no session exists, a new one will be created.

        Args:
            trainee_id: UUID of the trainee
            scenario_id: UUID of the scenario
        """
        scenario_session = await self.get_active_session(trainee_id)
        if not scenario_session:
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
        1. Create or get a ScenarioSession
        2. Load all ScenarioCustomers for the scenario
        3. Create ChatConversations for each ScenarioCustomer
        4. Initialize the ChatBot for each conversation
        5. Register conversations with the scheduler

        Args:
            trainee_id: UUID of the trainee
            scenario_id: UUID of the scenario to start

        Returns:
            The created/updated ScenarioSession
        """

        # Validate scenario exists and get trainee
        trainee, scenario = await self.validate_scenario_prerequisites(
            trainee_id, scenario_id
        )

        scenario_session = await self.create_or_get_session(trainee.id, scenario.id)

        # Explicitly load the chat_conversations relationship
        await self.session.refresh(scenario_session, ["chat_conversations"])

        # Get all scenario customers
        scenario_customers = await self._scenario_service.get_scenario_customers(
            scenario_id
        )

        # Verify that the scenario has customers
        if not scenario_customers:
            raise HTTPException(
                status_code=400,
                detail="Cannot start scenario: no customers are associated with this scenario",
            )

        # Initialize conversations for each scenario customer that doesn't have one
        for scenario_customer in scenario_customers:
            print(
                f"Checking if {scenario_customer.id} has a conversation in {scenario_session.id}"
            )
            if not any(
                conv
                for conv in scenario_session.chat_conversations
                if conv.scenario_customer_id == scenario_customer.id
            ):
                await self.start_trainee_conversation(
                    trainee_id=trainee.id,
                    scenario_id=scenario.id,
                    customer_id=scenario_customer.customer_id,
                )

        # Refresh session to get all relationships
        await self.session.refresh(scenario_session)
        return scenario_session

    async def complete_scenario(
        self, session_id: str, status: SessionStatus
    ) -> ScenarioSession:
        """Complete a scenario session with a specific status.

        Args:
            session_id: ID of the session to complete
            status: Final status of the session (COMPLETED, FAILED, etc.)

        Returns:
            The updated session with final metrics

        Raises:
            HTTPException: If session not found or already completed
        """
        # Get and validate session
        scenario_session = await self.get_active_session(session_id)

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

    async def get_active_session(self, trainee_id: str) -> Optional[ScenarioSession]:
        """Get trainee's active scenario session if any exists."""
        trainee_uuid = parse_uuid(trainee_id)
        # Check for sessions without end timestamp and not too old
        timeout_threshold = datetime.now() - timedelta(hours=24)  # 24 hour timeout

        statement = select(ScenarioSession).where(
            ScenarioSession.user_id == trainee_uuid,
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

    async def start_trainee_conversation(
        self, trainee_id: UUID, scenario_id: UUID, customer_id: UUID
    ) -> ChatConversation:
        """Start a new trainee conversation with a customer.

        Args:
            scenario_id: ID of the scenario
            customer_id: ID of the customer to chat with

        Returns:
            The created conversation
        """
        print(f"Starting trainee conversation for {trainee_id} with {customer_id}")
        scenario_customer = await self._scenario_service.get_scenario_customer(
            scenario_id, customer_id
        )

        # Check if scenario_customer exists
        if not scenario_customer:
            raise HTTPException(
                status_code=404,
                detail=f"Customer {customer_id} not found in scenario {scenario_id}",
            )

        conv = None

        # First await the exec() call to get the result
        result = await self.session.exec(
            select(ChatConversation).where(
                ChatConversation.scenario_customer_id == scenario_customer.id,
            )
        )
        # Then call first() on the result
        existing_conversation = result.first()

        if existing_conversation:
            conv = existing_conversation
            print(f"Conversation found: {conv.id}")
        else:
            # Create a new conversation
            conv = ChatConversation(
                scenario_customer_id=scenario_customer.id,
                trainee_id=trainee_id,
                customer_id=customer_id,
                started_at=datetime.now(),
            )
            print(f"Conversation created: {conv.id}")
        self.session.add(conv)
        await self.session.commit()
        await self.session.refresh(conv)

        # Get bot instance
        async with AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB_URL) as checkpointer:
            bot = workflow.compile(checkpointer=checkpointer)

            chat_state = State(
                scenario_id=str(scenario_id),
                conversation_id=str(conv.id),
                trainee_id=str(trainee_id),
                customer_id=str(customer_id),
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
                        "send_message": partial(create_message, self.session),
                        "thread_id": str(conv.id),
                    }
                },
            )
            # NOTE: This outputs the interrupt value

            return conv
