import os
import random
import re
import select
import sys
import time

import google.generativeai as genai
import pandas as pd

# Configure API Key
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))


# Load questions from Excel file
def load_questions(file_path):
    df = pd.read_excel(file_path)
    df.columns = df.columns.str.strip()
    if "Questions" not in df.columns:
        print(
            f"❌ Column 'Questions' not found in {file_path}. Found columns: {df.columns}"
        )
        exit(1)
    return df["Questions"].dropna().tolist()


# Load customer chat examples from Excel
def load_chat_styles(file_path):
    df = pd.read_excel(file_path)
    if "CustomerMessages" not in df.columns:
        print(
            f"❌ Column 'CustomerMessages' not found in {file_path}. Found columns: {df.columns}"
        )
        return []
    return df["CustomerMessages"].dropna().tolist()


# Define customer personalities, timeout ranges, and termination thresholds
customer_profiles = {
    "Angry & Demanding": "You're a ticked-off customer who's fed up with the service. You're blunt, direct, and quick to frustration, using straightforward or mildly sarcastic language, but remain conversational, reasonable, and focused on your goal.",
    "Impatient & Anxious": "You're a jittery customer who hates waiting around. You're urgent, tense, nervous, and plead for quick answers, staying anxious without becoming aggressive.",
    "Confused & Overwhelmed": "You're a customer who's lost with CPF stuff and wants it simple. You're unsure, hesitant, seeking clarity, and may escalate to mild frustration if replies don't address your question.",
    "Grateful & Friendly": "You're a chill customer who's happy to chat. You're polite, patient, appreciative, and may rephrase questions if needed, but don't overdo it.",
}
customer_timeouts = {
    "Angry & Demanding": (30, 40),
    "Impatient & Anxious": (20, 30),
    "Confused & Overwhelmed": (40, 50),
    "Grateful & Friendly": (120, 180),
}
customer_max_waits = {
    "Angry & Demanding": 3,
    "Impatient & Anxious": 4,
    "Confused & Overwhelmed": 5,
    "Grateful & Friendly": 6,
}

customer_provocation_prob = {
    "Angry & Demanding": 0.5,
    "Impatient & Anxious": 0.4,
    "Confused & Overwhelmed": 0.3,
    "Grateful & Friendly": 0.1,
}
customer_satisfaction_prob = {
    "Angry & Demanding": 0.7,
    "Impatient & Anxious": 0.8,
    "Confused & Overwhelmed": 0.8,
    "Grateful & Friendly": 0.8,
}


# Function to randomly make text lowercase and ensure no all-caps
def maybe_lowercase(text, personality):
    text = re.sub(r"\b[A-Z]{2,}\b", lambda m: m.group(0).lower(), text)
    lowercase_prob = 0.1 if personality == "Angry & Demanding" else 0.5
    if random.random() < lowercase_prob:
        return text.lower()
    return text


def generate_ai_response(
    agent_reply,
    personality,
    conversation_history,
    wait_count,
    use_singlish,
    rephrase_count,
):
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    recent_history = (
        conversation_history[-4:]
        if len(conversation_history) > 4
        else conversation_history
    )
    singlish_context = (
        " As a Singaporean, use Singlish naturally only in casual or emotional moments if it fits your tone."
        if use_singlish
        else ""
    )
    conversation_text = f"You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[personality]}{singlish_context}\n\n"

    for entry in recent_history:
        conversation_text += f"User: {entry}\n"

    original_question = (
        conversation_history[0] if conversation_history else "unknown question"
    )
    patience_phrases = ["be patient", "give me some time", "wait a bit", "let me check"]
    patience_requested = any(
        phrase in agent_reply.lower() for phrase in patience_phrases
    )

    if patience_requested:
        time.sleep(120)

    deescalate_phrases = ["sorry", "apologise", "my apologies"]
    helpful_phrases = [
        "yes",
        "here",
        "you can",
        "let me",
        "sure",
        "okay",
        "yep",
        "of course",
        "done",
        "no worries",
    ]
    should_deescalate = any(
        phrase in agent_reply.lower() for phrase in deescalate_phrases
    ) or any(phrase in agent_reply.lower() for phrase in helpful_phrases)
    deescalation_instruction = (
        "If the agent apologizes or confirms the task is done, soften your tone, accept it unless you see an issue, and ask a specific check (e.g., 'is it reflected?')."
        if should_deescalate
        else ""
    )

    if not agent_reply.strip():
        last_customer_message = next(
            (
                msg
                for msg in reversed(conversation_history)
                if not msg.startswith("Agent: ")
            ),
            None,
        )
        conversation_text += f"""
        The agent hasn't replied yet. You've waited {wait_count} time(s). Your last message was: '{last_customer_message}'.
        Your original question was: '{original_question}'. Stay focused on this goal.
        Send a single short follow-up (1-2 sentences, max 15 words) that reflects your personality and escalates with each wait.
        - Angry & Demanding: Start direct, get more frustrated, use straightforward language, mild sarcasm if needed.{singlish_context if use_singlish else ""}
        - Impatient & Anxious: Start urgent, increase nervousness, plead for quick answers.{singlish_context if use_singlish else ""}
        - Confused & Overwhelmed: Start unsure, grow more confused, seek clarity, escalate to mild frustration if ignored.{singlish_context if use_singlish else ""}
        - Grateful & Friendly: Start polite, remain patient, show appreciation, don't rephrase endlessly.{singlish_context if use_singlish else ""}
        Don't repeat the original question—tie to the last message instead.
        Keep responses consistent with the conversation history, don't repeat questions already asked. Keep it super casual, like texting a friend—short, raw, real. No emojis, no overacting, no all-caps words.
        Customer:
        """
    else:
        rephrase_phrases = [
            "rephrase",
            "what's your question",
            "can you clarify",
            "what do you mean",
        ]
        info_request_phrases = ["nric", "details", "information"]
        is_rephrase_request = any(
            phrase in agent_reply.lower() for phrase in rephrase_phrases
        )
        is_info_request = any(
            phrase in agent_reply.lower() for phrase in info_request_phrases
        )
        rephrase_instruction = (
            f"You've rephrased {rephrase_count} times. If over 2, provide a new question or end the chat politely."
            if is_rephrase_request
            else ""
        )
        info_response = (
            "If asked for info (e.g., NRIC), provide it or ask how it helps answer your question."
            if is_info_request
            else ""
        )

        cant_help_phrases = [
            "not my department",
            "different organisation",
            "we don't do that",
            "we can't",
            "out of my hands",
        ]
        cant_help = any(phrase in agent_reply.lower() for phrase in cant_help_phrases)

        conversation_text += f"""
        The agent replied: '{agent_reply}'. React as a CPF customer in 2025, staying strictly in character: {customer_profiles[personality]}{singlish_context}.
        Your original question was: '{original_question}'. Base your response on the agent's reply and history: {recent_history}.
        If the reply answers your original question (e.g., timeframe, yes/no, details), acknowledge it and either end politely or ask a specific follow-up about the reply. Don't repeat the same question unless it's unclear or contradicts history.
        Send a single short response (1-2 sentences, max 15 words), super casual, like texting a friend.{singlish_context if use_singlish else ""}
        - Angry & Demanding: Be blunt, direct, or mildly sarcastic if vague, but engage with guidance; ask specific follow-ups.
        - Impatient & Anxious: Be urgent, nervous, plead for clarity, accept completion unless you notice a problem.
        - Confused & Overwhelmed: Be unsure, ask for simpler explanations, escalate to mild frustration if reply doesn't clarify.
        - Grateful & Friendly: Be chill, appreciative, or curious; if asked to rephrase, do so once or twice max.
        {rephrase_instruction}
        {info_response}
        {deescalation_instruction}
        If the reply resolves your goal or seems final, end with a short, in-character line (e.g., ‘ok lah, thanks').
        If the agent says they can't help (e.g., "not my department"), acknowledge and ask a follow-up or end politely.
        Keep responses consistent with the conversation history, don't make incorrect assumptions. Occasionally add a follow-up question (20% chance). Avoid repetition, adapt to reply's tone. No emojis, no overacting, no all-caps words.
        Customer:
        """

    response = model.generate_content(
        [conversation_text],
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        ],
    )

    other_personalities = [p for p in customer_profiles.keys() if p != personality]
    if any(p in response.text for p in other_personalities):
        print("Detected multi-personality output, regenerating...")
        return generate_ai_response(
            agent_reply,
            personality,
            conversation_history,
            wait_count,
            use_singlish,
            rephrase_count,
        )

    return maybe_lowercase(response.text, personality)


def make_question_conversational(question, personality, chat_samples, use_singlish):
    model = genai.GenerativeModel("gemini-2.0-flash")
    chat_examples = (
        "\n".join(chat_samples[:5]) if chat_samples else "No examples available."
    )
    singlish_context = (
        " As a Singaporean, use Singlish naturally only in casual moments if it feels right."
        if use_singlish
        else ""
    )

    prompt = f"""
    You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[personality]}{singlish_context}.
    Turn this question into a single natural, conversational text: "{question}".
    Use these chat examples for tone and style: Examples: {chat_examples}
    
    Keep it short (1-2 sentences, max 15 words), super casual, like texting a friend.{singlish_context if use_singlish else ""}
    - Angry & Demanding: Be direct, pushy, use raw language.
    - Impatient & Anxious: Be urgent, tense, nervous.
    - Confused & Overwhelmed: Be hesitant, unsure, seek clarity.
    - Grateful & Friendly: Be chill, friendly, show appreciation.
    Avoid impatience markers like '...' or 'waiting'—this is the first message.
    No emojis, no overacting, no all-caps words.
    Customer:
    """

    response = model.generate_content([prompt])
    if response and hasattr(response, "text"):
        other_personalities = [p for p in customer_profiles.keys() if p != personality]
        if any(p in response.text for p in other_personalities):
            print("Detected multi-personality output, regenerating...")
            return make_question_conversational(
                question, personality, chat_samples, use_singlish
            )
        return maybe_lowercase(response.text.strip(), personality)
    else:
        return question


# Chat simulation loop
def chat_simulation():
    print("Starting CPF Customer Chat Simulation...\n")

    excel_file = "questions.xlsx"
    questions = load_questions(excel_file)
    chat_file = "customer_chats.xlsx"
    chat_samples = load_chat_styles(chat_file)

    if not questions:
        print("No questions found in the Excel file!")
        return

    customer_personality = random.choice(list(customer_profiles.keys()))
    use_singlish = random.random() < 0.5
    print(
        f"Customer Personality: {customer_personality} ({customer_profiles[customer_personality]}{' (with Singlish)' if use_singlish else ''})\n"
    )

    conversation_history = []
    wait_count = 0
    rephrase_count = 0
    unhelpful_count = 0
    confirmation_count = 0
    first_message = True

    first_question = random.choice(questions)
    conversational_question = make_question_conversational(
        first_question, customer_personality, chat_samples, use_singlish
    )

    print("Customer:", conversational_question)
    conversation_history.append(conversational_question)

    while True:
        start_time = time.time()
        timeout_range = customer_timeouts[customer_personality]
        timeout_seconds = random.uniform(timeout_range[0], timeout_range[1])
        agent_reply = ""

        print("Agent: ", end="", flush=True)
        while True:
            remaining_time = timeout_seconds - (time.time() - start_time)
            if remaining_time <= 0:
                break
            ready, _, _ = select.select([sys.stdin], [], [], remaining_time)
            if ready:
                agent_reply = sys.stdin.readline().strip()
                if not first_message and not any(
                    exit_cmd in agent_reply.lower()
                    for exit_cmd in ["exit", "quit", "end"]
                ):
                    time.sleep(random.uniform(5, 10))
                break

        rephrase_phrases = [
            "rephrase",
            "what's your question",
            "can you clarify",
            "what do you mean",
        ]
        info_request_phrases = ["nric", "details", "information"]
        is_rephrase_request = any(
            phrase in agent_reply.lower() for phrase in rephrase_phrases
        )
        is_info_request = any(
            phrase in agent_reply.lower() for phrase in info_request_phrases
        )
        if is_rephrase_request:
            rephrase_count += 1
        else:
            rephrase_count = 0

        cant_help_phrases = [
            "not my department",
            "different organisation",
            "we don't do that",
            "we can't",
            "out of my hands",
        ]
        unhelpful_phrases = ["sorry if this was unhelpful", "i don't know", "not sure"]
        cant_help = any(phrase in agent_reply.lower() for phrase in cant_help_phrases)
        unhelpful_response = (
            any(phrase in agent_reply.lower() for phrase in unhelpful_phrases)
            or "ksjdfkds.;com" in agent_reply
            or "qwiruweiurwyeriuw.com" in agent_reply
        )
        if unhelpful_response:
            unhelpful_count += 1
        else:
            unhelpful_count = 0

        # Reset wait_count and unhelpful_count if reply is relevant to the question
        relevant_keywords = {
            "submission": ["days", "approved"],
            "loan": ["deduct", "withdrawal"],
            "medisave": ["health", "medical"],
        }
        completion_phrases = [
            "done",
            "changed",
            "completed",
            "all set",
            "reflected",
            "all done",
        ]
        original_question_lower = conversation_history[0].lower()
        is_relevant = any(
            kw in original_question_lower for kw in relevant_keywords.keys()
        ) and any(
            any(w in agent_reply.lower() for w in words)
            for kw, words in relevant_keywords.items()
            if kw in original_question_lower
        )
        is_completed = any(
            phrase in agent_reply.lower() for phrase in completion_phrases
        )
        if is_completed:
            confirmation_count += 1
        else:
            confirmation_count = 0
        if is_relevant:  # Reset escalation if the reply is relevant
            wait_count = 0
            unhelpful_count = 0

        if not agent_reply:
            wait_count += 1

            if wait_count >= customer_max_waits[customer_personality]:
                termination_message = f"""
                You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[customer_personality]}{" As a Singaporean, use Singlish naturally only if it fits your tone." if use_singlish else ""}.
                You've waited {wait_count} times and are done. Your last message was: '{conversation_history[-1]}'.
                Send a single short, in-character line (max 15 words) to end the chat—reflect your personality, no emojis.
                - Angry & Demanding: Show frustration, use raw language.
                - Impatient & Anxious: Show stress.
                - Confused & Overwhelmed: Show defeat.
                - Grateful & Friendly: Show polite closure.
                Keep it casual, like texting a friend. Avoid repetition, tie to your last message. No all-caps words.
                Customer:
                """
                termination_text = (
                    genai.GenerativeModel("gemini-2.0-flash-exp")
                    .generate_content(
                        [termination_message],
                        safety_settings=[
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_NONE",
                            }
                        ],
                    )
                    .text
                )
                print(
                    "Customer:", maybe_lowercase(termination_text, customer_personality)
                )
                print("Customer has ended the chat.")
                break

            if random.random() < 0.3 and customer_personality in [
                "Impatient & Anxious",
                "Confused & Overwhelmed",
            ]:
                customer_response = generate_ai_response(
                    "",
                    customer_personality,
                    conversation_history,
                    wait_count,
                    use_singlish,
                    rephrase_count,
                )
                print("Customer:", customer_response)
                time.sleep(random.uniform(2, 5))
                follow_up = generate_ai_response(
                    "",
                    customer_personality,
                    conversation_history,
                    wait_count,
                    use_singlish,
                    rephrase_count,
                )
                print("Customer:", follow_up)
                conversation_history.extend([customer_response, follow_up])
            else:
                customer_response = generate_ai_response(
                    "",
                    customer_personality,
                    conversation_history,
                    wait_count,
                    use_singlish,
                    rephrase_count,
                )
                print("Customer:", customer_response)
                conversation_history.append(customer_response)
        else:
            if agent_reply.lower() in ["exit", "quit", "end"]:
                print("Agent has ended the chat.")
                break

            rude_keywords = ["lol", "haha", "idk", "whatever", "dunno"]
            is_rude = any(keyword in agent_reply.lower() for keyword in rude_keywords)
            if (
                is_rude
                and random.random() < customer_provocation_prob[customer_personality]
            ):
                provocation_message = f"""
                You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[customer_personality]}{" As a Singaporean, use Singlish naturally only if it fits your tone." if use_singlish else ""}.
                The agent replied: '{agent_reply}', which is rude. Send a single short, in-character line (max 15 words) to end the chat—reflect your personality, no emojis.
                - Angry & Demanding: Show anger, use raw language.
                - Impatient & Anxious: Show irritation.
                - Confused & Overwhelmed: Show disappointment.
                - Grateful & Friendly: Show mild upset.
                Keep it casual, like texting a friend. Avoid repetition, tie to the reply. No all-caps words.
                Customer:
                """
                termination_text = (
                    genai.GenerativeModel("gemini-2.0-flash-exp")
                    .generate_content(
                        [provocation_message],
                        safety_settings=[
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_NONE",
                            }
                        ],
                    )
                    .text
                )
                print(
                    "Customer:", maybe_lowercase(termination_text, customer_personality)
                )
                print("Customer has ended the chat due to agent's response.")
                break

            helpful_keywords = ["yes", "here", "you can", "let me", "sure", "okay"]
            is_helpful = (
                any(keyword in agent_reply.lower() for keyword in helpful_keywords)
                and is_relevant
            ) or (is_completed and confirmation_count >= 2)
            if (
                is_helpful
                and random.random() < customer_satisfaction_prob[customer_personality]
            ):
                satisfaction_message = f"""
                You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[customer_personality]}{" As a Singaporean, use Singlish naturally only if it fits your tone." if use_singlish else ""}.
                The agent replied: '{agent_reply}', which is helpful and answers your question. Send a single short, in-character line (max 15 words) to end the chat positively—reflect your personality, no emojis.
                - Angry & Demanding: Show grudging acceptance.
                - Impatient & Anxious: Show relief.
                - Confused & Overwhelmed: Show gratitude.
                - Grateful & Friendly: Show warmth.
                Keep it casual, like texting a friend. Avoid repetition, tie to the reply. No all-caps words.
                Customer:
                """
                termination_text = (
                    genai.GenerativeModel("gemini-2.0-flash-exp")
                    .generate_content(
                        [satisfaction_message],
                        safety_settings=[
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_NONE",
                            }
                        ],
                    )
                    .text
                )
                print(
                    "Customer:", maybe_lowercase(termination_text, customer_personality)
                )
                print("Customer has ended the chat, satisfied with the response.")
                break

            if (cant_help or unhelpful_count >= 3) and len(conversation_history) >= 4:
                termination_message = f"""
                You're a CPF customer texting an agent in 2025. Act strictly as: {customer_profiles[customer_personality]}{" As a Singaporean, use Singlish naturally only if it fits your tone." if use_singlish else ""}.
                The agent replied: '{agent_reply}', indicating they can't help or being unhelpful. Your last message was: '{conversation_history[-1]}'.
                Send a single short, in-character line (max 15 words) to end the chat—reflect your personality, no emojis.
                - Angry & Demanding: Show frustration, use raw language.
                - Impatient & Anxious: Show stress.
                - Confused & Overwhelmed: Show defeat.
                - Grateful & Friendly: Show polite closure.
                Keep it casual, like texting a friend. Avoid repetition, tie to the reply. No all-caps words.
                Customer:
                """
                termination_text = (
                    genai.GenerativeModel("gemini-2.0-flash-exp")
                    .generate_content(
                        [termination_message],
                        safety_settings=[
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_NONE",
                            }
                        ],
                    )
                    .text
                )
                print(
                    "Customer:", maybe_lowercase(termination_text, customer_personality)
                )
                print("Customer has ended the chat due to inability to assist.")
                break

            conversation_history.append(f"Agent: {agent_reply}")
            customer_response = generate_ai_response(
                agent_reply,
                customer_personality,
                conversation_history,
                wait_count,
                use_singlish,
                rephrase_count,
            )
            print("Customer:", customer_response)
            conversation_history.append(customer_response)
            wait_count = 0
            first_message = False


if __name__ == "__main__":
    chat_simulation()
