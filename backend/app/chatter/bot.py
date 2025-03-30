import json
import math
import random
import time
from enum import Enum
from typing import Annotated, List, Optional, Sequence
from uuid import UUID, uuid4

import instructor
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from app.core.config import get_settings
from app.models.scenario_customer import ScenarioCustomer

settings = get_settings()

MESSAGE_COUNT_THRESHOLD = 4


class QueryEvaluation(BaseModel):
    """Evaluation of which queries have been answered."""

    unanswered_queries: List[str] = Field(
        default_factory=list,
        description="List of queries that have not been sufficiently addressed in the conversation",
    )
    all_answered: bool = Field(
        description="True if all queries have been sufficiently addressed"
    )
    reasoning: str = Field(
        description="Brief explanation of why the queries are considered answered or unanswered"
    )


class ChatStatus(Enum):
    """Status codes for chat workflow."""

    CONTINUE = "continue"  # Continue processing in the same node
    WAITING = "waiting"  # Waiting for scheduled time
    END = "end"  # End conversation


class State(TypedDict):
    """State management for the chatbot."""

    messages: Annotated[Sequence[BaseMessage], add_messages]
    scenario_customer: ScenarioCustomer
    conversation_id: UUID
    last_message_time: float
    last_user_message_time: float
    next_response_time: float  # When the next response should be sent
    unanswered_queries: list[str]
    patience_level: float  # 0.0-1.0, where lower means more impatient
    follow_up_sent: bool
    new_user_messages: int  # Count of new user messages since last AI response
    should_delay: bool  # Whether to apply delay before next message
    status: Optional[ChatStatus] = ChatStatus.CONTINUE  # Status of the conversation


class ChatBot:
    """Chatbot module."""

    def __init__(self):
        self.workflow = self.build_workflow()

    async def calculate_delay(self, message_length: int) -> float:
        """Calculate delay based on message length using logarithmic scale.

        Args:
            message_length: Length of the message to base delay on

        Returns:
            Delay time in seconds between 3-300
        """

        # Base delay calculation using log scale
        # Shorter messages = shorter delays
        # 10 chars → ~3s, 100 chars → ~46s, 1000 chars → ~69s
        base_delay = math.log(max(message_length, 10)) * 10

        # Add random variation (±10%)
        variation = random.uniform(-0.1, 0.1) * base_delay

        # Ensure delay stays within bounds
        final_delay = max(min(base_delay + variation, 300), 3)
        return final_delay

    async def evaluate_query_progress(self, state: State) -> tuple[list[str], bool]:
        """Evaluate which queries have been answered and if chat should end.

        Args:
            state: Current conversation state

        Returns:
            Tuple of (remaining unanswered queries, should end chat)
        """
        messages = state["messages"]
        unanswered_queries = state["unanswered_queries"]

        # If no queries left, we're done
        if not unanswered_queries:
            return [], True

        # Only include the last few messages to save tokens
        # Get last message plus up to 4 previous messages for context
        recent_messages = messages[-min(5, len(messages)) :]

        # Prepare conversation history as a formatted string
        conversation_history = "\n".join(
            f"{m.type}: {m.content}" for m in recent_messages
        )

        # Apply Instructor patch to ChatOpenAI
        patched_llm = instructor.from_openai(
            AsyncOpenAI(
                api_key=settings.openai_api_key,
            )
        )
        evaluation = await patched_llm.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert conversation evaluator. 
Your task is to determine which of the listed queries have been sufficiently addressed 
in the recent conversation history.""",
                },
                {
                    "role": "user",
                    "content": f"""Queries to evaluate:
{json.dumps(unanswered_queries)}

Recent Conversation:
{conversation_history}

Analyze which queries remain unanswered based on the conversation history.""",
                },
            ],
            response_model=QueryEvaluation,
        )

        # Determine if chat should end - all queries answered and enough back-and-forth
        should_end = (
            evaluation.all_answered and len(messages) >= MESSAGE_COUNT_THRESHOLD
        )

        return evaluation.unanswered_queries, should_end

    async def calculate_next_response_time(
        self, message_length: int, base_time: float, patience_level: float = 0.5
    ) -> float:
        """Calculate when the next response should be sent based on message length and patience.

        Args:
            message_length: Length of the message to base delay on
            base_time: Starting timestamp to add delay to
            patience_level: 0.0-1.0, where lower means more impatient

        Returns:
            Timestamp when the next response should be sent
        """
        # Base delay calculation using log scale with patience factor
        # Less patient = shorter delays
        patience_multiplier = 0.5 + patience_level  # 0.5-1.5 range
        base_delay = math.log(max(message_length, 10)) * 10 * patience_multiplier

        # Add random variation (±10%)
        variation = random.uniform(-0.1, 0.1) * base_delay

        # Ensure delay stays within bounds
        # More impatient characters have lower max delay
        max_delay = 300 * patience_multiplier
        delay_seconds = max(min(base_delay + variation, max_delay), 3)

        # Return absolute timestamp for when response should be sent
        return base_time + delay_seconds

    async def should_send_impatient_followup(self, state: State) -> bool:
        """Determine if an impatient follow-up message should be sent.

        Args:
            state: Current conversation state

        Returns:
            True if a follow-up should be sent
        """
        # Only consider follow-up if AI is impatient and no follow-up was sent yet
        if state["patience_level"] >= 0.3 or state["follow_up_sent"]:
            return False

        # Calculate time since last user message
        time_waiting = time.time() - state["last_user_message_time"]

        # More impatient characters send follow-ups sooner
        # patience 0.0 → ~20s, patience 0.3 → ~60s
        impatience_threshold = 20 + (state["patience_level"] * 133)

        return time_waiting > impatience_threshold

    def build_workflow(self):
        """Build chatbot workflow with event handling.

        This workflow now handles:
        1. Initial start
        2. New user messages via events
        3. Automatic AI responses after delay
        4. Impatient follow-ups
        5. Conversation termination
        """
        workflow = StateGraph(State)

        # Define main entry point
        workflow.add_edge(START, "customer")

        # Add the customer node that handles all logic
        workflow.add_node("customer", self.customer_node)

        # Add conditional routing
        workflow.add_conditional_edges(
            "customer",
            self.route_customer,
            {
                ChatStatus.CONTINUE: "customer",  # Continue processing
                ChatStatus.WAITING: END,  # Signal external system to wait
                ChatStatus.END: END,  # End conversation
            },
        )

        return workflow.compile()

    def route_customer(self, state: State) -> str:
        """Route to next step based on state status.

        Args:
            state: Current conversation state

        Returns:
            Next routing destination
        """
        if "status" not in state:
            return ChatStatus.CONTINUE

        return state["status"]

    async def customer_node(self, state: State, event: Optional[dict] = None) -> State:
        """Customer node that processes messages and generates responses.

        Args:
            state: Current conversation state
            event: Optional event with new user message

        Returns:
            Updated state with new messages and routing decision
        """
        # Extract current state
        messages = state["messages"]
        scenario_customer = state["scenario_customer"]
        current_time = time.time()

        # Handle new user message if provided in event
        if event and "user_message" in event:
            # Extract message from event
            user_message = event["user_message"]
            messages = list(messages) + [HumanMessage(content=user_message)]

            # Update timing and message tracking
            state["last_user_message_time"] = current_time
            state["new_user_messages"] = state.get("new_user_messages", 0) + 1

            # Extend delay time based on new message length
            additional_delay = await self.calculate_delay(len(user_message))
            new_response_time = max(
                state.get("next_response_time", 0), current_time + additional_delay
            )
            state["next_response_time"] = new_response_time

            # Update messages in state
            state["messages"] = messages

            # Return with waiting status
            return {
                **state,
                "status": ChatStatus.WAITING,
            }

        # Check if we should send an impatient follow-up
        if not state.get(
            "follow_up_sent", False
        ) and await self.should_send_impatient_followup(state):
            # Generate impatient follow-up
            follow_up_prompt = [
                SystemMessage(
                    content=f"""You are {scenario_customer.name}, and you're feeling impatient because the other person hasn't responded in a while.
Send a brief, natural-sounding follow-up message expressing your impatience.
Keep it under 15 words."""
                )
            ]

            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.7,  # Higher temp for varied responses
                api_key=settings.openai_api_key,
            )

            follow_up = llm.invoke(follow_up_prompt)
            messages = list(messages) + [follow_up]

            # Update state to mark follow-up as sent
            updated_state = {**state}
            updated_state["messages"] = messages
            updated_state["follow_up_sent"] = True
            updated_state["last_message_time"] = current_time
            updated_state["status"] = ChatStatus.CONTINUE

            return updated_state

        # Check if it's time to send the main response
        if current_time < state.get("next_response_time", 0):
            # Not time to respond yet - signal to wait and retry later
            return {
                **state,
                "status": ChatStatus.WAITING,
            }

        # Time to respond to all accumulated messages

        # Initialize LLM with customer-specific temperature
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=scenario_customer.temperature,
            api_key=settings.openai_api_key,
        )

        # Generate response considering all messages
        response = llm.invoke(messages)
        updated_messages = list(messages) + [response]

        # Calculate when the next response should be sent
        # Base it on the accumulated user messages
        last_user_messages_length = sum(
            len(m.content)
            for m in messages[-state.get("new_user_messages", 1) :]
            if isinstance(m, HumanMessage)
        )
        next_response_time = await self.calculate_next_response_time(
            max(last_user_messages_length, 10),
            current_time,
            state.get("patience_level", 0.5),
        )

        # Evaluate which queries have been answered
        updated_state = {
            "messages": updated_messages,
            "scenario_customer": scenario_customer,
            "conversation_id": state["conversation_id"],
            "last_message_time": current_time,
            "last_user_message_time": state["last_user_message_time"],
            "next_response_time": next_response_time,
            "unanswered_queries": state["unanswered_queries"],
            "patience_level": state.get("patience_level", 0.5),
            "follow_up_sent": False,  # Reset for next round
            "new_user_messages": 0,  # Reset counter
        }

        remaining_queries, should_end = await self.evaluate_query_progress(
            updated_state
        )

        # Update state with evaluation results
        updated_state["unanswered_queries"] = remaining_queries

        # If all queries are answered, signal completion
        if should_end:
            return {**updated_state, "status": ChatStatus.END}

        # Need to wait for the next scheduled time
        return {
            **updated_state,
            "status": ChatStatus.WAITING,
        }

    async def start_chat(
        self,
        scenario_customer: ScenarioCustomer,
        message: Optional[str] = None,
        conversation_id: Optional[UUID] = None,
        patience_level: Optional[float] = None,
    ) -> list[dict]:
        """Start a chat with a scenario customer.

        Args:
            scenario_customer: The scenario customer configuration
            message: Optional initial message from the trainee
            conversation_id: Optional conversation ID to track the chat
            patience_level: Optional patience level (0.0-1.0, lower = more impatient)

        Returns:
            List of chat messages
        """
        # Calculate patience level if not provided
        if patience_level is None:
            # Base patience on name/prompt keywords or use default
            prompt_lower = (scenario_customer.scenario_prompt or "").lower()
            name_lower = scenario_customer.name.lower()

            # Check for impatience indicators in name or prompt
            impatience_keywords = [
                "urgent",
                "hurry",
                "impatient",
                "busy",
                "annoyed",
                "frustrated",
            ]
            patience_keywords = ["patient", "calm", "relaxed", "understanding"]

            # Count matches (with more weight on name)
            impatience_score = sum(
                2 if k in name_lower else 1
                for k in impatience_keywords
                if k in name_lower or k in prompt_lower
            )
            patience_score = sum(
                2 if k in name_lower else 1
                for k in patience_keywords
                if k in name_lower or k in prompt_lower
            )

            # Calculate final score (0.0-1.0)
            patience_level = 0.5  # default
            if impatience_score > 0 or patience_score > 0:
                # Calculate normalized score
                patience_level = min(
                    max(0.5 + ((patience_score - impatience_score) * 0.1), 0.0), 1.0
                )

        # Set up initial system message
        messages = [
            SystemMessage(
                content=f"{scenario_customer.name}\n\n{scenario_customer.scenario_prompt}",
            ),
        ]

        # Add initial message from trainee if provided
        if message:
            messages.append(HumanMessage(content=message))

        current_time = time.time()

        # Set up initial state with expected queries
        initial_state = {
            "messages": messages,
            "scenario_customer": scenario_customer,
            "conversation_id": conversation_id or uuid4(),
            "last_message_time": current_time,
            "last_user_message_time": current_time if message else 0,
            "next_response_time": 0,  # Start immediately if no user message
            "unanswered_queries": scenario_customer.expected_queries,
            "patience_level": patience_level,
            "follow_up_sent": False,
            "new_user_messages": 1 if message else 0,
        }

        # Start the workflow
        return await self.workflow.ainvoke(initial_state)

    async def add_user_message(self, conversation_id: UUID, message: str) -> list[dict]:
        """Add a user message to an existing conversation.

        Args:
            conversation_id: The conversation ID
            message: The user message to add

        Returns:
            Updated list of chat messages
        """
        # Create event with user message
        event = {
            "user_message": message,
        }

        # Invoke the workflow with the event
        return await self.workflow.ainvoke({"conversation_id": conversation_id}, event)

    async def check_waiting_conversation(self, state: State) -> tuple[bool, State]:
        """Check if a waiting conversation is ready to continue.

        Args:
            state: Current conversation state

        Returns:
            Tuple of (is_ready, updated_state)
        """
        # Check if this is a waiting state
        if "status" not in state or state.get("status") != ChatStatus.WAITING:
            return False, state

        # Check if it's time to resume
        current_time = time.time()
        next_response_time = state.get("next_response_time", 0)

        if current_time >= next_response_time:
            # Time to resume - continue with customer node
            # Create a copy without the waiting status
            continue_state = {**state}
            if "status" in continue_state:
                del continue_state["status"]

            # Ready to continue, reinvoke the workflow
            return True, continue_state

        # Not ready yet, return the state unchanged with updated wait time
        remaining_time = next_response_time - current_time
        print(
            f"Conversation {state['conversation_id']} waiting for {remaining_time:.1f} more seconds"
        )
        return False, state

    async def schedule_waiting_conversations(self, states: list[State]) -> list[State]:
        """Check all waiting conversations and continue those that are ready.

        Args:
            states: List of conversation states to check

        Returns:
            Updated states after processing ready conversations
        """
        updated_states = []

        for state in states:
            ready, updated_state = await self.check_waiting_conversation(state)

            if ready:
                # Continue the conversation
                print(f"Continuing conversation {state['conversation_id']}")
                result = await self.workflow.ainvoke(updated_state)
                updated_states.append(result)
            else:
                # Keep waiting
                updated_states.append(updated_state)

        return updated_states
