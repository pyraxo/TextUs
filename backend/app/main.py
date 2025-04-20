import logging
import sys
import traceback
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

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
    rubrics_router,
    scenarios_router,
    schemes_router,
    trainees_router,
    users_router,
    ws_router,
)

# Configure logging to reduce verbosity
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Reduce logger levels for noisy libraries
logging.getLogger("uvicorn").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan for the FastAPI app."""
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)


# Exception handlers for cleaner error output
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle SQLAlchemy errors with a cleaner, more concise output."""
    error_type = exc.__class__.__name__

    # Get only the most relevant part of the traceback (last few frames)
    tb_lines = traceback.format_exception(type(exc), exc, exc.__traceback__)
    # Get only the direct cause and main error message
    if len(tb_lines) > 5:
        tb_lines = tb_lines[-5:]

    error_detail = str(exc)
    # Extract important info from SQLAlchemy error
    if hasattr(exc, "orig") and exc.orig:
        error_detail = f"{error_detail} - Original error: {str(exc.orig)}"

    error_message = f"Database error: {error_type}: {error_detail}"
    logging.error(error_message)

    return JSONResponse(
        status_code=500,
        content={
            "error": error_type,
            "detail": error_detail,
            "traceback": "".join(tb_lines).strip(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with cleaner output."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "detail": exc.errors(),
        },
    )


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

# Add HTTPS redirect middleware
# app.add_middleware(HTTPSRedirectMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(scenarios_router)
app.include_router(schemes_router)
app.include_router(conversations_router)
app.include_router(ws_router)
app.include_router(customers_router)
app.include_router(trainees_router)
app.include_router(rubrics_router)


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
