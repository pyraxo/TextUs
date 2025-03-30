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
from app.models.scenario import Scenario
from app.models.scenario_customer import ScenarioCustomer
from app.models.scheme import Scheme
from app.models.user import User, UserType
from sqlmodel import Session, SQLModel, create_engine

settings = get_settings()
database_url = settings.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")
engine = create_engine(database_url)


async def init_scenarios() -> None:
    """Initialize scenarios and create scenario-specific customer adaptations."""

    with Session(engine) as session:
        # Get admin user for created_by reference
        admin_user = (
            session.query(User).filter(User.user_type == UserType.ADMIN).first()
        )

        if not admin_user:
            raise ValueError("Admin user not found. Please run init_users.py first.")

        # Get all schemes
        schemes = {scheme.name: scheme for scheme in session.query(Scheme).all()}
        if not schemes:
            raise ValueError("No schemes found. Please run init_schemes.py first.")

        # Get all customers
        customers = {
            customer.name: customer for customer in session.query(Customer).all()
        }
        if not customers:
            raise ValueError("No customers found. Please run init_customers.py first.")

        # First, create all scenarios
        scenarios_data = [
            {
                "name": "First-Time HDB Purchase",
                "description": "Guide a first-time homebuyer through using CPF for HDB purchase.",
                "scheme_name": "Housing Schemes",
                "system_prompt": "You are helping a first-time homebuyer understand how to use CPF for their HDB purchase. Focus on eligibility, limits, and processes.",
                "is_pausable": True,
            },
            {
                "name": "Self-Employed CPF Contributions",
                "description": "Explain CPF contribution rules for self-employed persons.",
                "scheme_name": "Self-Employed Matters",
                "system_prompt": "You are assisting a self-employed person understand their CPF obligations and contribution rules. Address concerns about retirement adequacy.",
                "is_pausable": True,
            },
            {
                "name": "CPF LIFE Plans",
                "description": "Compare different CPF LIFE plans for retirement.",
                "scheme_name": "Retirement Planning",
                "system_prompt": "You are helping a retiree understand different CPF LIFE plans. Focus on explaining the differences between Standard, Basic, and Escalating plans.",
                "is_pausable": True,
            },
            {
                "name": "Education Financing Options",
                "description": "Explain using CPF for children's education.",
                "scheme_name": "Education Financing",
                "system_prompt": "You are discussing education financing options through CPF. Cover both local and overseas education funding possibilities.",
                "is_pausable": True,
            },
            {
                "name": "CPFIS Basics",
                "description": "Introduction to CPF Investment Scheme.",
                "scheme_name": "Investment Schemes",
                "system_prompt": "You are explaining CPF Investment Scheme basics to a risk-averse investor. Focus on investment limits, eligible products, and risks.",
                "is_pausable": True,
            },
            {
                "name": "CPF Overview for Foreigners",
                "description": "Basic introduction to CPF system for newcomers.",
                "scheme_name": "CPF Contributions",
                "system_prompt": "You are introducing the CPF system to someone new to Singapore. Explain the basic structure, accounts, and main uses of CPF.",
                "is_pausable": True,
            },
            {
                "name": "Healthcare Financing",
                "description": "Explain MediSave and MediShield Life coverage.",
                "scheme_name": "Healthcare",
                "system_prompt": "You are helping someone understand healthcare financing through CPF. Focus on MediSave usage limits and MediShield Life coverage.",
                "is_pausable": True,
            },
        ]

        # Create scenarios and store them for later reference
        created_scenarios = {}
        for scenario_data in scenarios_data:
            scheme = schemes.get(scenario_data["scheme_name"])
            if not scheme:
                print(f"Skipping scenario {scenario_data['name']}: Missing scheme")
                continue

            # Check if scenario already exists
            existing_scenario = (
                session.query(Scenario)
                .filter(Scenario.name == scenario_data["name"])
                .first()
            )

            if not existing_scenario:
                scenario = Scenario(
                    id=uuid4(),
                    created_by_id=admin_user.id,
                    scheme_id=scheme.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    name=scenario_data["name"],
                    description=scenario_data["description"],
                    system_prompt=scenario_data["system_prompt"],
                    is_pausable=scenario_data["is_pausable"],
                )
                session.add(scenario)
                session.flush()
                created_scenarios[scenario.name] = scenario
            else:
                created_scenarios[existing_scenario.name] = existing_scenario

        # Now create scenario-specific customer adaptations
        scenario_customers_data = [
            {
                "scenario_name": "First-Time HDB Purchase",
                "customer_name": "Sarah Tan",
                "name": "Sarah - First-Time HDB Buyer",
                "scenario_prompt": """You are Sarah, a 28-year-old first-time homebuyer who is both excited and anxious about using CPF for housing.
In this scenario, you're specifically interested in:
- Understanding HDB loan eligibility
- CPF housing grant options
- CPF usage limits for housing
- Monthly loan payment using CPF

Maintain your base personality traits of being detail-oriented and asking follow-up questions, but focus them on housing-related concerns.""",
                "expected_queries": [
                    "What CPF housing grants am I eligible for as a first-timer?",
                    "How much CPF can I use for the downpayment?",
                    "Can I use CPF for my monthly loan payments?",
                    "What happens to my CPF if I sell my house in the future?",
                    "Should I take an HDB loan or bank loan?",
                ],
                "temperature": 0.7,
            },
            {
                "scenario_name": "Self-Employed CPF Contributions",
                "customer_name": "Michael Lee",
                "name": "Michael - Self-Employed Consultant",
                "scenario_prompt": """You are Michael, a self-employed consultant concerned about CPF contributions.
In this scenario, you're specifically worried about:
- MediSave contribution requirements
- Voluntary CPF contributions
- Impact on retirement planning
- Tax relief from CPF contributions

Maintain your preference for step-by-step explanations, but focus your questions on self-employed CPF matters.""",
                "expected_queries": [
                    "How much MediSave must I contribute as self-employed?",
                    "What are the tax benefits of voluntary CPF contributions?",
                    "Can I contribute to my Special Account directly?",
                    "How do I calculate my annual income for CPF purposes?",
                    "What happens if I miss my MediSave contributions?",
                ],
                "temperature": 0.8,
            },
            {
                "scenario_name": "CPF LIFE Plans",
                "customer_name": "Mrs. Wong",
                "name": "Mrs. Wong - Retirement Planning",
                "scenario_prompt": """You are Mrs. Wong, a 62-year-old retiree exploring CPF LIFE options.
In this scenario, you're specifically concerned about:
- Different CPF LIFE plans
- Monthly payout amounts
- Bequest for children
- Plan switching options

Keep your tendency to need information repeated and preference for simple explanations, but focus on retirement-related questions.""",
                "expected_queries": [
                    "What's the difference between Standard and Basic plan?",
                    "How much will I get every month?",
                    "Can I leave some money for my children?",
                    "Can I change my plan after joining?",
                    "What happens to my CPF LIFE if I pass away?",
                ],
                "temperature": 0.6,
            },
            {
                "scenario_name": "Education Financing Options",
                "customer_name": "Ahmad bin Ibrahim",
                "name": "Ahmad - Education Planning",
                "scenario_prompt": """You are Ahmad, a parent exploring education financing through CPF.
In this scenario, you're specifically interested in:
- Using CPF for university fees
- Education loan options
- Repayment requirements
- Overseas education considerations

Maintain your detail-oriented nature and tendency to compare scenarios, but focus on education financing concerns.""",
                "expected_queries": [
                    "How much CPF can I use for my child's education?",
                    "Do I need to repay the CPF used for education?",
                    "Can CPF be used for overseas universities?",
                    "What are the interest rates for education loans?",
                    "How does CPF education loan repayment work?",
                ],
                "temperature": 0.7,
            },
            {
                "scenario_name": "CPFIS Basics",
                "customer_name": "Grace Lim",
                "name": "Grace - New Investor",
                "scenario_prompt": """You are Grace, a 50-year-old considering CPF investments for the first time.
In this scenario, you're specifically concerned about:
- Types of investments allowed
- Risks and returns
- Investment limits
- How to start investing

Maintain your risk-averse nature and need for thorough explanations, especially when technical terms are used.""",
                "expected_queries": [
                    "What types of investments can I make with my CPF?",
                    "How much of my CPF can I invest?",
                    "What are the risks involved?",
                    "How do I choose between different investment products?",
                    "What happens if my investments make losses?",
                ],
                "temperature": 0.6,
            },
            {
                "scenario_name": "CPF Overview for Foreigners",
                "customer_name": "John Doe",
                "name": "John - New to CPF",
                "scenario_prompt": """You are John, a 30-year-old expatriate trying to understand the CPF system.
In this scenario, you're specifically trying to learn about:
- Basic CPF account types
- Contribution rates
- Main uses of CPF
- Comparison with other countries' systems

Keep your eagerness to learn while expressing your tendency to feel overwhelmed by complex systems. Compare with social security systems you're familiar with.""",
                "expected_queries": [
                    "What are the different CPF accounts for?",
                    "How much do I need to contribute to CPF?",
                    "Can I withdraw my CPF if I leave Singapore?",
                    "How is CPF different from 401(k) or other retirement systems?",
                    "What happens to my CPF contributions over time?",
                ],
                "temperature": 0.7,
            },
            {
                "scenario_name": "Healthcare Financing",
                "customer_name": "Mdm. Lakshmi",
                "name": "Mdm. Lakshmi - Healthcare Planning",
                "scenario_prompt": """You are Mdm. Lakshmi, a 55-year-old with chronic health conditions seeking to understand CPF healthcare options.
In this scenario, you're specifically concerned about:
- MediShield Life coverage
- MediSave usage limits
- Chronic disease management
- Healthcare cost planning

Express your anxiety about healthcare costs while maintaining your need for clear explanations about medical coverage.""",
                "expected_queries": [
                    "What medical expenses can I use MediSave for?",
                    "How much does MediShield Life cover for hospital stays?",
                    "Can I use MediSave for my regular check-ups?",
                    "What happens if I exceed my MediSave limit?",
                    "How do I make claims from MediShield Life?",
                ],
                "temperature": 0.6,
            },
        ]

        # Create scenario-customer links
        for sc_data in scenario_customers_data:
            scenario = created_scenarios.get(sc_data["scenario_name"])
            customer = customers.get(sc_data["customer_name"])

            if not scenario or not customer:
                print(
                    f"Skipping scenario-customer {sc_data['name']}: Missing scenario or customer"
                )
                continue

            # Check if scenario-customer link already exists
            existing_sc = (
                session.query(ScenarioCustomer)
                .filter(
                    ScenarioCustomer.scenario_id == scenario.id,
                    ScenarioCustomer.customer_id == customer.id,
                )
                .first()
            )

            if not existing_sc:
                scenario_customer = ScenarioCustomer(
                    id=uuid4(),
                    scenario_id=scenario.id,
                    customer_id=customer.id,
                    name=sc_data["name"],
                    scenario_prompt=sc_data["scenario_prompt"],
                    expected_queries=sc_data["expected_queries"],
                    temperature=sc_data["temperature"],
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                )
                session.add(scenario_customer)

        session.commit()


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    asyncio.run(init_scenarios())
    print("Scenarios and scenario-customers initialized successfully!")
