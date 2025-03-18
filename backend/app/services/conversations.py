from uuid import UUID

from fastapi import Depends
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.chat import ChatConversation


async def get_conversations(session: Session = Depends(get_session)):
    """Get all conversations."""
    statement = select(ChatConversation)
    results = session.exec(statement).all()
    return results


async def get_conversation(
    conversation_id: UUID, session: Session = Depends(get_session)
):
    """Get a conversation by ID."""
    statement = select(ChatConversation).where(ChatConversation.id == conversation_id)
    result = session.exec(statement).first()
    return result
