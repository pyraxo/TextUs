import logging
import os

import instructor
from openai import AsyncOpenAI

from app.core.config import get_settings
from app.evaluator.eval_types import ChatTranscript, EvaluationMetric, EvaluationResult
from app.services.chroma_db import answer_query

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

settings = get_settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)
structured_client = instructor.from_openai(AsyncOpenAI(api_key=settings.openai_api_key))

# Define evaluation metrics
EVALUATION_METRICS: list[EvaluationMetric] = [
    "accuracy",
    "comprehension",
    "tone",
    "chat_handling",
]


def load_prompt(metric: str) -> str:
    """Load the evaluation prompt for a specific metric."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(script_dir, f"{metric}_prompt.txt")

    with open(prompt_path, "r", encoding="utf-8") as file:
        return file.read()


async def evaluate_chat_transcript(
    chat_transcript: ChatTranscript,
) -> dict:
    """
    Extracts customer queries, retrieves relevant knowledge, and evaluates agent responses.
    Returns a dictionary with evaluation metrics and results.
    """
    try:
        evaluation_results = {}

        # Step 1: Extract customer queries from the chat transcript (for RAG)
        extraction_prompt = (
            "Extract only the customer's questions or queries from the following chat transcript. "
            "Ignore agent responses and any other irrelevant details. "
            "Return the extracted queries as a list of sentences:\n\n"
            f"Chat Transcript:\n{chat_transcript.text}"
        )

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant that extracts customer queries from chat transcripts.",
                },
                {"role": "user", "content": extraction_prompt},
            ],
            max_tokens=500,
        )

        customer_queries = response.choices[0].message.content.strip()
        logging.info("Extracted Customer Queries:\n" + customer_queries)

        # Step 2: Evaluate each metric (ENSURE STRUCTURED RESPONSE)
        for metric in EVALUATION_METRICS:
            logging.info(f"Evaluating {metric}...")

            prompt = load_prompt(metric)
            system_message = prompt  # Default system message

            # RAG retrieval only for accuracy
            if metric == "accuracy":
                retrieved_docs = answer_query(customer_queries)
                logging.info(f"Retrieved Knowledge from RAG:\n{retrieved_docs}")
                system_message = (
                    f"{prompt}\n\n---\nRelevant Knowledge:\n{retrieved_docs}"
                )

            # Structured response using Instructor
            try:
                result = await structured_client.chat.completions.create(
                    model="gpt-4o-mini",
                    response_model=EvaluationResult,
                    messages=[
                        {"role": "system", "content": system_message},
                        {
                            "role": "user",
                            "content": f"Chat Transcript: {chat_transcript.text}",
                        },
                    ],
                    max_tokens=2000,
                )

                # Convert EvaluationResult to dictionary for serialization
                evaluation_results[metric] = result.model_dump()

                print(f"Metric: {result.metric}")
                print(f"Score: {result.score}")
                print(f"Justification: {result.justification}")
                print(f"Problematic responses: {result.problematic_responses}")
                print(f"Revised response: {result.revised_response}")
            except Exception as e:
                logging.error(f"Error evaluating {metric}: {e}")
                evaluation_results[metric] = {
                    "metric": metric,
                    "score": 0,
                    "justification": f"Error evaluating: {str(e)}",
                    "problematic_responses": "",
                    "revised_response": "",
                }

        return evaluation_results

    except Exception as e:
        logging.error(f"Error evaluating chat transcript: {e}")
        return {"error": str(e)}


# Example
# sample_transcript = ChatTranscript(
#     text=(
#         "Agent: If you are on CPF LIFE and have started your monthly payouts, the refunds to your RA will be used to increase your CPF LIFE premium. "
#         "Customer: Premium? So, smaller payouts *now* for more later? "
#         "Agent: Changes to your Retirement Account (RA) can affect your monthly payouts. This is because your RA savings is one of the factors in determining your CPF LIFE payouts. "
#         "Outflow from your RA, such as lump sum withdrawals will reduce your CPF LIFE monthly payouts. On the other hand, inflows to your RA, such as top-ups, or refunds from selling your property or investments will be automatically used to increase your CPF LIFE premium, and allow you to receive higher monthly payouts. "
#         "If you have started receiving your CPF LIFE monthly payouts, we will inform you of any revision in your monthly payouts in the following month after the outflow/inflow of funds. "
#         "Customer: Okay, but are you even answering my actual question? Property, cash... hello? "
#         "Agent: Customer: Seriously? Still waiting. This shouldn't be this hard. "
#         "Agent: Customer: So, using property *will* lower my payouts if I take the money out? What about just topping up with cash? "
#         "Agent: Customer: Hello? Still waiting on the cash top-up part of that question."
#     )
# )

# Test in terminal
# evaluation_output = evaluate_chat_transcript(chat_transcript)
