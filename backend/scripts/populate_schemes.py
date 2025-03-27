import os
import sys

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import engine
from app.models.scheme import Scheme
from sqlmodel import Session, select

# Define schemes based on frontend configuration
SCHEMES = [
    {
        "name": "Home Ownership",
        "description": "Training scenarios for home ownership scheme assistance",
        "slug": "home-ownership",
    },
    {
        "name": "Retirement",
        "description": "Training scenarios for retirement planning assistance",
        "slug": "retirement",
    },
    {
        "name": "Healthcare",
        "description": "Training scenarios for healthcare scheme assistance",
        "slug": "healthcare",
    },
    {
        "name": "Education",
        "description": "Training scenarios for education scheme assistance",
        "slug": "education",
    },
    {
        "name": "Employer Services",
        "description": "Training scenarios for employer services assistance",
        "slug": "employer-services",
    },
    {
        "name": "Housing Protection",
        "description": "Training scenarios for housing protection scheme assistance",
        "slug": "housing-protection",
    },
]


def create_schemes():
    """Create schemes if they don't exist."""
    with Session(engine) as session:
        for scheme_data in SCHEMES:
            # Check if scheme already exists
            statement = select(Scheme).where(Scheme.slug == scheme_data["slug"])
            existing_scheme = session.exec(statement).first()

            if existing_scheme:
                print(
                    f"Scheme '{scheme_data['name']}' already exists with ID: {existing_scheme.id}"
                )
                continue

            # Create scheme
            scheme = Scheme(**scheme_data)
            session.add(scheme)
            session.commit()
            session.refresh(scheme)

            print(f"Created scheme '{scheme.name}' with ID: {scheme.id}")


if __name__ == "__main__":
    create_schemes()
