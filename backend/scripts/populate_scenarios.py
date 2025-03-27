import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import engine
from app.models.scenario import Scenario
from app.models.scheme import Scheme
from sqlmodel import Session, select

# Define test scenarios for each scheme type
SCENARIOS_BY_SCHEME = {
    "home-ownership": [
        {
            "name": "First-Time Home Buyer Consultation",
            "description": "Help a young couple understand the HDB First Timer Grant and eligibility conditions.",
            "system_prompt": "You are a young couple looking to buy your first HDB flat. You're confused about the various grants available and eligibility conditions.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "Resale Flat Purchase Guidance",
            "description": "Guide a family through the process of buying a resale flat and available grants.",
            "system_prompt": "You are a family looking to upgrade to a larger resale flat. You need information about the Enhanced CPF Housing Grant and other available subsidies.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
    "retirement": [
        {
            "name": "CPF LIFE Scheme Explanation",
            "description": "Explain the CPF LIFE scheme options to a retiring individual.",
            "system_prompt": "You are approaching retirement age and want to understand the different CPF LIFE plans available. You're particularly interested in the differences between the Standard and Basic plans.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "Retirement Sum Planning",
            "description": "Help a middle-aged professional plan their Basic Retirement Sum.",
            "system_prompt": "You are a 45-year-old professional concerned about meeting your retirement needs. You want to understand how the Basic Retirement Sum works and how to build it up.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
    "healthcare": [
        {
            "name": "MediSave Usage Inquiry",
            "description": "Explain MediSave withdrawal limits and eligible treatments.",
            "system_prompt": "You have an upcoming medical procedure and want to understand how much you can use from your MediSave account. You're unclear about the withdrawal limits.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "MediShield Life Coverage",
            "description": "Clarify MediShield Life coverage and premium payments.",
            "system_prompt": "You recently received your MediShield Life premium notice and want to understand what exactly is covered under the scheme.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
    "education": [
        {
            "name": "Education Savings Scheme",
            "description": "Guide parents on using CPF for their children's education.",
            "system_prompt": "You are parents planning for your children's tertiary education and want to understand how to use CPF funds for education expenses.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "Student Loan Repayment",
            "description": "Explain CPF education loan repayment options.",
            "system_prompt": "You have graduated and started working. You want to understand how to manage your CPF education loan repayment.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
    "employer-services": [
        {
            "name": "CPF Contribution Rates",
            "description": "Help an employer understand CPF contribution rates for different age groups.",
            "system_prompt": "You are an employer with employees of various age groups. You need clarification on the different CPF contribution rates you need to pay.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "Foreign Worker Levy",
            "description": "Explain foreign worker levy requirements and payment process.",
            "system_prompt": "You are an employer hiring foreign workers and need to understand the levy requirements and payment procedures.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
    "housing-protection": [
        {
            "name": "Home Protection Scheme Claims",
            "description": "Guide a family through the HPS claim process.",
            "system_prompt": "You recently lost a family member and need to understand how to make a claim under the Home Protection Scheme.",
            "is_pausable": True,
            "temperature": 0.7,
        },
        {
            "name": "Mortgage Reducing Term Assurance",
            "description": "Explain MRTA coverage and premium calculations.",
            "system_prompt": "You want to understand how the Mortgage Reducing Term Assurance works and how premiums are calculated.",
            "is_pausable": True,
            "temperature": 0.7,
        },
    ],
}


def create_scenarios():
    """Create test scenarios for each scheme if they don't exist."""
    with Session(engine) as session:
        # Get all schemes
        schemes = session.exec(select(Scheme)).all()

        for scheme in schemes:
            # Get scenarios for this scheme type
            scenarios = SCENARIOS_BY_SCHEME.get(scheme.slug, [])

            for scenario_data in scenarios:
                # Check if scenario already exists
                statement = select(Scenario).where(
                    Scenario.name == scenario_data["name"],
                    Scenario.scheme_id == scheme.id,
                )
                existing_scenario = session.exec(statement).first()

                if existing_scenario:
                    print(
                        f"Scenario '{scenario_data['name']}' already exists for scheme '{scheme.name}'"
                    )
                    continue

                # Create scenario
                scenario = Scenario(
                    **scenario_data,
                    scheme_id=scheme.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                )
                session.add(scenario)
                session.commit()
                session.refresh(scenario)

                print(f"Created scenario '{scenario.name}' for scheme '{scheme.name}'")


if __name__ == "__main__":
    create_scenarios()
