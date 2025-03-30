from typing import Annotated

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from app.core.config import get_settings

settings = get_settings()


class State(TypedDict):
    messages: Annotated[list, add_messages]


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=settings.openai_api_key)


def agent_node(state: State) -> State:
    return {"messages": [llm.invoke(state["messages"])]}


def build_workflow():
    workflow = StateGraph(State)

    workflow.add_edge(START, "agent")

    workflow.add_node("agent", agent_node)

    workflow.add_edge("agent", END)

    return workflow.compile()


graph = build_workflow()


async def invoke_agent(message: str) -> list[dict]:
    """Invoke an agent."""
    messages = [
        SystemMessage(
            content="",
        ),
        HumanMessage(content=message),
    ]
    result = await graph.ainvoke({"messages": messages})
    return result
