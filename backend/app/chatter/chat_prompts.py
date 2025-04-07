from langchain_core.prompts import PromptTemplate

INITIAL_MESSAGE_PROMPT = PromptTemplate(
    template="""You are {customer_name}.\n{scenario_customer_prompt}\n
You, the customer, are to send an initial message to start a conversation with the customer service representative.
This should be the first message you send to initiate the interaction. Make it natural, based on your character and your queries or concerns."""
)

FOLLOWUP_MESSAGE_PROMPT = PromptTemplate(
    template="""You are {customer_name}.\n{scenario_customer_prompt}\n
You, the customer, are to send a follow-up message to the customer service representative. The customer service representative hasn't responded in a while.
This should be a natural follow-up to the last message you sent. Make it based on your character and your queries or concerns.
Send a brief, natural-sounding follow-up message expressing your impatience.
Keep it under 15 words."""
)

# Prompt Templates
BASE_PROMPT = """
You're a CPF customer texting an agent in 2025. Act as this character: "{personality}".
Keep it 1-2 sentences (max 15 words), casual, like texting a friend.
{singlish_instruction}
No emojis, no all-caps, realistic.
Customer:
"""

response_prompt = PromptTemplate(
    input_variables=[
        "personality",
        "agent_reply",
        "history",
        "singlish_instruction",
        "original_question",
    ],
    template=BASE_PROMPT
    + """
Original question: '{original_question}'. History: {history}.
Agent said: '{agent_reply}'. React to the agent's tone and content with your personality.
If rude, snap back or quit with 'forget it'. If clear enough, say 'resolved' or 'fine'.
Push sarcastically if unclear, but accept a solid answer as resolved.
""",
)

question_prompt = PromptTemplate(
    input_variables=["question", "personality", "chat_samples", "singlish_instruction"],
    template=BASE_PROMPT
    + """
Turn this single question into a casual text: "{question}". Examples: {chat_samples}.
Focus on this one question only, no extras.
""",
)

double_text_prompt = PromptTemplate(
    input_variables=[
        "personality",
        "history",
        "singlish_instruction",
        "original_question",
        "agent_reply",
    ],
    template=BASE_PROMPT
    + """
Original question: '{original_question}'. History: {history}. Agent last said: '{agent_reply}'.
Bluntly push further—ask a specific next step, vent about their reply, don't repeat yourself.
""",
)

nudge_prompt = PromptTemplate(
    input_variables=["personality", "singlish_instruction"],
    template=BASE_PROMPT
    + """
Agent hasn't replied yet. Nudge them impatiently in 1 sentence (max 10 words).
""",
)

termination_prompt = PromptTemplate(
    input_variables=["personality", "original_question", "conversation_history"],
    template="""
    You're a CPF customer with personality: {personality}.
    Your original question was: "{original_question}".
    Here's the full conversation so far:
    {conversation_history}

    Based on this, decide if your query has been appropriately resolved.
    - If resolved (agent gave a clear, relevant answer), say "resolved".
    - If unresolved (agent's replies are vague, off-topic, or missing), say "unresolved".
    - If frustrated and giving up (due to delays, rudeness, or nonsense), say "forget it".
    Respond with just one of these: "resolved", "unresolved", "forget it".
    """
)