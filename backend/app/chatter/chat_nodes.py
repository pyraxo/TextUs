import random
from asyncio import sleep
from datetime import datetime

import instructor
from langchain_core.messages import BaseMessage
from langchain_openai import ChatOpenAI
from langgraph.types import RunnableConfig, interrupt
from openai import OpenAI

from app.chatter.chat_types import State
from app.chatter.utils import NUDGE_DELAY
from app.core.config import get_settings
from app.models.chat import MessageType

from .chat_prompts import nudge_prompt, question_prompt, response_prompt

settings = get_settings()

patched_llm = instructor.patch(OpenAI(api_key=settings.openai_api_key))
openai_llm = ChatOpenAI(
    model="gpt-4o-mini", temperature=0, api_key=settings.openai_api_key
)

question_chain = question_prompt | openai_llm
nudge_chain = nudge_prompt | openai_llm
response_chain = response_prompt | openai_llm


async def generate_nudge(state: State) -> BaseMessage:
    """Generate a nudge message"""
    scenario_prompt = state.get("scenario_prompt")
    if not scenario_prompt:
        raise ValueError("Scenario prompt not found")
    response = await nudge_chain.ainvoke(
        {
            "personality": scenario_prompt,
            "singlish_instruction": "",
            "agent_reply": state["messages"],
            "history": "\n".join([m.content for m in state["messages"]]),
            "original_question": state.get("original_question", ""),
        }
    )
    return response


async def generate_response(state: State) -> BaseMessage:
    scenario_prompt = state.get("scenario_prompt")
    history_str = "\n".join(
        state["conversation_history"][-4:]
        if len(state["conversation_history"]) > 4
        else state["conversation_history"]
    )
    response = await response_chain.ainvoke(
        {
            "personality": scenario_prompt,
            "singlish_instruction": "",
            "agent_reply": state["messages"],
            "history": history_str,
            "original_question": state.get("original_question", ""),
        }
    )
    return response


async def generate_question(state: State) -> BaseMessage:
    singlish_instruction = "Use Singlish naturally if it fits."
    scenario_prompt = state.get("scenario_prompt")
    response = await question_chain.ainvoke(
        {
            "question": state.get("original_question", ""),
            "personality": scenario_prompt,
            # "chat_samples": "\n".join(CHAT_SAMPLES[:5])
            # if CHAT_SAMPLES
            # else "No examples.",
            "chat_samples": "",
            "singlish_instruction": singlish_instruction,
        }
    )
    return response


async def start_chat(state: State, config: RunnableConfig) -> State:
    """Start the bot"""
    if state.get("last_message_time", None):
        print("This is a retry, so we don't need to send a new message")
        return state
    print(f"START_CHAT: {state.get('customer_id')}")
    send_message = config.get("configurable").get("send_message", None)
    customer_id = state.get("customer_id")
    first_message = await generate_question(state)
    await send_message(
        conversation_id=state.get("conversation_id"),
        sender_id=customer_id,
        trainee_id=state.get("trainee_id"),
        content=first_message.content,
        message_type=MessageType.BOT,
    )
    print(f"Customer: {first_message.content}")
    state["conversation_history"].append(f"Customer: {first_message.content}")
    state = {
        **state,
        "messages": state["messages"] + [first_message],
        "last_message_time": datetime.now(),
    }
    return state


async def handle_agent_input(state: State, config: RunnableConfig) -> State:
    """Handle the agent input"""
    if state["end_chat"]:
        return state
    send_message = config.get("configurable").get("send_message", None)
    current_time = datetime.now()

    # TODO: Nudge delay will never be reached, as we're not waiting for a response
    if current_time - state.get("last_message_time", 0) > NUDGE_DELAY:
        nudge_message = await generate_nudge(state)
        await send_message(
            conversation_id=state["conversation_id"],
            sender_id=state["customer_id"],
            trainee_id=state["trainee_id"],
            content=nudge_message.content,
            message_type=MessageType.BOT,
        )
        print(f"Nudge sent to trainee {state['trainee_id']}")
        state["last_message_time"] = current_time
        state["conversation_history"].append(f"Customer: {nudge_message.content}")

    print(f"Waiting for trainee {state['trainee_id']} to respond...")
    user_response = await interrupt(
        {"id": config.get("configurable").get("thread_id", None)}
    )
    await send_message(
        conversation_id=state["conversation_id"],
        sender_id=state["trainee_id"],
        trainee_id=state["trainee_id"],
        content=user_response,
        message_type=MessageType.USER,
    )
    state["conversation_history"].append(f"Agent: {user_response.content}")
    # TODO: Dynamically affect patience level?
    state = {
        **state,
        "messages": state["messages"] + [user_response],
        "last_user_message_time": current_time,
    }
    return state


async def generate_customer_response(state: State, config: RunnableConfig) -> State:
    """Generate the customer response"""
    if state["end_chat"]:
        return state
    send_message = config.get("configurable").get("send_message", None)

    if state["agent_reply"] in {"exit", "quit", "end"}:
        state["end_chat"] = True
        print("Agent has ended the chat.")
    elif state["agent_reply"]:
        print(f"Waiting {state['wait_time']:.1f} seconds before customer response...")
        await sleep(state["wait_time"])

        customer_response = await generate_response(state)
        await send_message(
            conversation_id=state["conversation_id"],
            sender_id=state["customer_id"],
            trainee_id=state["trainee_id"],
            content=customer_response.content,
            message_type=MessageType.BOT,
        )
        messages = state["messages"] + [customer_response]

        print(f"Customer: {customer_response.content}")

        # TODO: Randomised end chat chance for now, replace later
        state["end_chat"] = random.random() < (1 - state["patience_level"])
        if state["end_chat"]:
            print("Customer has ended the chat.")
        else:
            print("Customer has not ended the chat.")

        state = {
            **state,
            "messages": messages,
            "last_message_time": datetime.now(),
            "agent_reply": "",
        }
    return state


async def check_termination(state: State) -> State:
    """Check if the conversation should be terminated"""
    return state
