from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.db import get_session
from app.models.chat import ChatConversation, ChatMessage
from app.models.response import MessageCreate
from app.routers.ws import broadcast_message


async def get_conversations(session: Session = Depends(get_session)):
    """Get all conversations."""
    statement = select(ChatConversation).options(
        selectinload(ChatConversation.customer_scenario),
        selectinload(ChatConversation.messages),
    )
    results = session.exec(statement).all()
    return results


async def get_conversation(
    conversation_id: UUID, session: Session = Depends(get_session)
):
    """Get a conversation by ID."""
    statement = (
        select(ChatConversation)
        .where(ChatConversation.id == conversation_id)
        .options(
            selectinload(ChatConversation.customer_scenario),
            selectinload(ChatConversation.messages),
        )
    )
    result = session.exec(statement).first()
    return result


async def create_message(
    conversation_id: UUID,
    message: MessageCreate,
    session: Session = Depends(get_session),
):
    """Create a message."""
    chat_message = ChatMessage(
        conversation_id=conversation_id,
        message=message.content,
        sender_id=message.sender_id,
        message_type=message.message_type,
    )
    session.add(chat_message)
    session.commit()
    session.refresh(chat_message)

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
