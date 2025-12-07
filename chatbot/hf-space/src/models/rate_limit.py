"""
Rate limiting data models for token bucket algorithm.
Supports Redis (hot path) and Postgres (cold storage) hybrid approach.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID


class RateLimitState(BaseModel):
    """
    Rate limit state using token bucket algorithm.

    Token Bucket Parameters:
    - Max tokens: 10 (max queries per window)
    - Refill rate: 1 token per 6 seconds (10 queries/minute)
    - Window: 60 seconds (1 minute)
    """
    session_id: UUID = Field(..., description="Session UUID")
    tokens: int = Field(default=10, ge=0, le=10, description="Available tokens (0-10)")
    last_refill: datetime = Field(default_factory=datetime.utcnow, description="Last refill timestamp")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last access timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "tokens": 7,
                "last_refill": "2025-12-06T10:30:00Z",
                "last_updated": "2025-12-06T10:30:15Z"
            }
        }


class RateLimitResponse(BaseModel):
    """Response model for rate limit checks"""
    allowed: bool = Field(..., description="Whether request is allowed")
    tokens_remaining: int = Field(..., ge=0, le=10, description="Tokens remaining after this request")
    retry_after: Optional[int] = Field(None, description="Seconds to wait before retry (if blocked)")
    reset_at: Optional[datetime] = Field(None, description="Timestamp when tokens will be refilled")

    class Config:
        json_schema_extra = {
            "example": {
                "allowed": True,
                "tokens_remaining": 6,
                "retry_after": None,
                "reset_at": "2025-12-06T10:30:06Z"
            }
        }


class RateLimitError(BaseModel):
    """Error response when rate limit exceeded"""
    detail: str = Field(default="Rate limit exceeded. Please try again later.")
    error_code: str = Field(default="RATE_LIMIT_EXCEEDED")
    retry_after: int = Field(..., description="Seconds to wait before retry")
    tokens_remaining: int = Field(default=0, description="Always 0 when rate limited")
    reset_at: datetime = Field(..., description="Timestamp when rate limit resets")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Rate limit exceeded. Please try again later.",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "retry_after": 42,
                "tokens_remaining": 0,
                "reset_at": "2025-12-06T10:31:00Z"
            }
        }


# Redis key format for rate limit state
def get_redis_key(session_id: UUID) -> str:
    """Generate Redis key for session rate limit state"""
    return f"ratelimit:session:{session_id}"


# Constants for rate limiting
RATE_LIMIT_MAX_TOKENS = 10
RATE_LIMIT_REFILL_SECONDS = 6  # 1 token per 6 seconds = 10 tokens per 60 seconds
RATE_LIMIT_WINDOW_SECONDS = 60
