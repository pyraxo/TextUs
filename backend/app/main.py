from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.db import Database, get_session
from app.models.user import User
from app.routers import conversations, rag, scenarios

settings = get_settings()
db = Database()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Initialize database and create tables
    await db.start()
    yield
    # Close database connections
    await db.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)

app.include_router(scenarios.router)
app.include_router(rag.router)
app.include_router(conversations.router)


@app.get("/")
async def root():
    return {"message": "Hello, World!"}


@app.get("/db-test")
def db_test(session: Session = Depends(get_session)):
    """Test database connection."""
    try:
        session.exec(select(User)).all()
        return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {e}"}
