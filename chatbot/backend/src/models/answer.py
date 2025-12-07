"""
Answer data model for LLM-generated responses.
Represents the chatbot's answer to a user query with citations.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator
from enum import Enum

from src.models.citation import Citation


class RetrievalMethod(str, Enum):
    """How the answer was generated"""
    SELECTED_TEXT = "selected_text"  # From user-selected text only
    VECTOR_SEARCH = "vector_search"  # From vector similarity search
    HYBRID = "hybrid"  # Combined selected text + vector search


class Answer(BaseModel):
    """
    LLM-generated answer model.

    Each answer includes:
    - Answer text (max 2000 characters for conciseness)
    - Citations (≥1 required when answer provided)
    - Confidence score (0.0-1.0)
    - Retrieval method used
    - Timestamp
    - Link to original query
    """
    id: UUID = Field(default_factory=uuid4, description="Unique answer ID")
    answer_text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="LLM-generated answer (max 2000 characters)"
    )
    citations: List[Citation] = Field(
        default_factory=list,
        description="Source citations (≥1 required when answered)"
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Answer confidence (0.0-1.0, based on similarity scores)"
    )
    retrieval_method: RetrievalMethod = Field(
        ...,
        description="How context was retrieved"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When answer was generated"
    )
    query_id: UUID = Field(..., description="ID of the query this answers")

    @field_validator('citations')
    @classmethod
    def validate_citations(cls, v: List[Citation], info) -> List[Citation]:
        """
        Validate that citations exist when answer is not "information not available".

        The "information not available" message is allowed to have zero citations.
        All other answers MUST have at least 1 citation.
        """
        # Get answer_text from validation context
        answer_text = info.data.get('answer_text', '')

        # Allow zero citations only for "not available" message
        if "not available" not in answer_text.lower() and len(v) == 0:
            raise ValueError(
                "At least 1 citation is required when answer is provided. "
                "Use 'The information is not available in the book.' message "
                "with zero citations when no relevant content found."
            )

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "id": "answer_abc123",
                "answer_text": "ROS 2 (Robot Operating System 2) is the next generation framework for robot software development, featuring improved real-time capabilities and better support for multi-robot systems compared to ROS 1.",
                "citations": [
                    {
                        "passage_id": "p_123",
                        "chapter_title": "Module 1",
                        "section_title": "1.3 Robot Operating Systems",
                        "source_url": "https://example.com/module1/ros",
                        "paragraph_id": "para-12",
                        "relevance_score": 0.87
                    }
                ],
                "confidence_score": 0.85,
                "retrieval_method": "vector_search",
                "timestamp": "2025-12-06T10:30:05Z",
                "query_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class QueryResponse(BaseModel):
    """
    Response model for POST /api/query endpoint.

    Includes complete query-answer pair with all metadata.
    """
    query_id: UUID = Field(..., description="Query ID")
    session_id: UUID = Field(..., description="Session ID")
    answer: Answer = Field(..., description="Generated answer")
    retrieved_passages: List[dict] = Field(
        default_factory=list,
        description="Passages used for answer generation (for debugging)"
    )
    processing_time_ms: Optional[int] = Field(
        None,
        description="Total processing time in milliseconds"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query_id": "550e8400-e29b-41d4-a716-446655440000",
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "answer": {
                    "id": "answer_abc123",
                    "answer_text": "ROS 2 is the next generation...",
                    "citations": [],
                    "confidence_score": 0.85,
                    "retrieval_method": "vector_search",
                    "timestamp": "2025-12-06T10:30:05Z",
                    "query_id": "550e8400-e29b-41d4-a716-446655440000"
                },
                "retrieved_passages": [],
                "processing_time_ms": 2450
            }
        }


class InsufficientContentResponse(BaseModel):
    """
    Response when no relevant content found (similarity < 0.7).

    This is returned as a successful 200 response, not an error.
    """
    query_id: UUID = Field(..., description="Query ID")
    session_id: UUID = Field(..., description="Session ID")
    answer: Answer = Field(
        ...,
        description="Answer with 'not available' message"
    )
    reason: str = Field(
        default="No passages found with similarity ≥0.7",
        description="Why content was insufficient"
    )
    top_similarity_scores: List[float] = Field(
        default_factory=list,
        description="Top similarity scores (all <0.7)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query_id": "550e8400-e29b-41d4-a716-446655440000",
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "answer": {
                    "id": "answer_xyz",
                    "answer_text": "The information is not available in the book.",
                    "citations": [],
                    "confidence_score": 0.0,
                    "retrieval_method": "vector_search",
                    "timestamp": "2025-12-06T10:30:05Z",
                    "query_id": "550e8400-e29b-41d4-a716-446655440000"
                },
                "reason": "No passages found with similarity ≥0.7",
                "top_similarity_scores": [0.65, 0.62, 0.58]
            }
        }
