from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db import get_session
from app.services import conversations

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/")
async def get_conversations(session: Session = Depends(get_session)):
    return await conversations.get_conversations(session=session)


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: UUID, session: Session = Depends(get_session)
):
    return await conversations.get_conversation(
        conversation_id=conversation_id, session=session
    )
