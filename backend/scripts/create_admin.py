import os
import sys

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings
from app.core.db import engine
from app.core.security import get_password_hash
from app.models.user import User, UserType
from sqlmodel import Session, select


def create_admin_user():
    """Create an admin user if it doesn't exist."""
    settings = get_settings()

    # Create a session
    with Session(engine) as session:
        # Check if admin user already exists
        statement = select(User).where(User.username == "admin")
        existing_admin = session.exec(statement).first()

        if existing_admin:
            print(f"Admin user already exists with ID: {existing_admin.id}")
            return

        # Create admin user
        admin_user = User(
            name="Administrator",
            username="admin",
            email="admin@example.com",
            password=get_password_hash("admin"),
            user_type=UserType.ADMIN,
        )

        # Add to session and commit
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        print(f"Created admin user with ID: {admin_user.id}")
        print("Username: admin")
        print("Password: admin")
        print(f"User type: {admin_user.user_type}")
        print(
            "WARNING: This is a development account. Change the password in production."
        )


if __name__ == "__main__":
    create_admin_user()
