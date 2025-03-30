from uuid import UUID

from fastapi import HTTPException


def parse_uuid(uuid_str: str | UUID) -> UUID:
    """Parse a UUID from a string."""
    if isinstance(uuid_str, UUID):
        return uuid_str
    try:
        return UUID(uuid_str)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid UUID: {uuid_str}") from e
