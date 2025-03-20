import os

# from app.services.chroma_db import query_chroma #WIP
from dotenv import load_dotenv
from openai import OpenAI

from .eval_types import AgentResponse, UserMessage

# Load environment variables
load_dotenv()


def evaluate_agent_response(
    customer_message: UserMessage, agent_response: AgentResponse
):
    # replace with your file path
    with open("prompt.txt", "r") as file:
        prompt = file.read()

    # retrieved_docs = query_chroma(customer_message.text) #still fixing
    # retrieved_knowledge = "\n".join([doc.page_content for doc in retrieved_docs])

    # Initialize OpenAI client
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")  # Reads API key from .env
    )

    # OpenAI API request to evaluate the response
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Customer message: {customer_message.text}\n"
                f"Agent response: {agent_response.text}\n",
            },
            # f"Relevant CPF Knowledge: {retrieved_knowledge}\n\n"
            # "Assess the accuracy of the agent's response based on the CPF knowledge."} #add back in once RAG is working
        ],
        max_tokens=350,
    )

    # Example result handling
    evaluation_result = response.choices[
        0
    ].message.content.strip()  # Process the response as needed
    return evaluation_result


# Example usage for now, to be replaced with actual chat messages later on
customer_msg = UserMessage(
    text="Why is interest earned on my CPF LIFE premium not included as part of the amount paid to my beneficiaries when I pass away?"
)
agent_resp = AgentResponse(
    text="CPF LIFE is a longevity insurance scheme that provides you with a monthly payout for as long as you live. When you join CPF LIFE, your CPF LIFE premium will be paid with your CPF savings. Projected interest earned on your CPF LIFE premium is factored into your monthly payouts from the start. Your CPF LIFE payouts will be drawn from your CPF LIFE premium first. When your CPF LIFE premium is exhausted, you will then draw your monthly payouts for as long as you live from the interest that you and other CPF LIFE members have accumulated. The lifelong payouts under CPF LIFE for all members are made possible through this method of interest accumulation. That is why interest does not form part of the amount paid to the beneficiaries of CPF LIFE members when they pass away. If you pass on before your CPF LIFE premium is exhausted, the CPF LIFE premium balance (if any) together with any remaining CPF savings will be distributed to your loved ones."
)

# Call the evaluation function
evaluation_result = evaluate_agent_response(customer_msg, agent_resp)
print(evaluation_result)
