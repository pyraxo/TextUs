from uuid import UUID

from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.chat_nodes import (
    check_termination,
    generate_customer_response,
    handle_agent_input,
    send_message,
    start_chat,
)
from app.chatter.chat_types import State
from app.core.common import parse_uuid
from app.core.config import get_settings
from app.models.chat import ChatConversation, ChatMessage
from app.models.user import User

settings = get_settings()


# Define the workflow but don't compile it yet
def create_workflow():
    """Create a new workflow instance"""
    graph = StateGraph(State)

    nodes = {
        "start": start_chat,
        "send_message": send_message,
        "handle_agent_input": handle_agent_input,
        "generate_customer_response": generate_customer_response,
        "check_termination": check_termination,
    }

    for node_name, node_func in nodes.items():
        graph.add_node(node_name, node_func)

    graph.add_edge(START, "start")
    graph.add_edge("start", "send_message")
    graph.add_edge("handle_agent_input", "generate_customer_response")
    graph.add_edge("generate_customer_response", "send_message")
    graph.add_edge("send_message", "check_termination")

    graph.add_conditional_edges(
        "check_termination",
        lambda state: END if state.get("end_chat", False) else "handle_agent_input",
        {"handle_agent_input": "handle_agent_input", END: END},
    )

    return graph


# Define workflow at module level for reference
workflow = create_workflow()
CHECKPOINT_DB_URL = "sqlite+aiosqlite:///../data/checkpoints.db"


async def resume_chatbot(
    session: AsyncSession,
    create_message,
    conversation_id: UUID,
    user_message: str,
    message_id: UUID,
):
    # First load the conversation history
    conversation_id = parse_uuid(conversation_id)
    conversation = await session.get(ChatConversation, conversation_id)
    await session.refresh(conversation, ["scenario_customer", "messages"])

    async with AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB_URL) as checkpointer:
        chatbot = workflow.compile(checkpointer=checkpointer)
        print(f"Resuming chatbot for conversation: {conversation_id}")

        chat_message: ChatMessage = await session.get(ChatMessage, message_id)
        user = await session.get(User, chat_message.trainee_id)

        await chatbot.ainvoke(
            Command(resume=user_message),
            config={
                "configurable": {
                    "thread_id": str(conversation_id),
                    "send_message": create_message,
                },
            },
        )

        from app.routers.ws import broadcast_message

        await broadcast_message(chat_message, user)
