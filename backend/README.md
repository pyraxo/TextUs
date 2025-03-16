# TextUs Backend

## Installation

This repository uses [uv](https://astral.sh/uv) to manage Python versions and dependencies. Install it first before proceeding.

Copy `.env.example` to `.env` and fill in the required environmental variables.

```sh
# Add env vars
cp .env.example .env
nano .env

# Run server
uv venv
uv run fastapi dev
```

## Database

This project uses SQLModel (built on SQLAlchemy) for database operations. It supports:

- SQLite for local development
- PostgreSQL for production (via Amazon RDS)

The database configuration is determined by the `ENVIRONMENT` variable in the `.env` file:

- When `ENVIRONMENT=development`, it uses SQLite in the `data` directory
- When `ENVIRONMENT=production`, it uses PostgreSQL with the connection details from the `.env` file

### Database Initialization

To initialize the database and create the tables:

```sh
cd backend
uv run python scripts/init_db.py
```

This script will create the necessary tables and add a test user in development mode.

If you encounter foreign key errors during table creation, you can use the `create_tables.py` script to create tables in the correct order:

```sh
cd backend
uv run python scripts/create_tables.py
```

### Testing the Models

To test the models and verify that they work correctly:

```sh
cd backend
uv run python scripts/test_models.py
```

This script will create test data for all models and verify that the relationships and properties work correctly.

### Database Migrations

Database migrations are managed with Alembic. To create and apply migrations:

```sh
# Create a new migration
cd backend
uv run alembic revision --autogenerate -m "Description of the migration"

# Apply migrations
uv run alembic upgrade head
```

See the `alembic/README.md` file for more details on migration commands.
