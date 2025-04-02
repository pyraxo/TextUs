import math
import random
import re
from datetime import datetime, timedelta
from typing import List, Optional

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage

MESSAGE_COUNT_THRESHOLD = 4
NUDGE_DELAY = timedelta(seconds=10)

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


def calculate_next_response_time(
    message_length: int, base_time: datetime, patience_level: float = 0.5
) -> datetime:
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
    return base_time + timedelta(seconds=delay_seconds)


def get_patience_level(scenario_prompt: str, name: Optional[str] = None) -> float:
    """Calculate the patience level for a scenario customer.

    Args:
        scenario_customer: The scenario customer configuration

    Returns:
        Patience level (0.0-1.0, lower = more impatient)
    """
    # Base patience on name/prompt keywords or use default
    prompt_lower = (scenario_prompt or "").lower()
    name_lower = name.lower() if name else ""

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
    return patience_level


def calculate_delay(message_length: int) -> timedelta:
    """Calculate delay based on message length using logarithmic scale.

    Args:
        message_length: Length of the message to base delay on

    Returns:
        Delay time as timedelta between 3-300 seconds
    """
    # Base delay calculation using log scale
    # Shorter messages = shorter delays
    # 10 chars → ~3s, 100 chars → ~46s, 1000 chars → ~69s
    base_delay = math.log(max(message_length, 10)) * 10

    # Add random variation (±10%)
    variation = random.uniform(-0.1, 0.1) * base_delay

    # Ensure delay stays within bounds
    final_delay_seconds = max(min(base_delay + variation, 300), 3)
    return timedelta(seconds=final_delay_seconds)


def compute_next_response_time_from_messages(
    messages: List[BaseMessage],
    current_time: datetime,
    patience_level: float,
    has_new_messages: bool = False,
) -> datetime:
    """Compute when the next response should be sent based on message history.

    Args:
        messages: List of messages in the conversation
        current_time: Current timestamp
        patience_level: Patience level (0.0-1.0, lower = more impatient)
        has_new_messages: Whether there are new messages to process

    Returns:
        Datetime when the next response should be sent
    """
    if has_new_messages:
        # Get the last user messages until we hit an AI message
        last_user_messages = []
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                last_user_messages.append(msg)
            elif isinstance(msg, SystemMessage):
                continue
            else:
                break

        # Calculate total length of user messages
        total_length = sum(len(msg.content) for msg in last_user_messages)

        # Get base delay
        delay = calculate_delay(total_length)

        # Adjust for patience
        patience_multiplier = 0.5 + patience_level  # 0.5-1.5 range
        adjusted_delay = timedelta(seconds=delay.total_seconds() * patience_multiplier)

        # Find last user message time
        last_user_time = None
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                if hasattr(msg, "timestamp"):
                    last_user_time = msg.timestamp
                    break

        # Calculate next response time
        if last_user_time:
            next_time = last_user_time + adjusted_delay
            return max(next_time, current_time)

    # If no new messages or no valid last user time, use current time
    return current_time


def maybe_lowercase(text: str, patience_level: float = 0.5) -> str:
    text = re.sub(r"\b[A-Z]{2,}\b", lambda m: m.group(0).lower(), text)
    prob = patience_level
    return text.lower() if random.random() < prob else text
