from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()

# Create engine based on environment
if settings.environment == "development":
    # SQLite for local development
    # Note: SQLite doesn't support async operations well, so we use sync engine
    engine = create_engine(
        settings.database_url,
        echo=True,  # Set to False in production
        connect_args={"check_same_thread": False},  # Needed for SQLite
    )

    # Create sync session
    def get_session():
        with Session(engine) as session:
            yield session
else:
    # PostgreSQL for production with async support
    async_engine = create_async_engine(
        settings.database_url,
        echo=True,  # Set to False in production
        future=True,
    )

    # Create async session
    async_session = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )

    async def get_async_session():
        async with async_session() as session:
            yield session


# Import all models to ensure they're registered with SQLModel
# These imports must be here to avoid circular imports
# but they need to be imported before creating tables
def import_models():
    # Import in the correct order - base models first, then models that reference them
    from app.models.customer import Customer
    from app.models.customer_scenario import CustomerScenario
    from app.models.scenario import Scenario
    from app.models.user import User

    # Return the imported models for reference
    return [User, Customer, CustomerScenario, Scenario]


class Database:
    def __init__(self):
        self.engine = engine if settings.environment == "development" else async_engine
        self.models = None

    async def start(self):
        """Create all tables in the database."""
        # Import all models to ensure they're registered with SQLModel
        self.models = import_models()

        # Create tables
        if settings.environment == "development":
            # Sync version for SQLite
            SQLModel.metadata.create_all(self.engine)
        else:
            # Async version for PostgreSQL
            async with self.engine.begin() as conn:
                await conn.run_sync(SQLModel.metadata.create_all)

    async def close(self):
        """Close database connections."""
        if settings.environment == "development":
            # No need to close sync engine
            pass
        else:
            # Close async engine
            await self.engine.dispose()
