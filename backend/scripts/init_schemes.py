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
from app.models.scheme import Scheme
from app.models.user import User, UserType
from sqlmodel import Session, SQLModel, create_engine

settings = get_settings()
# Convert async database URL to sync URL for initialization
database_url = settings.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")
engine = create_engine(database_url)


async def init_schemes() -> None:
    """Initialize default schemes."""
    schemes_data = [
        {
            "name": "Housing Schemes",
            "description": "CPF schemes related to housing and property.",
        },
        {
            "name": "Healthcare",
            "description": "Healthcare-related CPF schemes including MediSave and MediShield Life.",
        },
        {
            "name": "Retirement Planning",
            "description": "Retirement schemes including CPF LIFE.",
        },
        {
            "name": "Education Financing",
            "description": "Education financing through CPF.",
        },
        {
            "name": "Investment Schemes",
            "description": "CPF investment schemes and options.",
        },
        {
            "name": "Self-Employed Matters",
            "description": "CPF matters specific to self-employed persons.",
        },
        {
            "name": "CPF Contributions",
            "description": "General CPF contribution matters.",
        },
    ]

    with Session(engine) as session:
        # Get admin user for created_by reference
        admin_user = (
            session.query(User).filter(User.user_type == UserType.ADMIN).first()
        )

        if not admin_user:
            raise ValueError("Admin user not found. Please run init_users.py first.")

        for scheme_data in schemes_data:
            # Check if scheme already exists
            existing_scheme = (
                session.query(Scheme).filter(Scheme.name == scheme_data["name"]).first()
            )

            if not existing_scheme:
                scheme = Scheme(
                    id=uuid4(),
                    created_by_id=admin_user.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    **scheme_data,
                )
                session.add(scheme)

        session.commit()


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    asyncio.run(init_schemes())
    print("Schemes initialized successfully!")
