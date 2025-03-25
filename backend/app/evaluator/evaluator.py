import os
import logging
from dotenv import load_dotenv
from openai import OpenAI
from app.evaluator.eval_types import Chat_Transcript
from app.services.chroma_db import query_chroma

#for the RAG to work, ensure that the knowledge base has been loaded into chroma

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_customer_queries(chat_transcript: str) -> str:
    """
    Extracts only the customer queries from the chat transcript using OpenAI.
    """
    extraction_prompt = (
        "Extract only the customer's questions or queries from the following chat transcript. "
        "Ignore agent responses and any other irrelevant details. "
        "Return the extracted queries as a list of sentences:\n\n"
        f"Chat Transcript:\n{chat_transcript}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts customer queries from chat transcripts."},
                {"role": "user", "content": extraction_prompt}
            ],
            max_tokens=300,
        )

        extracted_queries = response.choices[0].message.content.strip()
        logging.info("Extracted Customer Queries:\n" + extracted_queries)

        return extracted_queries
    except Exception as e:
        logging.error(f"Error extracting customer queries: {e}")
        return ""

def fetch_rag_results(chat_transcript: str):
    """
    Queries ChromaDB with only the extracted customer queries instead of the full transcript.
    """
    customer_queries = extract_customer_queries(chat_transcript)

    if not customer_queries:
        logging.warning("No customer queries extracted. Skipping RAG retrieval.")
        return []

    try:
        retrieved_docs = query_chroma(customer_queries)
        knowledge = [doc.page_content for doc in retrieved_docs]

        if knowledge:
            logging.info("Retrieved Knowledge from ChromaDB:")
            for idx, doc in enumerate(knowledge, 1):
                logging.info(f"{idx}. {doc}")
        else:
            logging.warning("No relevant information retrieved from ChromaDB.")

        return knowledge
    except Exception as e:
        logging.error(f"Error querying ChromaDB: {e}")
        return []

def evaluate_agent_response(chat_transcript: Chat_Transcript):
    """
    Evaluates the agent's response based on retrieved knowledge and chat transcript.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(script_dir, "prompt.txt")

    with open(prompt_path, "r", encoding="utf-8") as file:
        prompt = file.read()

    retrieved_knowledge = fetch_rag_results(chat_transcript.text)
    knowledge_text = "\n".join(retrieved_knowledge) if retrieved_knowledge else "No additional knowledge available."

    system_message = (
        f"{prompt}\n\n"
        f"---\n"
        f"Additional Knowledge (RAG Results):\n"
        f"{knowledge_text}"
    )

    logging.info("Final System Prompt for OpenAI API:\n" + system_message[:500] + "...")  
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Chat Transcript: {chat_transcript}"}
        ], 
        max_tokens=500,
    )

    evaluation_result = response.choices[0].message.content.strip()
    return evaluation_result

# Example usage
chat_transcript = Chat_Transcript(
    text="Agent: If you are on CPF LIFE and have started your monthly payouts, the refunds to your RA will be used to increase your CPF LIFE premium. "
         "Customer: Premium? So, smaller payouts *now* for more later? "
         "Agent: Changes to your Retirement Account (RA) can affect your monthly payouts. This is because your RA savings is one of the factors in determining your CPF LIFE payouts. "
         "Outflow from your RA, such as lump sum withdrawals will reduce your CPF LIFE monthly payouts. On the other hand, inflows to your RA, such as top-ups, or refunds from selling your property or investments will be automatically used to increase your CPF LIFE premium, and allow you to receive higher monthly payouts. "
         "If you have started receiving your CPF LIFE monthly payouts, we will inform you of any revision in your monthly payouts in the following month after the outflow/inflow of funds. "
         "Customer: Okay, but are you even answering my actual question? Property, cash... hello? "
         "Agent: Customer: Seriously? Still waiting. This shouldn't be this hard. "
         "Agent: Customer: So, using property *will* lower my payouts if I take the money out? What about just topping up with cash? "
         "Agent: Customer: Hello? Still waiting on the cash top-up part of that question.",
    timestamps=""
)

# Call the evaluation function
evaluation_result = evaluate_agent_response(chat_transcript)
print("\nEvaluation Result:\n", evaluation_result)
