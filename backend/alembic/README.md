# Database Migrations with Alembic

This directory contains database migration scripts managed by Alembic.

## Creating a New Migration

To create a new migration:

```bash
cd backend
alembic revision --autogenerate -m "Description of the migration"
```

## Applying Migrations

To apply all pending migrations:

```bash
cd backend
alembic upgrade head
```

To apply a specific migration:

```bash
cd backend
alembic upgrade <revision>
```

## Rolling Back Migrations

To roll back the most recent migration:

```bash
cd backend
alembic downgrade -1
```

To roll back to a specific migration:

```bash
cd backend
alembic downgrade <revision>
```

## Checking Migration Status

To check the current migration status:

```bash
cd backend
alembic current
```

To see the history of migrations:

```bash
cd backend
alembic history
```

## Environment Configuration

The migration environment is configured in `env.py`. It automatically uses the database URL from the application settings.
