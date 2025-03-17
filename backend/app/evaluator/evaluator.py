import json

from .eval_types import EvaluationResponse


def retrieve_info(agent_response: str, category: str) -> list[str]:
    """Retrieves information from the database based on the agent's response."""
    return []


def load_prompt() -> str:
    # Loads the evaluation prompt
    with open("app/Prompts/evaluator_prompt.py", "r", encoding="utf-8") as f:
        return f.read()


def evaluate_response(agent_response: str, customer_message: str) -> EvaluationResponse:
    """Evaluates an agent's response based on tone and accuracy."""
    retrieved_docs = retrieve_info(agent_response, category="evaluation")
    context = (
        "\n".join(retrieved_docs)
        if retrieved_docs
        else "No relevant CPF policies found."
    )

    prompt_template = load_prompt()

    # Format the prompt with actual values
    prompt = prompt_template.format(
        customer_message=customer_message,
        agent_response=agent_response,  # placeholder, replace with inputs from frontend
        context=context,  # context from retrieved docs
    )

    # Call OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a customer service evaluator."},
            {"role": "user", "content": prompt},
        ],
    )

    # Extract JSON response from AI
    feedback = response["choices"][0]["message"]["content"]

    try:
        parsed_feedback = json.loads(feedback)  # Convert string to dict
    except json.JSONDecodeError:
        # If JSON format fails, return default values
        parsed_feedback = {
            "tone_score": 5,
            "accuracy_score": 5,
            "feedback": "AI response format error.",
        }

    return EvaluationResponse(
        tone_score=parsed_feedback.get("tone_score", 5),
        accuracy_score=parsed_feedback.get("accuracy_score", 5),
        feedback=parsed_feedback.get("feedback", "No feedback provided."),
    )
