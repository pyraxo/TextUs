from asyncio import sleep
from datetime import datetime, timedelta
from random import random

import instructor
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.types import RunnableConfig, interrupt
from openai import OpenAI

from app.chatter.chat_types import State
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

    customer_id = state.get("customer_id")
    if not customer_id:
        print("Customer ID not found, so we don't need to send a new message")
        return state

    print(f"START_CHAT: {customer_id}")

    first_message = await generate_question(state)
    print(f"First message: {first_message.content}")

    state["to_send"] = first_message.content
    state["to_send_from"] = MessageType.BOT

    print(f"Customer: {first_message.content}")
    state["conversation_history"] += [f"Customer: {first_message.content}"]
    state["messages"] += [first_message]
    state["last_message_time"] = datetime.now()
    print(f"State: {state}")
    return state


async def send_message(state: State, config: RunnableConfig) -> State:
    """Send a message"""

    send_message_func = config.get("configurable").get("send_message_func", None)

    # Print all keys in state and their type'
    print("THIS IS THE STATE:")
    for key, value in state.items():
        print(f"{key}: {type(value)}")

    trainee_id = state.get("trainee_id", None)
    conversation_id = state.get("conversation_id", None)

    print("I AM TRYING TO SEND A MESSAGE")

    if not trainee_id or not conversation_id:
        print(
            "Trainee ID or conversation ID not found, so we don't need to send a message"
        )
        return state

    to_send = state.get("to_send", None)
    if to_send:
        print(f"Sending message: {state['to_send']}")
        await send_message_func(
            conversation_id=conversation_id,
            trainee_id=trainee_id,
            content=state["to_send"],
            message_type=state.get("to_send_from", MessageType.BOT),
        )
        state["to_send"] = None
        state["to_send_from"] = None
    return state


async def handle_agent_input(state: State, config: RunnableConfig) -> State:
    """Handle the agent input"""
    if state.get("should_end_chat", False):
        return state

    # # TODO: Nudge delay will never be reached, as we're not waiting for a response
    # if current_time - last_message_time > NUDGE_DELAY:
    #     nudge_message = await generate_nudge(state)
    #     await send_message(
    #         conversation_id=state.get("conversation_id"),
    #         trainee_id=state.get("customer_id"),
    #         trainee_id=state.get("trainee_id"),
    #         content=nudge_message.content,
    #         message_type=MessageType.BOT,
    #     )
    #     print(f"Nudge sent to trainee {trainee_id}")
    #     state["last_message_time"] = current_time
    #     state["conversation_history"].append(f"Customer: {nudge_message.content}")

    # Check if this is a resumed run with a message (interrupt)
    thread_id = config.get("configurable", {}).get("thread_id", None)

    if config.get("is_resumed", False) and config.get("resumed_with", None):
        # When we're resumed with a message directly (from the double texting implementation)
        user_response = config.get("resumed_with")
        print(f"Resumed with message: {user_response}")
    else:
        # Traditional interrupt to wait for user input
        user_response = interrupt({"id": thread_id})
        print("RETURNED FROM INTERRUPT")

    state["conversation_history"] += [f"Agent: {user_response}"]
    human_message = HumanMessage(content=user_response)
    # TODO: Dynamically affect patience level?
    state["messages"] += [human_message]
    state["last_user_message_time"] = datetime.now()
    return state


async def generate_customer_response(state: State, config: RunnableConfig) -> State:
    """Generate the customer response"""
    if state.get("should_end_chat", False):
        return state

    last_user_message_time = state.get("last_user_message_time", None)
    if not last_user_message_time:
        print("Warning: No last user message time, continuing without delay")
    else:
        # Apply a short delay if this is a normal flow (not from a double-texting interrupt)
        # We want to reduce delay when double-texting to be more responsive
        if not config.get("is_resumed", False):
            time_since_last_message = datetime.now() - last_user_message_time
            if time_since_last_message < timedelta(seconds=2):
                delay_time = 2 - time_since_last_message.total_seconds()
                if delay_time > 0:
                    print(f"Adding a short {delay_time:.1f}s delay for realism...")
                    await sleep(delay_time)

    customer_response = await generate_response(state)
    state["to_send"] = customer_response.content
    state["to_send_from"] = MessageType.BOT

    print(f"Customer: {customer_response.content}")

    state["conversation_history"] += [f"Customer: {customer_response.content}"]
    state["messages"] += [customer_response]
    state["last_message_time"] = datetime.now()
    state["agent_reply"] = ""
    return state


async def check_termination(state: State) -> State:
    """Check if the conversation should be terminated"""
    print("CHECK_TERMINATION")
    state["should_end_chat"] = random() < (1 - state["patience_level"])
    if state["should_end_chat"]:
        print("Customer has ended the chat.")
    else:
        print("Customer has not ended the chat.")
    return state


async def end_chat(state: State, config: RunnableConfig):
    """End the chat"""
    end_chat_func = config.get("configurable").get("end_chat_func", None)

    await sleep(1)

    await end_chat_func(
        conversation_id=state.get("conversation_id"),
        trainee_id=state.get("trainee_id"),
    )

    return state


# TODO: Tool use for interrupt?
