#!/usr/bin/env python
"""
Script to seed the database with initial test data.
This script should be run after the database tables have been created with Alembic.
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import get_settings
from app.core.db import Database
from app.models.user import User, UserType
from sqlmodel import Session, select


async def seed_db():
    """Seed the database with initial test data."""
    settings = get_settings()
    print(f"Seeding database in {settings.environment} mode")
    print(f"Database URL: {settings.database_url}")

    # Initialize the database
    db = Database()
    await db.start()

    if settings.environment == "development":
        with Session(db.engine) as session:
            # Check if we already have users
            statement = select(User)
            results = session.exec(statement).all()

            if not results:
                print("Creating admin user...")
                # Create an admin user
                admin_user = User(
                    name="Admin User",
                    username="admin",
                    email="admin@example.com",
                    password="secure_password",  # In production, use hashed password
                    user_type=UserType.ADMIN,
                    joined_at=datetime.now(),
                    last_login=datetime.now(),
                )
                session.add(admin_user)

                # Create a trainer user
                trainer_user = User(
                    name="Trainer User",
                    username="trainer",
                    email="trainer@example.com",
                    password="password",  # In production, use hashed password
                    user_type=UserType.TRAINER,
                    joined_at=datetime.now(),
                    last_login=datetime.now(),
                )
                session.add(trainer_user)

                # Create a trainee user
                trainee_user = User(
                    name="Trainee User",
                    username="trainee",
                    email="trainee@example.com",
                    password="password",  # In production, use hashed password
                    user_type=UserType.TRAINEE,
                    joined_at=datetime.now(),
                    last_login=datetime.now(),
                )
                session.add(trainee_user)

                session.commit()
                print(f"Created admin user: {admin_user.name} (ID: {admin_user.id})")
                print(
                    f"Created trainer user: {trainer_user.name} (ID: {trainer_user.id})"
                )
                print(
                    f"Created trainee user: {trainee_user.name} (ID: {trainee_user.id})"
                )
            else:
                print(f"Found {len(results)} existing users")

    await db.close()
    print("Database seeding completed")


if __name__ == "__main__":
    asyncio.run(seed_db())
