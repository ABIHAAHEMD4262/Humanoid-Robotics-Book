"""
Error response schemas for consistent API error handling.
Defines standard error formats for HTTP 400, 429, 500, 503 responses.
"""
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ErrorResponse(BaseModel):
    """Base error response model"""
    detail: str = Field(..., description="Human-readable error message")
    error_code: str = Field(..., description="Machine-readable error code")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "An error occurred",
                "error_code": "INTERNAL_ERROR",
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class ValidationErrorResponse(BaseModel):
    """
    HTTP 400 - Validation error response.
    Used for invalid input, missing required fields, etc.
    """
    detail: str = Field(default="Validation error")
    error_code: str = Field(default="VALIDATION_ERROR")
    field_errors: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Field-specific validation errors"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Validation error",
                "error_code": "VALIDATION_ERROR",
                "field_errors": {
                    "query_text": ["Query text is required", "Query text must be at least 1 character"],
                    "session_id": ["Invalid UUID format"]
                },
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class RateLimitErrorResponse(BaseModel):
    """
    HTTP 429 - Rate limit exceeded error.
    Returned when user exceeds 10 queries per minute.
    """
    detail: str = Field(default="Rate limit exceeded. You can make up to 10 queries per minute.")
    error_code: str = Field(default="RATE_LIMIT_EXCEEDED")
    retry_after: int = Field(..., description="Seconds to wait before retry")
    tokens_remaining: int = Field(default=0, description="Always 0 when rate limited")
    reset_at: datetime = Field(..., description="Timestamp when rate limit resets")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Rate limit exceeded. You can make up to 10 queries per minute.",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "retry_after": 42,
                "tokens_remaining": 0,
                "reset_at": "2025-12-06T10:31:00Z",
                "timestamp": "2025-12-06T10:30:18Z"
            }
        }


class InternalServerErrorResponse(BaseModel):
    """
    HTTP 500 - Internal server error.
    Used for unexpected errors, crashes, etc.
    """
    detail: str = Field(default="An internal server error occurred. Please try again later.")
    error_code: str = Field(default="INTERNAL_SERVER_ERROR")
    request_id: Optional[str] = Field(None, description="Request ID for debugging")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "An internal server error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR",
                "request_id": "req_abc123xyz",
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class ServiceUnavailableErrorResponse(BaseModel):
    """
    HTTP 503 - Service unavailable error.
    Used when external dependencies (Qdrant, OpenAI, Postgres) are down.
    """
    detail: str = Field(default="Service temporarily unavailable. Please try again later.")
    error_code: str = Field(default="SERVICE_UNAVAILABLE")
    service: Optional[str] = Field(None, description="Name of unavailable service")
    retry_after: Optional[int] = Field(None, description="Seconds to wait before retry")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Vector database is temporarily unavailable.",
                "error_code": "SERVICE_UNAVAILABLE",
                "service": "qdrant",
                "retry_after": 30,
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class NotFoundErrorResponse(BaseModel):
    """
    HTTP 404 - Resource not found.
    Used when conversation, query, or other resource doesn't exist.
    """
    detail: str = Field(default="Resource not found")
    error_code: str = Field(default="NOT_FOUND")
    resource_type: Optional[str] = Field(None, description="Type of resource not found")
    resource_id: Optional[str] = Field(None, description="ID of resource not found")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Conversation not found",
                "error_code": "NOT_FOUND",
                "resource_type": "conversation",
                "resource_id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class InsufficientContentErrorResponse(BaseModel):
    """
    Custom error for when no relevant content is found in vector search.
    Not an HTTP error - returned as successful 200 response with this structure.
    """
    answer_text: str = Field(
        default="The information is not available in the book.",
        description="Default response when no relevant passages found"
    )
    citations: List[Any] = Field(default_factory=list, description="Empty citations list")
    confidence_score: float = Field(default=0.0, description="Zero confidence")
    retrieval_method: str = Field(default="vector_search")
    error_code: str = Field(default="INSUFFICIENT_CONTENT")
    similarity_scores: List[float] = Field(
        default_factory=list,
        description="Similarity scores of top passages (all < threshold)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "answer_text": "The information is not available in the book.",
                "citations": [],
                "confidence_score": 0.0,
                "retrieval_method": "vector_search",
                "error_code": "INSUFFICIENT_CONTENT",
                "similarity_scores": [0.65, 0.62, 0.58]
            }
        }


# Error code constants
class ErrorCodes:
    """Standard error codes used across the API"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    NOT_FOUND = "NOT_FOUND"
    INSUFFICIENT_CONTENT = "INSUFFICIENT_CONTENT"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
