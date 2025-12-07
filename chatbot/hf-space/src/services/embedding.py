"""
Embedding service using Google Gemini text-embedding-004.
Generates 768-dimensional embeddings for query text.
"""
import logging
from typing import List
import google.generativeai as genai

from src.utils.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating text embeddings using Google Gemini.

    Uses text-embedding-004 model:
    - 768 dimensions
    - Free tier available
    - Fast and reliable
    """

    def __init__(self, api_key: str | None = None):
        """
        Initialize Gemini client.

        Args:
            api_key: Gemini API key (defaults to settings.gemini_api_key)
        """
        genai.configure(api_key=api_key or settings.gemini_api_key)
        self.model = "models/text-embedding-004"
        logger.info(f"Initialized EmbeddingService with Gemini model: {self.model}")

    async def embed_query(self, query_text: str) -> List[float]:
        """
        Generate embedding for a single query.

        Args:
            query_text: User's question text

        Returns:
            768-dimensional embedding vector

        Raises:
            Exception: If embedding generation fails
        """
        try:
            logger.debug(f"Generating embedding for query: {query_text[:100]}...")

            result = genai.embed_content(
                model=self.model,
                content=query_text,
                task_type="retrieval_query"
            )

            embedding = result['embedding']

            logger.debug(f"Generated embedding: {len(embedding)} dimensions")

            if len(embedding) != 768:
                logger.warning(
                    f"Unexpected embedding dimension: {len(embedding)} "
                    f"(expected 768)"
                )

            return embedding

        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch mode).

        Args:
            texts: List of text strings to embed

        Returns:
            List of embedding vectors (one per input text)

        Raises:
            Exception: If batch embedding fails
        """
        try:
            logger.debug(f"Generating embeddings for {len(texts)} texts...")

            embeddings = []
            for text in texts:
                result = genai.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])

            logger.debug(f"Generated {len(embeddings)} embeddings")

            return embeddings

        except Exception as e:
            logger.error(f"Batch embedding generation failed: {e}")
            raise

    async def close(self):
        """Close the client (no-op for Gemini)"""
        pass
