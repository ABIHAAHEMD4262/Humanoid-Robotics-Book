"""
Citation model for source attribution in answers.
Links answers back to specific book sections with clickable URLs.
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class Citation(BaseModel):
    """
    Citation linking an answer to a specific book passage.

    Each citation includes:
    - Chapter and section titles for context
    - Clickable URL to exact location in book
    - Paragraph ID for precise reference
    - Relevance score from vector search
    """
    passage_id: str = Field(..., description="UUID of the passage in database")
    chapter_title: str = Field(..., max_length=200, description="Chapter title (e.g., 'Module 1: Introduction to Humanoid Robotics')")
    section_title: str = Field(..., max_length=200, description="Section title (e.g., '1.2 History of Robotics')")
    source_url: HttpUrl = Field(..., description="Full URL to book section (e.g., 'https://book.com/module1/history#para-5')")
    paragraph_id: Optional[str] = Field(None, max_length=100, description="Paragraph anchor ID (e.g., 'para-5')")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Cosine similarity score from vector search (0.0-1.0)")

    class Config:
        json_schema_extra = {
            "example": {
                "passage_id": "p_abc123xyz",
                "chapter_title": "Module 1: Introduction to Humanoid Robotics",
                "section_title": "1.2 History of Robotics",
                "source_url": "https://example.com/book/module1/history#para-5",
                "paragraph_id": "para-5",
                "relevance_score": 0.87
            }
        }

    def to_markdown(self) -> str:
        """
        Format citation as Markdown link for display in answers.

        Returns:
            Markdown formatted citation like: [Chapter 1.2: History of Robotics](https://...)
        """
        return f"[{self.section_title}]({self.source_url})"

    def to_human_readable(self) -> str:
        """
        Format citation as human-readable text.

        Returns:
            Human-readable string like: "Module 1: Introduction to Humanoid Robotics → 1.2 History of Robotics"
        """
        return f"{self.chapter_title} → {self.section_title}"


class CitationList(BaseModel):
    """List of citations with metadata"""
    citations: list[Citation] = Field(default_factory=list, description="List of citations")
    total_count: int = Field(..., description="Total number of citations")
    avg_relevance_score: float = Field(..., ge=0.0, le=1.0, description="Average relevance score across all citations")

    class Config:
        json_schema_extra = {
            "example": {
                "citations": [
                    {
                        "passage_id": "p_abc123",
                        "chapter_title": "Module 1",
                        "section_title": "1.2 History",
                        "source_url": "https://example.com/module1/history",
                        "paragraph_id": "para-5",
                        "relevance_score": 0.87
                    }
                ],
                "total_count": 1,
                "avg_relevance_score": 0.87
            }
        }

    @classmethod
    def from_citations(cls, citations: list[Citation]) -> "CitationList":
        """
        Create CitationList from list of Citation objects.

        Args:
            citations: List of Citation objects

        Returns:
            CitationList with computed metadata
        """
        total = len(citations)
        avg_score = sum(c.relevance_score for c in citations) / total if total > 0 else 0.0

        return cls(
            citations=citations,
            total_count=total,
            avg_relevance_score=avg_score
        )
