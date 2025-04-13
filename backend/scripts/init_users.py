#!/usr/bin/env python3

import asyncio
import sys
from datetime import datetime
from pathlib import Path
from uuid import uuid4

# Add the parent directory to Python path so we can import app
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.user import User, UserType
from sqlmodel import Session, SQLModel, create_engine

settings = get_settings()

# Convert async database URL to sync URL for initialization
database_url = settings.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")
engine = create_engine(database_url)


async def init_users() -> None:
    """Initialize default users."""
    with Session(engine) as session:
        # Check if admin user already exists
        admin_exists = (
            session.query(User).filter(User.user_type == UserType.ADMIN).first()
        )
        if not admin_exists:
            admin = User(
                id=uuid4(),
                email="admin@example.com",
                name="Admin User",
                user_type=UserType.ADMIN,
                joined_at=datetime.now(),
                last_login=datetime.now(),
                password=get_password_hash("admin"),
            )
            session.add(admin)

        # Check if test trainer already exists
        trainer_exists = (
            session.query(User).filter(User.user_type == UserType.TRAINER).first()
        )
        if not trainer_exists:
            trainer = User(
                id=uuid4(),
                email="trainer@example.com",
                name="Trainer User",
                user_type=UserType.TRAINER,
                joined_at=datetime.now(),
                last_login=datetime.now(),
                password=get_password_hash("123"),
            )
            session.add(trainer)

        session.commit()

        # Check if test user already exists
        trainee_exists = (
            session.query(User).filter(User.user_type == UserType.TRAINEE).first()
        )
        if not trainee_exists:
            test_user = User(
                id=uuid4(),
                email="test@example.com",
                name="Test User",
                user_type=UserType.TRAINEE,
                joined_at=datetime.now(),
                last_login=datetime.now(),
                password=get_password_hash("test"),
            )
            session.add(test_user)

        session.commit()


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    asyncio.run(init_users())
    print("Users initialized successfully!")
