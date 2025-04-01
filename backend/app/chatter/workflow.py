from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from app.chatter.chat_nodes import (
    check_termination,
    generate_customer_response,
    handle_agent_input,
    start_chat,
)
from app.chatter.chat_types import State
from app.core.config import get_settings

settings = get_settings()


# Define the workflow but don't compile it yet
def create_workflow():
    """Create a new workflow instance"""
    graph = StateGraph(State)

    nodes = {
        "start": start_chat,
        "handle_agent_input": handle_agent_input,
        "generate_customer_response": generate_customer_response,
        "check_termination": check_termination,
    }

    for node_name, node_func in nodes.items():
        graph.add_node(node_name, node_func)

    graph.add_edge(START, "start")
    graph.add_edge("start", "handle_agent_input")
    graph.add_edge("handle_agent_input", "generate_customer_response")
    graph.add_edge("generate_customer_response", "check_termination")

    graph.add_conditional_edges(
        "check_termination",
        lambda state: END if state["end_chat"] else "handle_agent_input",
        {"handle_agent_input": "handle_agent_input", END: END},
    )

    return graph


# Define workflow at module level for reference
workflow = create_workflow()

# Singleton instance
_chatbot_instance = None


async def build_chatbot():
    """Build and compile the chatbot workflow."""
    graph_to_compile = create_workflow()

    checkpointer = MemorySaver()

    return graph_to_compile.compile(checkpointer=checkpointer)


async def get_chatbot():
    """Get or create a singleton instance of the chatbot.

    Returns:
        The compiled chatbot workflow instance
    """
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = await build_chatbot()
    return _chatbot_instance
