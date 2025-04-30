"""Update scenario customer expected queries

Revision ID: 160ff4bb10b3
Revises: 99298b867a0b
Create Date: 2025-04-18 22:45:55.851792

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "160ff4bb10b3"
down_revision: Union[str, None] = "99298b867a0b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == "postgresql":
        op.execute(
            "ALTER TABLE scenario_customers ALTER COLUMN expected_queries TYPE JSON USING expected_queries::json"
        )
    elif dialect == "sqlite":
        # SQLite does not enforce column types, so this is a no-op.
        # Optionally, you can use batch_op to annotate the type.
        with op.batch_alter_table("scenario_customers", schema=None) as batch_op:
            batch_op.alter_column(
                "expected_queries",
                existing_type=sa.VARCHAR(),
                type_=sa.JSON(),
                existing_nullable=True,
            )
    else:
        # For other DBs, you may want to handle accordingly or raise NotImplementedError
        pass


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == "postgresql":
        op.execute(
            "ALTER TABLE scenario_customers ALTER COLUMN expected_queries TYPE VARCHAR USING expected_queries::text"
        )
    elif dialect == "sqlite":
        with op.batch_alter_table("scenario_customers", schema=None) as batch_op:
            batch_op.alter_column(
                "expected_queries",
                existing_type=sa.JSON(),
                type_=sa.VARCHAR(),
                existing_nullable=True,
            )
    else:
        pass
