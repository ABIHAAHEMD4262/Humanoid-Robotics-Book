"""
Vector retrieval service using Qdrant Cloud.
Searches for relevant book passages using cosine similarity.
"""
import logging
from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, ScoredPoint, Filter, FieldCondition, MatchValue

from src.models.passage import RetrievedPassage, PassageMetadata
from src.utils.config import settings

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Service for vector similarity search in Qdrant.

    Configuration:
    - Collection: "book_passages"
    - Vector size: 1536 dimensions
    - Distance: Cosine similarity
    - Threshold: ≥0.7
    - Top-k: 3-5 results
    """

    def __init__(
        self,
        url: str | None = None,
        api_key: str | None = None,
        collection_name: str = "book_passages"
    ):
        """
        Initialize Qdrant client.

        Args:
            url: Qdrant URL (defaults to settings.qdrant_url)
            api_key: Qdrant API key (defaults to settings.qdrant_api_key)
            collection_name: Collection name (default: "book_passages")
        """
        self.client = QdrantClient(
            url=url or settings.qdrant_url,
            api_key=api_key or settings.qdrant_api_key
        )
        self.collection_name = collection_name
        self.top_k = settings.vector_search_top_k
        self.threshold = settings.vector_similarity_threshold

        logger.info(
            f"Initialized RetrievalService: "
            f"collection={collection_name}, "
            f"top_k={self.top_k}, "
            f"threshold={self.threshold}"
        )

    async def search(
        self,
        query_embedding: List[float],
        top_k: Optional[int] = None,
        threshold: Optional[float] = None,
        chapter_filter: Optional[str] = None
    ) -> List[RetrievedPassage]:
        """
        Search for relevant passages using vector similarity.

        Args:
            query_embedding: 1536-dim query embedding vector
            top_k: Number of results to return (default: from config)
            threshold: Minimum similarity score (default: from config)
            chapter_filter: Optional chapter title filter (for hybrid retrieval)

        Returns:
            List of retrieved passages with similarity ≥ threshold

        Raises:
            Exception: If Qdrant search fails
        """
        try:
            k = top_k or self.top_k
            min_score = threshold or self.threshold

            logger.debug(
                f"Searching Qdrant: top_k={k}, threshold={min_score}, "
                f"chapter_filter={chapter_filter}"
            )

            # Build filter if chapter specified
            query_filter = None
            if chapter_filter:
                query_filter = Filter(
                    must=[
                        FieldCondition(
                            key="chapter_title",
                            match=MatchValue(value=chapter_filter)
                        )
                    ]
                )

            # Perform vector search using query_points (Qdrant v1.16+)
            search_result = self.client.query_points(
                collection_name=self.collection_name,
                query=query_embedding,
                limit=k,
                score_threshold=min_score,
                query_filter=query_filter
            ).points

            # Convert to RetrievedPassage models
            passages = []
            for scored_point in search_result:
                try:
                    passage = self._scored_point_to_passage(scored_point)
                    passages.append(passage)
                except Exception as e:
                    logger.error(f"Failed to parse passage: {e}")
                    continue

            logger.info(
                f"Retrieved {len(passages)} passages "
                f"(similarity ≥{min_score})"
            )

            return passages

        except Exception as e:
            logger.error(f"Qdrant search failed: {e}")
            raise

    def _scored_point_to_passage(self, point: ScoredPoint) -> RetrievedPassage:
        """
        Convert Qdrant ScoredPoint to RetrievedPassage model.

        Args:
            point: Qdrant search result

        Returns:
            RetrievedPassage with metadata
        """
        payload = point.payload

        return RetrievedPassage(
            id=str(point.id),
            passage_text=payload["passage_text"],
            chapter_title=payload["chapter_title"],
            section_title=payload["section_title"],
            source_url=payload["source_url"],
            paragraph_id=payload.get("paragraph_id"),
            similarity_score=point.score,
            embedding_id=str(point.id)
        )

    def close(self):
        """Close Qdrant client"""
        self.client.close()
