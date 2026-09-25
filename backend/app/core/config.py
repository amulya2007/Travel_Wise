from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TravelWise – Smart Travel Planning Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    # Security & JWT
    SECRET_KEY: str = "travelwise-super-secret-jwt-key-change-in-production-random-string-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    # Default to local SQLite database if Postgres URL is not configured
    DATABASE_URL: str = "sqlite:///./travelwise.db"

    # Google Places is optional for local development, but enables live place
    # discovery, geocoding and place-owned photos in production. It is read only
    # on the server and is never sent to the React application.
    GOOGLE_MAPS_API_KEY: str = ""
    PLACES_PROVIDER_TIMEOUT_SECONDS: float = 8.0

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://localhost",
    ]

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value: Union[str, bool]) -> bool:
        """Accept common deployment labels without blocking Python startup."""
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod", "false", "0", "no", "off"}:
                return False
            if normalized in {"development", "dev", "true", "1", "yes", "on"}:
                return True
        return value

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return []

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
