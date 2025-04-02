import pytest
import uuid
from unittest.mock import AsyncMock, patch
from app.models.chat import ChatConversation
from app.models.response import MessageCreate
from app.models.chat import MessageType
from app.services.conversations import ConversationService


@pytest.mark.asyncio
async def test_get_conversations(conversation_service: ConversationService):
    # Test retrieving all conversations
    conv1 = ChatConversation()
    conv2 = ChatConversation()
    conversation_service.session.add_all([conv1, conv2])
    await conversation_service.session.commit()

    conversations = await conversation_service.get_conversations()
    assert len(conversations) >= 2


@pytest.mark.asyncio
async def test_get_conversation(conversation_service: ConversationService):
    # Test retrieving a conversation by ID
    conv = ChatConversation()
    conversation_service.session.add(conv)
    await conversation_service.session.commit()
    fetched = await conversation_service.get_conversation(conv.id)
    assert fetched.id == conv.id


@pytest.mark.asyncio
@patch("app.services.conversation_service.broadcast_message", new_callable=AsyncMock)
async def test_create_message(mock_broadcast, conversation_service: ConversationService):
    # Test creating a message in a conversation
    conv = ChatConversation()
    conversation_service.session.add(conv)
    await conversation_service.session.commit()

    msg_data = MessageCreate(
        sender_id="user123",
        content="Hello there!",
        message_type=MessageType.USER,
    )

    message = await conversation_service.create_message(conv.id, msg_data)

    assert message["conversation_id"] == conv.id
    assert message["sender_id"] == msg_data.sender_id
    assert message["content"] == msg_data.content
    assert message["message_type"] == msg_data.message_type.value
    mock_broadcast.assert_awaited_once()