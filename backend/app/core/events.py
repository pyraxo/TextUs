"""
Event handling for application-wide events.

This module provides event broadcasting and subscribing capabilities
to help eliminate circular imports while allowing components to
communicate with each other.
"""

import logging
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, List

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Types of events supported by the event system."""

    SESSION_COMPLETED = "session_completed"
    CONVERSATION_ENDED = "conversation_ended"


# Type for event handlers: coroutines that take event data
EventHandler = Callable[[Any], Coroutine[Any, Any, None]]


class EventBus:
    """Simple event bus for application-wide events."""

    def __init__(self):
        self.subscribers: Dict[EventType, List[EventHandler]] = {}

    def subscribe(self, event_type: EventType, handler: EventHandler) -> None:
        """Subscribe to an event type with a handler function."""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)

    async def publish(self, event_type: EventType, data: Any = None) -> None:
        """Publish an event to all subscribers."""
        if event_type not in self.subscribers:
            return

        for handler in self.subscribers[event_type]:
            try:
                await handler(data)
            except Exception as e:
                logger.error(f"Error in event handler for {event_type}: {e}")


# Global event bus instance
event_bus = EventBus()
