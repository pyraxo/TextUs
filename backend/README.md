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
uv pip install -r requirements.txt
```

### Running the Server

#### Development Mode

```sh
uv run uvicorn app.main:app --reload --port 8000
```

#### Production Mode

```sh
uv run uvicorn app.main:app --workers 4 --port 8000
```

## Database Management

### Configuration

Database configuration is controlled by environment variables:

- Development: `ENVIRONMENT=development` (SQLite)

  ```
  DATABASE_URL=sqlite:///./data/textus.db
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
uv run python scripts/seed_db.py
```

This will create test users with the following credentials:

- Admin: username=admin, password=secure_password
- Trainer: username=trainer, password=password
- Trainee: username=trainee, password=password

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

## Testing

Run the test suite:

```sh
uv run pytest
```

With coverage report:

```sh
uv run pytest --cov=app --cov-report=term-missing
```

## Development Guidelines

1. **Code Style**

   - Follow PEP 8 guidelines
   - Use type hints
   - Document functions and classes

2. **Git Workflow**

   - Create feature branches from `main`
   - Write descriptive commit messages
   - Update tests for new features

3. **API Design**
   - Follow REST principles
   - Version APIs appropriately
   - Document all endpoints

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

3. **Dependencies Issues**
   - Delete .venv and recreate
   - Update uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Check pyproject.toml for conflicts

## Contributing

1. Follow the project's coding style
2. Add tests for new features
3. Update documentation as needed
4. Create detailed pull requests
