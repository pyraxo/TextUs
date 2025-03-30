import asyncio
import logging
import time
from datetime import datetime
from typing import AsyncGenerator, Dict, Optional
from uuid import UUID, uuid4

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.bot import ChatBot, State
from app.core.config import get_settings
from app.core.ws_manager import manager as ws_manager
from app.models.chat import ChatConversation, ChatMessage, MessageType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Default check interval in seconds
DEFAULT_CHECK_INTERVAL = 1.0


class ConversationScheduler:
    """
    Scheduler for managing chat conversations that require delayed responses.

    This scheduler runs in the background and services all ongoing conversations,
    handling both trainee and customer AI interactions by checking for conversations
    that are ready to continue after waiting periods.
    """

    def __init__(self, chatbot: Optional[ChatBot] = None, session_factory=None):
        """
        Initialize the conversation scheduler.

        Args:
            chatbot: ChatBot instance to use for processing conversations
            session_factory: Factory function to create database sessions
        """
        self.chatbot = chatbot or ChatBot()
        self.session_factory = session_factory
        self.active_conversations: Dict[UUID, State] = {}
        self.running = False
        self.check_interval = DEFAULT_CHECK_INTERVAL
        self._task = None

    async def start(self):
        """Start the scheduler background task."""
        if self.running:
            logger.warning("Scheduler is already running")
            return

        logger.info("Starting conversation scheduler")
        self.running = True
        self._task = asyncio.create_task(self._scheduler_loop())

    async def stop(self):
        """Stop the scheduler and clean up resources."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return

        logger.info("Stopping conversation scheduler")
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

        # Persist active conversations to database
        await self._save_conversation_states()

    async def _scheduler_loop(self):
        """Main scheduler loop that checks and processes conversations."""
        try:
            # First, load any existing conversations from DB
            await self._load_conversation_states()

            while self.running:
                try:
                    await self._process_waiting_conversations()
                except Exception as e:
                    logger.error("Error processing conversations: %s", e)

                # Wait before next check
                await asyncio.sleep(self.check_interval)
        except asyncio.CancelledError:
            logger.info("Scheduler loop cancelled")
            raise
        except Exception as e:
            logger.error("Scheduler loop encountered an error: %s", e)
            # Restart the loop if it fails
            if self.running:
                logger.info("Restarting scheduler loop")
                self._task = asyncio.create_task(self._scheduler_loop())

    async def _process_waiting_conversations(self):
        """Check all active conversations and process those that are ready."""
        if not self.active_conversations:
            return

        # Get the current time once for consistent comparisons
        current_time = time.time()

        # Identify conversations ready for processing
        ready_conversations = []
        for conv_id, state in self.active_conversations.items():
            next_response_time = state.get("next_response_time", 0)

            # Check for impatient follow-up
            should_follow_up = await self.chatbot.should_send_impatient_followup(state)

            # Check if it's time to process this conversation
            if current_time >= next_response_time or should_follow_up:
                ready_conversations.append(conv_id)

        # Process each ready conversation
        for conv_id in ready_conversations:
            try:
                await self._process_conversation(conv_id)
            except Exception as e:
                logger.error("Error processing conversation %s: %s", conv_id, e)

    async def _process_conversation(self, conversation_id: UUID):
        """Process a single conversation that's ready for continuation."""
        state = self.active_conversations.get(conversation_id)
        if not state:
            logger.warning(
                "Conversation %s not found in active conversations", conversation_id
            )
            return

        logger.info("Processing conversation %s", conversation_id)

        # Check if the conversation is ready to continue
        ready, updated_state = await self.chatbot.check_waiting_conversation(state)

        if ready:
            # Continue the conversation
            try:
                result = await self.chatbot.workflow.ainvoke(updated_state)

                # Update the conversation state
                self.active_conversations[conversation_id] = result

                # If the conversation has ended, clean it up
                if result.get("status") == "end":
                    await self._handle_completed_conversation(conversation_id)

                # Broadcast the AI response message if any new messages were added
                await self._broadcast_ai_message(result)

            except Exception as e:
                logger.error("Error continuing conversation %s: %s", conversation_id, e)
        else:
            # Update the state but keep waiting
            self.active_conversations[conversation_id] = updated_state

    async def _get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get a database session using the session factory."""
        if not self.session_factory:
            raise ValueError("No session factory provided")

        async for session in self.session_factory():
            yield session

    async def _with_session(self, operation):
        """Execute an operation with a database session."""
        if not self.session_factory:
            return None

        async for session in self._get_session():
            try:
                result = await operation(session)
                return result
            except Exception as e:
                logger.error("Database operation failed: %s", e)
                raise
            finally:
                await session.close()

    async def _broadcast_ai_message(self, state: State):
        """Broadcast the most recent AI message from the state."""
        try:
            # Extract conversation ID
            conversation_id = state["conversation_id"]

            # Find the most recent AI message (if any)
            messages = state["messages"]
            if not messages:
                return

            # Find the latest AI message
            ai_messages = [m for m in messages if isinstance(m, AIMessage)]
            if not ai_messages:
                return

            latest_ai_message = ai_messages[-1]

            # First, store the message in the database if session factory is available
            chat_message = None
            if self.session_factory:

                async def save_message(session: AsyncSession):
                    # Create and save the database message
                    message = ChatMessage(
                        conversation_id=conversation_id,
                        sender_id="AI",  # Or use appropriate sender ID
                        message=latest_ai_message.content,
                        message_type=MessageType.BOT,
                    )
                    session.add(message)
                    await session.commit()
                    await session.refresh(message)
                    return message

                chat_message = await self._with_session(save_message)

            # Prepare the message for broadcasting
            message_data = {
                "type": "MESSAGE",
                "conversationId": str(conversation_id),
                "payload": {
                    "id": str(chat_message.id) if chat_message else str(uuid4()),
                    "conversation_id": str(conversation_id),
                    "sender_id": "AI",
                    "content": latest_ai_message.content,
                    "timestamp": str(chat_message.timestamp)
                    if chat_message
                    else str(time.time()),
                    "message_type": MessageType.BOT.value,
                },
            }

            # Broadcast the message to all clients in this conversation
            await ws_manager.broadcast_to_conversation(message_data, conversation_id)

        except Exception as e:
            logger.error("Error broadcasting AI message: %s", e)

    async def register_conversation(self, state: State) -> None:
        """Register a new conversation with the scheduler."""
        conversation_id = state["conversation_id"]
        self.active_conversations[conversation_id] = state
        logger.info("Registered conversation %s", conversation_id)

    async def update_conversation(self, conversation_id: UUID, state: State) -> None:
        """Update an existing conversation's state."""
        if conversation_id in self.active_conversations:
            self.active_conversations[conversation_id] = state
            logger.info("Updated conversation %s", conversation_id)
        else:
            logger.warning(
                "Tried to update non-existent conversation %s", conversation_id
            )

    async def remove_conversation(self, conversation_id: UUID) -> None:
        """Remove a conversation from the scheduler."""
        if conversation_id in self.active_conversations:
            del self.active_conversations[conversation_id]
            logger.info("Removed conversation %s", conversation_id)
        else:
            logger.warning(
                "Tried to remove non-existent conversation %s", conversation_id
            )

    async def get_conversation(self, conversation_id: UUID) -> Optional[State]:
        """Get the current state of a conversation."""
        return self.active_conversations.get(conversation_id)

    async def get_all_conversations(self) -> Dict[UUID, State]:
        """Get all active conversations."""
        return self.active_conversations.copy()

    async def _handle_completed_conversation(self, conversation_id: UUID):
        """Handle a completed conversation (clean up resources)."""
        # Update status in DB if needed
        if self.session_factory:

            async def update_conversation(session: AsyncSession):
                conv = await session.get(ChatConversation, conversation_id)
                if conv:
                    conv.ended_at = time.time()
                    session.add(conv)
                    await session.commit()

            await self._with_session(update_conversation)

        # Remove from active conversations
        await self.remove_conversation(conversation_id)

    async def _load_conversation_states(self):
        """Load active conversation states from the database."""
        if not self.session_factory:
            logger.warning(
                "No session factory provided, can't load conversation states"
            )
            return

        async def load_states(session: AsyncSession):
            # Get active conversations from database
            statement = select(ChatConversation).where(
                ChatConversation.ended_at.is_(None)
            )
            results = (await session.exec(statement)).all()

            for conversation in results:
                try:
                    # Convert database state to in-memory state format
                    state = await self._convert_db_conversation_to_state(
                        conversation, session
                    )
                    if state:
                        self.active_conversations[conversation.id] = state
                except Exception as e:
                    logger.error(
                        "Error loading state for conversation %s: %s",
                        conversation.id,
                        e,
                    )

            logger.info(
                "Loaded %s active conversations", len(self.active_conversations)
            )

        await self._with_session(load_states)

    async def _convert_db_conversation_to_state(
        self, conversation: ChatConversation, session: AsyncSession
    ) -> Optional[State]:
        """Convert a database conversation to an in-memory state."""
        try:
            # Load the scenario customer with its relationships
            scenario_customer = conversation.scenario_customer

            if not scenario_customer:
                logger.error(
                    "Conversation %s has no scenario customer", conversation.id
                )
                return None

            # Convert messages to LangChain format
            messages = []
            # Add system message with scenario prompt
            messages.append(
                SystemMessage(
                    content=f"{scenario_customer.name}\n\n{scenario_customer.scenario_prompt}"
                )
            )

            # Add conversation messages in order
            for msg in sorted(conversation.messages, key=lambda m: m.timestamp):
                if msg.message_type == MessageType.USER:
                    messages.append(HumanMessage(content=msg.message))
                else:
                    messages.append(AIMessage(content=msg.message))

            # Get the latest message times
            current_time = time.time()
            last_message = (
                max(conversation.messages, key=lambda m: m.timestamp)
                if conversation.messages
                else None
            )
            last_user_message = max(
                (
                    m
                    for m in conversation.messages
                    if m.message_type == MessageType.USER
                ),
                key=lambda m: m.timestamp,
                default=None,
            )

            # Create state dictionary
            state = {
                "messages": messages,
                "scenario_customer": scenario_customer,
                "conversation_id": conversation.id,
                "last_message_time": last_message.timestamp.timestamp()
                if last_message
                else current_time,
                "last_user_message_time": last_user_message.timestamp.timestamp()
                if last_user_message
                else 0,
                "next_response_time": current_time,  # Set to current time to check immediately
                "unanswered_queries": scenario_customer.expected_queries,
                "patience_level": 0.5,  # Default patience level
                "follow_up_sent": False,
                "new_user_messages": 0,
            }

            return state

        except Exception as e:
            logger.error(
                "Error converting conversation %s to state: %s", conversation.id, e
            )
            return None

    async def _save_conversation_states(self):
        """Save active conversation states to the database."""
        if not self.session_factory:
            logger.warning(
                "No session factory provided, can't save conversation states"
            )
            return

        async def save_states(session: AsyncSession):
            for conversation_id, state in self.active_conversations.items():
                await self._save_conversation_state(conversation_id, state, session)

        await self._with_session(save_states)

    async def _save_conversation_state(
        self, conversation_id: UUID, state: State, session: AsyncSession
    ):
        """Save a single conversation state to the database."""
        try:
            # Get the conversation from the database
            conversation = await session.get(ChatConversation, conversation_id)
            if not conversation:
                logger.warning("Conversation %s not found in database", conversation_id)
                return

            # Update conversation status if needed
            if state.get("status") == "end" and not conversation.ended_at:
                conversation.ended_at = datetime.fromtimestamp(time.time())
                session.add(conversation)

            # Get all messages from the state that aren't in the database yet
            existing_messages = {msg.message for msg in conversation.messages}
            new_messages = []

            for msg in state["messages"]:
                if isinstance(msg, (HumanMessage, AIMessage)):
                    # Skip if message content already exists
                    if msg.content in existing_messages:
                        continue

                    # Create new message
                    chat_message = ChatMessage(
                        conversation_id=conversation_id,
                        sender_id="User" if isinstance(msg, HumanMessage) else "Bot",
                        message=msg.content,
                        message_type=MessageType.USER
                        if isinstance(msg, HumanMessage)
                        else MessageType.BOT,
                    )
                    new_messages.append(chat_message)
                    existing_messages.add(msg.content)

            # Add new messages to the database
            if new_messages:
                session.add_all(new_messages)

            # Commit changes
            await session.commit()

        except Exception as e:
            logger.error(
                "Error saving state for conversation %s: %s", conversation_id, e
            )
            # Rollback on error
            await session.rollback()

    async def add_user_message(self, conversation_id: UUID, message: str) -> bool:
        """
        Add a user message to a conversation and update its schedule.

        Returns:
            bool: True if message was added, False if conversation not found
        """
        if conversation_id not in self.active_conversations:
            logger.warning(
                "Tried to add message to non-existent conversation %s", conversation_id
            )
            return False

        # Create event with user message
        event = {
            "user_message": message,
        }

        # Update the conversation with the event
        try:
            result = await self.chatbot.workflow.ainvoke(
                {"conversation_id": conversation_id}, event
            )
            self.active_conversations[conversation_id] = result
            return True
        except Exception as e:
            logger.error(
                "Error adding user message to conversation %s: %s", conversation_id, e
            )
            return False


# Singleton instance
_scheduler_instance = None


def get_scheduler(
    chatbot: Optional[ChatBot] = None, session_factory=None
) -> ConversationScheduler:
    """Get the global scheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = ConversationScheduler(chatbot, session_factory)
    return _scheduler_instance
