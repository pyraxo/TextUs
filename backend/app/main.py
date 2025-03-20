from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.db import Database, get_session
from app.core.middleware import AuthCookieMiddleware
from app.models.user import User
from app.routers import admin, auth, conversations, rag, scenarios, schemes, users, ws

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)

# Add authentication cookie middleware
app.add_middleware(AuthCookieMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(scenarios.router)
app.include_router(schemes.router)
app.include_router(rag.router)
app.include_router(conversations.router)
app.include_router(ws.router)


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
