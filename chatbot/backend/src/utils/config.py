"""
Environment configuration loader with Pydantic validation.
Validates all required environment variables at startup.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Qdrant Vector Database
    qdrant_url: str
    qdrant_api_key: str

    # Neon Serverless Postgres
    neon_database_url: str

    # OpenAI API Key (for GPT-4o-mini)
    openai_api_key: str

    # Gemini API Key (for embeddings)
    gemini_api_key: str

    # Redis (Rate Limiting)
    redis_url: str = "redis://localhost:6379"

    # Vector Search Configuration
    vector_search_top_k: int = 5
    vector_similarity_threshold: float = 0.7

    # LLM Model Configuration
    openai_model: str = "gpt-4o-mini"  # Cost-effective for testing
    openai_embedding_model: str = "text-embedding-3-small"

    # Rate Limiting Configuration
    rate_limit_max_tokens: int = 10
    rate_limit_refill_seconds: int = 60

    # Optional Configuration
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    def validate_vector_config(self) -> None:
        """Validate vector search configuration constraints"""
        if not 3 <= self.vector_search_top_k <= 10:
            raise ValueError("vector_search_top_k must be between 3 and 10")
        if not 0.0 <= self.vector_similarity_threshold <= 1.0:
            raise ValueError("vector_similarity_threshold must be between 0.0 and 1.0")


# Global settings instance
settings = Settings()
settings.validate_vector_config()
