"""
Query data model for user questions.
Represents a single question asked by the user with optional selected text context.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field


class Query(BaseModel):
    """
    User query model.

    Each query includes:
    - Unique ID
    - Query text (question from user)
    - Optional selected text (highlighted passage)
    - Session ID for conversation tracking
    - Timestamp
    """
    id: UUID = Field(default_factory=uuid4, description="Unique query ID")
    query_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's question (1-5000 characters)"
    )
    selected_text: Optional[str] = Field(
        None,
        max_length=10000,
        description="Optional highlighted text from book (max 10000 characters)"
    )
    session_id: UUID = Field(..., description="Session UUID for conversation tracking")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When query was submitted"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "query_text": "What is ROS 2 and how does it differ from ROS 1?",
                "selected_text": None,
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2025-12-06T10:30:00Z"
            }
        }


class QueryRequest(BaseModel):
    """Request model for POST /api/query endpoint"""
    query_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's question"
    )
    selected_text: Optional[str] = Field(
        None,
        max_length=10000,
        description="Optional highlighted text"
    )
    session_id: Optional[UUID] = Field(
        None,
        description="Session ID (auto-generated if not provided)"
    )
    account_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional account ID for cross-device sync"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query_text": "What are the main components of a humanoid robot?",
                "selected_text": None,
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "account_id": None
            }
        }
