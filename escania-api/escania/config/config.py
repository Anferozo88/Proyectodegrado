from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    FIREBASE_CONFIG: Optional[str] = None
    FIREBASE_CREDENTIALS: Optional[str] = None
    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: Optional[str] = None
    OLLAMA_MODEL: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: Optional[str] = None


settings = Settings()
