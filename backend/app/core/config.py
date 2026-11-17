"""Configuración leída de variables de entorno / archivo .env con pydantic-settings."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str  # obligatoria: sin valor por defecto, la app no arranca sin ella
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False

    @field_validator("SECRET_KEY")
    @classmethod
    def clave_suficientemente_larga(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY debe tener al menos 32 caracteres")
        return v


settings = Settings()  # type: ignore[call-arg]  # SECRET_KEY viene del entorno

COOKIE_NAME = "access_token"
