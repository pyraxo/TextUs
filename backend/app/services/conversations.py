from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.models.chat import ChatConversation, ChatMessage
from app.models.response import MessageCreate
from app.routers.ws import broadcast_message


class ConversationService:
    """Service for conversation operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_conversations(self):
        """Get all conversations."""
        statement = select(ChatConversation).options(
            selectinload(ChatConversation.scenario_customer),
            selectinload(ChatConversation.messages),
        )
        results = (await self.session.exec(statement)).all()
        return results

    async def get_conversation(self, conversation_id: UUID):
        """Get a conversation by ID."""
        statement = (
            select(ChatConversation)
            .where(ChatConversation.id == conversation_id)
            .options(
                selectinload(ChatConversation.scenario_customer),
                selectinload(ChatConversation.messages),
            )
        )
        result = (await self.session.exec(statement)).first()
        return result

    async def create_message(
        self,
        conversation_id: UUID,
        message: MessageCreate,
    ):
        """Create a message."""
        chat_message = ChatMessage(
            conversation_id=conversation_id,
            message=message.content,
            sender_id=message.sender_id,
            message_type=message.message_type,
        )
        self.session.add(chat_message)
        await self.session.commit()
        await self.session.refresh(chat_message)

        # Broadcast the message to all connected clients
        await broadcast_message(chat_message)

        # Return a formatted response
        return {
            "id": chat_message.id,
            "conversation_id": chat_message.conversation_id,
            "sender_id": chat_message.sender_id,
            "content": chat_message.message,
            "timestamp": str(chat_message.timestamp),
            "message_type": chat_message.message_type.value,
        }
