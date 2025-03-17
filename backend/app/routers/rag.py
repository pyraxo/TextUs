from fastapi import APIRouter, HTTPException, Query

from app.services.chroma_db import query_chroma

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.get("/query/")
async def query_chromadb(q: str = Query(..., description="Enter your query")):
    try:
        results = query_chroma(q)
        return {"results": [doc.page_content for doc in results]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
