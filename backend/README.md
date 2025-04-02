# TextUs Backend

The backend service for CPF Board TextUs, built with FastAPI and SQLModel.

## Technology Stack

- **Framework**: FastAPI
- **ORM**: SQLModel (SQLAlchemy-based)
- **Database**:
  - Development: SQLite
  - Production: PostgreSQL (Amazon RDS)
- **Package Management**: [uv](https://astral.sh/uv)
- **Migration Tool**: Alembic
- **Containerization**: Docker

## Installation

### Local Development Setup

Ensure that you are running commands in this `backend/` folder, i.e. `cd backend`.

1. Install [uv](https://astral.sh/uv) package manager:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Set up environment variables:

```sh
cp .env.example .env
# Edit .env with your configuration
```

3. Create and activate virtual environment:

```sh
uv venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

4. Install dependencies:

```sh
uv sync
```

### Running the Server

#### Development Mode

```sh
uv run fastapi dev
```

#### Production Mode

```sh
uv run fastapi run app/main.py
```

#### With Reduced Logging Verbosity

To run with reduced logging verbosity (recommended for development):

```sh
uv run uvicorn app.main:app --log-config uvicorn_config.py
```

This uses a custom logging configuration that greatly simplifies error output and reduces noise in the console logs.

## Database Management

### Configuration

Database configuration is controlled by environment variables:

- Development: `ENVIRONMENT=development` (SQLite)

  ```
  DATABASE_URL=sqlite+aiosqlite:///./data/textus.db
  ```

- Production: `ENVIRONMENT=production` (PostgreSQL)

  ```
  DATABASE_URL=postgresql://user:password@host:5432/dbname
  ```

### Database Setup

1. Create and apply database migrations:

```sh
uv run alembic upgrade head
```

2. Seed the database with initial test data (development only):

```sh
uv run python scripts/init_all.py
```

This will create test users with the following credentials:

- Admin: username=admin, password=admin
- Trainer: username=trainer, password=123
- Trainee: username=test, password=test

### Database Migrations

We use Alembic for database migrations:

1. Create a new migration:

```sh
uv run alembic revision --autogenerate -m "Description of changes"
```

2. Apply migrations:

```sh
uv run alembic upgrade head
```

3. Rollback migrations:

```sh
uv run alembic downgrade -1  # Rollback one step
uv run alembic downgrade base  # Rollback all migrations
```

### Running Tests

We use pytest for our test suite. Tests are completed in `tests/`

1. Run the test suite:

```sh
pytest tests
```

## API Documentation

When the server is running, access the API documentation at:

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

## Project Structure

```
backend/
├── alembic/            # Database migrations
├── app/
│   ├── core/           # Core functionality
│   ├── models/         # SQLModel definitions
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic
│   └── main.py         # Application entry point
├── data/               # SQLite database (dev)
├── scripts/            # Utility scripts
├── tests/              # Test suite
├── .env.example        # Environment variables template
├── Dockerfile          # Container configuration
└── pyproject.toml      # Project metadata
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Verify DATABASE_URL in .env
   - Check database service is running
   - Ensure correct permissions

2. **Migration Errors**

   - Run `alembic current` to check state
   - Compare local with `alembic history`
   - Clear migration history if needed

3. Create detailed pull requests
