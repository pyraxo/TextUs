import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # API Keys
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

    # Environment
    environment: str = "development"  # "development" or "production"

    # SQLModel settings
    # For SQLite (local development)
    sqlite_dir: str = "data"
    sqlite_db_name: str = "sds_cpf.db"

    # For Amazon RDS (production)
    db_host: str = ""
    db_port: str = "5432"
    db_user: str = ""
    db_password: str = ""
    db_name: str = "sds_cpf"

    # JWT Authentication
    secret_key: str = "supersecretkey"  # Should be set in .env for production
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 720

    # Database URL (will be constructed based on environment)
    @property
    def database_url(self) -> str:
        if self.environment == "development":
            # Create the SQLite directory if it doesn't exist
            os.makedirs(self.sqlite_dir, exist_ok=True)
            return f"sqlite+aiosqlite:///{self.sqlite_dir}/{self.sqlite_db_name}"
        else:
            # Production - use Amazon RDS
            return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    # CORS
    allow_origins: list[str] = ["*"]
    allow_credentials: bool = True
    allow_methods: list[str] = ["*"]
    allow_headers: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
