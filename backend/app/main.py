from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.chatter.scheduler import get_scheduler
from app.core.config import get_settings
from app.core.db import close_db, get_session
from app.core.middleware import AuthCookieMiddleware
from app.core.rate_limiter import RateLimiter
from app.models.user import User
from app.routers import (
    admin_router,
    auth_router,
    conversations_router,
    customers_router,
    rag_router,
    scenarios_router,
    schemes_router,
    users_router,
    ws_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan for the FastAPI app."""

    # Start the conversation scheduler
    scheduler = get_scheduler(session_factory=get_session)
    await scheduler.start()

    yield

    # Stop the scheduler before closing database
    await scheduler.stop()

    # Close database connections
    await close_db()


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)

# Add rate limiting middleware
app.add_middleware(RateLimiter)

# Add authentication cookie middleware
app.add_middleware(AuthCookieMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(scenarios_router)
app.include_router(schemes_router)
app.include_router(rag_router)
app.include_router(conversations_router)
app.include_router(ws_router)
app.include_router(customers_router)


@app.get("/")
async def root():
    return {"message": "Hello, World!"}


@app.get("/db-test")
async def db_test(session: AsyncSession = Depends(get_session)):
    """Test database connection."""
    try:
        (await session.exec(select(User))).all()
        return {"message": "Database connection successful!"}
    except Exception as e:
        return {"message": f"Database connection failed: {e}"}
