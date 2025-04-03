from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.evaluator.evaluator import evaluate_chat_transcript

class ChatTranscriptRequest(BaseModel):
    text: str

# Initialize API router
router = APIRouter()

@router.post("/evaluate")
async def evaluate_chat(request: ChatTranscriptRequest):
    """
    API endpoint to evaluate a chat transcript.
    """
    try:
        return evaluate_chat_transcript(request.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
