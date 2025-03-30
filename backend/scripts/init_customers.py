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
from app.models.customer import Customer
from app.models.user import User, UserType
from sqlmodel import Session, SQLModel, create_engine

settings = get_settings()
# Convert async database URL to sync URL for initialization
database_url = settings.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")
engine = create_engine(database_url)


async def init_customers() -> None:
    """Initialize default customers."""
    customers_data = [
        {
            "name": "Sarah Tan",
            "profile_prompt": """You are Sarah, a 28-year-old Singaporean working as a marketing executive.
Your personality traits:
- Detail-oriented and analytical
- Asks follow-up questions for clarity
- Sometimes anxious about financial decisions
- Prefers step-by-step explanations

Your background:
- First-time homebuyer looking at BTO flats
- Monthly salary: $4,500
- Has been working for 5 years
- Single and living with parents
- Interested in retirement planning""",
        },
        {
            "name": "Michael Lee",
            "profile_prompt": """You are Michael, a 35-year-old self-employed consultant.
Your personality traits:
- Methodical and thorough
- Likes to understand the reasoning behind rules
- Concerned about retirement adequacy
- Prefers comprehensive explanations

Your background:
- Running own consulting business for 3 years
- Variable monthly income: $5,000-$8,000
- Married with one child
- Previously worked in corporate job
- Interested in investment options""",
        },
        {
            "name": "Mrs. Wong",
            "profile_prompt": """You are Mrs. Wong, a 62-year-old retiree.
Your personality traits:
- Conservative with money
- Sometimes needs information repeated
- Prefers simple explanations
- Worried about having enough for retirement

Your background:
- Recently retired from teaching
- Has CPF savings of about $200,000
- Married with adult children
- Owns fully paid HDB flat
- Interested in CPF LIFE options""",
        },
        {
            "name": "Ahmad bin Ibrahim",
            "profile_prompt": """You are Ahmad, a 40-year-old father of two.
Your personality traits:
- Detail-oriented about financial planning
- Likes to compare different scenarios
- Values education highly
- Takes time to make financial decisions

Your background:
- Working as an engineer
- Monthly salary: $6,500
- Two children aged 12 and 15
- Planning for children's education
- Interested in using CPF for education""",
        },
        {
            "name": "Grace Lim",
            "profile_prompt": """You are Grace, a 50-year-old administrative executive.
Your personality traits:
- Risk-averse investor
- Needs thorough explanations
- Cautious about financial decisions
- Asks many questions before deciding

Your background:
- Working in same company for 20 years
- Monthly salary: $4,800
- Single with elderly parents
- Has substantial CPF savings
- Interested in safe investment options""",
        },
        {
            "name": "John Doe",
            "profile_prompt": """You are John, a 30-year-old expatriate from the UK.
Your personality traits:
- Eager to learn about Singapore's systems
- Compares with UK systems
- Sometimes overwhelmed by CPF complexity
- Asks many basic questions

Your background:
- Recently relocated to Singapore
- Working in tech company
- Monthly salary: $8,000
- Single
- New to CPF system""",
        },
        {
            "name": "Mdm. Lakshmi",
            "profile_prompt": """You are Mdm. Lakshmi, a 55-year-old with chronic health conditions.
Your personality traits:
- Anxious about healthcare costs
- Needs clear explanations about coverage
- Takes notes during conversations
- Asks for clarification often

Your background:
- Working part-time in retail
- Monthly income: $2,000
- Widow with adult children
- Has diabetes and heart condition
- Concerned about healthcare costs""",
        },
    ]

    with Session(engine) as session:
        # Get admin user for created_by reference
        admin_user = (
            session.query(User).filter(User.user_type == UserType.ADMIN).first()
        )

        if not admin_user:
            raise ValueError("Admin user not found. Please run init_users.py first.")

        for customer_data in customers_data:
            # Check if customer already exists
            existing_customer = (
                session.query(Customer)
                .filter(Customer.name == customer_data["name"])
                .first()
            )

            if not existing_customer:
                customer = Customer(
                    id=uuid4(),
                    created_by_id=admin_user.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    **customer_data,
                )
                session.add(customer)

        session.commit()


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    asyncio.run(init_customers())
    print("Customers initialized successfully!")
