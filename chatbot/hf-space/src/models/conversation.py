"""
Conversation data model for session management.
Tracks query-answer history for a user session.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator

from src.models.query import Query
from src.models.answer import Answer


class QueryAnswerPair(BaseModel):
    """Single query-answer exchange"""
    query: Query = Field(..., description="User query")
    answer: Optional[Answer] = Field(None, description="Answer (None if query failed)")

    class Config:
        json_schema_extra = {
            "example": {
                "query": {
                    "id": "q_123",
                    "query_text": "What is ROS 2?",
                    "selected_text": None,
                    "session_id": "sess_abc",
                    "timestamp": "2025-12-06T10:30:00Z"
                },
                "answer": {
                    "id": "a_123",
                    "answer_text": "ROS 2 is...",
                    "citations": [],
                    "confidence_score": 0.85,
                    "retrieval_method": "vector_search",
                    "timestamp": "2025-12-06T10:30:05Z",
                    "query_id": "q_123"
                }
            }
        }


class Conversation(BaseModel):
    """
    Conversation session model.

    Tracks all query-answer pairs for a user session.
    Maximum 50 pairs per conversation (enforced in spec.md).
    """
    id: UUID = Field(default_factory=uuid4, description="Conversation/Session ID")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When conversation started"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last activity timestamp"
    )
    account_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional account ID for cross-device sync"
    )
    query_answer_pairs: List[QueryAnswerPair] = Field(
        default_factory=list,
        description="Query-answer history (max 50 pairs)"
    )

    @field_validator('query_answer_pairs')
    @classmethod
    def validate_max_pairs(cls, v: List[QueryAnswerPair]) -> List[QueryAnswerPair]:
        """Enforce maximum 50 query-answer pairs per conversation"""
        if len(v) > 50:
            raise ValueError(
                f"Conversation cannot exceed 50 query-answer pairs. "
                f"Current: {len(v)}. Please start a new conversation."
            )
        return v

    def add_pair(self, query: Query, answer: Optional[Answer] = None) -> None:
        """
        Add query-answer pair to conversation.

        Args:
            query: User query
            answer: Generated answer (None if query failed)

        Raises:
            ValueError: If conversation already has 50 pairs
        """
        if len(self.query_answer_pairs) >= 50:
            raise ValueError(
                "Maximum conversation length (50 pairs) reached. "
                "Please start a new conversation."
            )

        pair = QueryAnswerPair(query=query, answer=answer)
        self.query_answer_pairs.append(pair)
        self.updated_at = datetime.utcnow()

    def get_total_pairs(self) -> int:
        """Get total number of query-answer pairs"""
        return len(self.query_answer_pairs)

    def get_latest_pair(self) -> Optional[QueryAnswerPair]:
        """Get most recent query-answer pair"""
        if not self.query_answer_pairs:
            return None
        return self.query_answer_pairs[-1]

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "created_at": "2025-12-06T10:00:00Z",
                "updated_at": "2025-12-06T10:30:05Z",
                "account_id": None,
                "query_answer_pairs": [
                    {
                        "query": {
                            "id": "q_1",
                            "query_text": "What is ROS 2?",
                            "selected_text": None,
                            "session_id": "123e4567-e89b-12d3-a456-426614174000",
                            "timestamp": "2025-12-06T10:30:00Z"
                        },
                        "answer": {
                            "id": "a_1",
                            "answer_text": "ROS 2 is...",
                            "citations": [],
                            "confidence_score": 0.85,
                            "retrieval_method": "vector_search",
                            "timestamp": "2025-12-06T10:30:05Z",
                            "query_id": "q_1"
                        }
                    }
                ]
            }
        }


class ConversationHistoryResponse(BaseModel):
    """Response model for GET /api/conversation/{session_id}"""
    conversation: Conversation = Field(..., description="Full conversation history")
    total_pairs: int = Field(..., description="Total query-answer pairs")
    remaining_capacity: int = Field(..., description="Remaining pairs before limit (50 - total)")

    class Config:
        json_schema_extra = {
            "example": {
                "conversation": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "created_at": "2025-12-06T10:00:00Z",
                    "updated_at": "2025-12-06T10:30:05Z",
                    "account_id": None,
                    "query_answer_pairs": []
                },
                "total_pairs": 5,
                "remaining_capacity": 45
            }
        }
