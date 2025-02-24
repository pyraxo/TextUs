from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import Database
from app.routers import scenario_router

settings = get_settings()
db = Database()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.start()
    yield
    await db.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allow_methods,
    allow_headers=settings.allow_headers,
)

app.include_router(scenario_router.router)


@app.get("/")
async def root():
    return {"message": "Hello, World!"}
