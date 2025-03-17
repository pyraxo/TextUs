# routing for evaluator ai
from fastapi import APIRouter
from pydantic import BaseModel

from app.evaluator.evaluator import evaluate_response  # import logic

router = APIRouter()


class UserResponse(BaseModel):
    response: str


@router.post("/evaluate")
async def evaluate(user_input: UserResponse):
    feedback = evaluate_response("Placeholder text", user_input.response)
    return {"feedback": feedback}
