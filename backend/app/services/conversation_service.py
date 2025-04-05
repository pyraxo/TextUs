from uuid import UUID

from fastapi import Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.chat import ChatConversation
from app.models.scenario_customer import ScenarioCustomer


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
        conversation_id = parse_uuid(conversation_id)
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
