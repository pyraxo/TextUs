from uuid import UUID

from fastapi import Depends, HTTPException
from langgraph.types import Command
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.workflow import get_chatbot
from app.core.db import get_session
from app.models.chat import ChatConversation, ChatMessage
from app.models.response import MessageCreate, MessageResponse
from app.models.scenario_customer import ScenarioCustomer
from app.routers.ws import broadcast_message


class ConversationService:
    """Service for conversation operations."""

    def __init__(self, session: AsyncSession = Depends(get_session)):
        self.session = session

    async def get_conversations(self) -> list[ChatConversation]:
        """Get all conversations."""
        statement = (
            select(ChatConversation)
            .options(
                selectinload(ChatConversation.scenario_customer).selectinload(
                    ScenarioCustomer.scenario
                ),
                selectinload(ChatConversation.messages),
            )
            .join(
                ChatConversation.scenario_customer
            )  # Inner join to ensure scenario_customer exists
        )
        results = (await self.session.exec(statement)).all()
        return results

    async def get_conversation(self, conversation_id: UUID):
        """Get a conversation by ID."""
        statement = (
            select(ChatConversation)
            .where(ChatConversation.id == conversation_id)
            .options(
                selectinload(ChatConversation.scenario_customer).selectinload(
                    ScenarioCustomer.scenario
                ),
                selectinload(ChatConversation.messages),
            )
            .join(
                ChatConversation.scenario_customer
            )  # Inner join to ensure scenario_customer exists
        )
        result = (await self.session.exec(statement)).first()
        if not result:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return result

    async def create_message(
        self,
        conversation_id: UUID,
        message: MessageCreate,
    ) -> MessageResponse:
        """Create a message."""
        conversation = await self.get_conversation(conversation_id)

        # If sender_id is a UUID, convert it to string. Otherwise use as is.
        sender_id_str = str(message.sender_id)

        chat_message = ChatMessage(
            conversation_id=conversation.id,
            message=message.content,
            sender_id=sender_id_str,
            message_type=message.message_type,
        )
        self.session.add(chat_message)
        await self.session.commit()
        await self.session.refresh(chat_message)

        # Broadcast the message to all connected clients
        await broadcast_message(chat_message)

        # Resume the chatbot if it's waiting for a response
        # if conversation.status == ConversationStatus.WAITING:
        #     chatbot = await get_chatbot()
        #     await chatbot.ainvoke(Command(resume=conversation.id))
        # Or can we assume it will always be waiting?
        chatbot = await get_chatbot()
        await chatbot.ainvoke(Command(resume=conversation.id))

        # For now, we use this method. But multiple responses may end up being dropped
        # in the chat history evaluation.

        # Return a formatted response
        return MessageResponse(
            id=chat_message.id,
            conversation_id=chat_message.conversation_id,
            sender_id=chat_message.sender_id,
            content=chat_message.message,
            timestamp=chat_message.timestamp,
            message_type=chat_message.message_type,
        )
