import json
from uuid import UUID

from fastapi import Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.common import parse_uuid
from app.core.db import get_session
from app.models.chat import ChatConversation, ChatEvaluation
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

    async def get_conversation(self, conversation_id: UUID) -> ChatConversation:
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

    async def get_conversation_evaluation(self, conversation_id: UUID) -> dict:
        """Get evaluation results for a conversation."""
        conversation_id = parse_uuid(conversation_id)

        # Query for the evaluation
        statement = select(ChatEvaluation).where(
            ChatEvaluation.conversation_id == conversation_id
        )

        evaluation = (await self.session.exec(statement)).first()

        if not evaluation:
            return {"evaluation_status": "pending", "evaluation_results": None}

        # Return the evaluation results
        try:
            # Check if evaluation_results is already a dict or needs parsing
            evaluation_results = evaluation.evaluation_results
            if isinstance(evaluation_results, str):
                try:
                    evaluation_results = json.loads(evaluation_results)
                except json.JSONDecodeError:
                    # If it can't be parsed as JSON, return as-is
                    pass

            return {
                "evaluation_status": "completed",
                "evaluation_results": evaluation_results,
            }
        except Exception as e:
            # In case of any error
            return {
                "evaluation_status": "error",
                "evaluation_results": str(evaluation.evaluation_results),
                "error": str(e),
            }
