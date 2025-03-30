from uuid import UUID


def parse_uuid(uuid_str: str | UUID) -> UUID:
    """Parse a UUID from a string."""
    if isinstance(uuid_str, UUID):
        return uuid_str
    return UUID(uuid_str)
