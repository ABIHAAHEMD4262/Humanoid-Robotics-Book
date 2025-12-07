"""
Passage data model for retrieved book content.
Represents a chunk of book text retrieved from vector database.
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, field_validator


class RetrievedPassage(BaseModel):
    """
    Retrieved passage from vector search.

    Includes:
    - Passage text (500-750 token chunk)
    - Source metadata (chapter, section, URL)
    - Similarity score from Qdrant (must be ≥0.7)
    """
    id: str = Field(..., description="Passage ID (from Qdrant)")
    passage_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Text content (500-750 tokens)"
    )
    chapter_title: str = Field(
        ...,
        max_length=200,
        description="Chapter title (e.g., 'Module 1: Introduction')"
    )
    section_title: str = Field(
        ...,
        max_length=200,
        description="Section title (e.g., '1.2 History of Robotics')"
    )
    source_url: HttpUrl = Field(
        ...,
        description="URL to book section"
    )
    paragraph_id: Optional[str] = Field(
        None,
        max_length=100,
        description="Paragraph anchor ID"
    )
    similarity_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Cosine similarity score (0.0-1.0)"
    )
    embedding_id: str = Field(
        ...,
        description="Qdrant vector ID"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "passage_abc123",
                "passage_text": "ROS 2 (Robot Operating System 2) is the next generation of ROS...",
                "chapter_title": "Module 1: Introduction to Humanoid Robotics",
                "section_title": "1.3 Robot Operating Systems",
                "source_url": "https://example.com/book/module1/ros#para-12",
                "paragraph_id": "para-12",
                "similarity_score": 0.87,
                "embedding_id": "emb_xyz789"
            }
        }


class PassageMetadata(BaseModel):
    """
    Metadata stored in Qdrant payload.
    This is what we store alongside the embedding vector.
    """
    passage_text: str = Field(..., max_length=5000)
    chapter_title: str = Field(..., max_length=200)
    section_title: str = Field(..., max_length=200)
    source_url: str = Field(...)
    paragraph_id: Optional[str] = Field(None, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "passage_text": "ROS 2 introduces improved real-time capabilities...",
                "chapter_title": "Module 1: Introduction to Humanoid Robotics",
                "section_title": "1.3 Robot Operating Systems",
                "source_url": "https://example.com/book/module1/ros#para-12",
                "paragraph_id": "para-12"
            }
        }
