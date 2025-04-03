import os
import logging
from dotenv import load_dotenv
from openai import OpenAI
from app.evaluator.eval_types import Chat_Transcript
from app.services.chroma_db import answer_query

# Load environment variables and configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EVALUATION_METRICS = ["accuracy", "comprehension", "tone", "chat_handling"]

def load_prompt(metric: str) -> str:
    """Load the evaluation prompt for a specific metric."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(script_dir, f"{metric}_prompt.txt")

    with open(prompt_path, "r", encoding="utf-8") as file:
        return file.read()

def evaluate_chat_transcript(chat_transcript: Chat_Transcript) -> dict:
    """
    Evaluates the chat transcript across multiple metrics and returns separate results.
    """
    try:
        extraction_prompt = (
            "Extract only the customer's questions or queries from the following chat transcript. "
            "Ignore agent responses and any other irrelevant details. "
            "Return the extracted queries as a list of sentences:\n\n"
            f"Chat Transcript:\n{chat_transcript.text}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts customer queries from chat transcripts."},
                {"role": "user", "content": extraction_prompt}
            ],
            max_tokens=500,
        )

        customer_queries = response.choices[0].message.content.strip()
        logging.info("Extracted Customer Queries:\n" + customer_queries)

        if not customer_queries:
            logging.warning("No customer queries extracted. Skipping RAG retrieval.")
            return {"error": "No customer queries found in the chat transcript."}

        evaluation_results = {}

        for metric in EVALUATION_METRICS:
            logging.info(f"Evaluating {metric}...")

            prompt = load_prompt(metric)
            system_message = prompt  # Default system message

            # RAG only required for accuracy metric
            if metric == "accuracy":
                retrieved_docs = answer_query(customer_queries)

                # Ensure retrieved_docs is a properly formatted string
                if isinstance(retrieved_docs, list):
                    knowledge_text = "\n".join(map(str, retrieved_docs))
                else:
                    knowledge_text = "No additional knowledge available."

                # Log retrieved knowledge correctly
                logging.info(f"Retrieved Knowledge from RAG:\n{knowledge_text}")

                system_message = f"{prompt}\n\n---\nRelevant Knowledge:\n{knowledge_text}"

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Chat Transcript: {chat_transcript.text}"}
                ], 
                max_tokens=500,
            )

            raw_evaluation = response.choices[0].message.content.strip()

            # Only save the evaluation (no additional details or suggested improvements)
            evaluation_results[metric] = {
                "evaluation": raw_evaluation
            }

        logging.info("Final Evaluation Results:\n" + str(evaluation_results))

        return evaluation_results

    except Exception as e:
        logging.error(f"Error evaluating chat transcript: {e}")
        return {"error": "Error occurred during evaluation."}

# Example
chat_transcript = Chat_Transcript(text=(
    "Agent: If you are on CPF LIFE and have started your monthly payouts, the refunds to your RA will be used to increase your CPF LIFE premium. "
    "Customer: Premium? So, smaller payouts *now* for more later? "
    "Agent: Changes to your Retirement Account (RA) can affect your monthly payouts. This is because your RA savings is one of the factors in determining your CPF LIFE payouts. "
    "Outflow from your RA, such as lump sum withdrawals will reduce your CPF LIFE monthly payouts. On the other hand, inflows to your RA, such as top-ups, or refunds from selling your property or investments will be automatically used to increase your CPF LIFE premium, and allow you to receive higher monthly payouts. "
    "If you have started receiving your CPF LIFE monthly payouts, we will inform you of any revision in your monthly payouts in the following month after the outflow/inflow of funds. "
    "Customer: Okay, but are you even answering my actual question? Property, cash... hello? "
    "Agent: Customer: Seriously? Still waiting. This shouldn't be this hard. "
    "Agent: Customer: So, using property *will* lower my payouts if I take the money out? What about just topping up with cash? "
    "Agent: Customer: Hello? Still waiting on the cash top-up part of that question."
))

# Test in terminal
evaluation_output = evaluate_chat_transcript(chat_transcript)
print("\nCleaned Output:")
for metric, result in evaluation_output.items():
    print(f"\n{metric.capitalize()}:")
    print(f"Evaluation: {result['evaluation']}")
