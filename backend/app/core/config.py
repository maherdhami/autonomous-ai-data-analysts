import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous AI Data Analyst API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # AI Providers
    DEFAULT_GROQ_KEY: str = ""
    GROQ_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_MODEL: str = "openai/gpt-oss-120b"
    
    # File Storage (Max upload limit)
    MAX_UPLOAD_SIZE_MB: int = 50
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @property
    def effective_groq_key(self) -> str:
        if self.GROQ_API_KEY and self.GROQ_API_KEY.strip():
            return self.GROQ_API_KEY.strip()
        return self.DEFAULT_GROQ_KEY

settings = Settings()
