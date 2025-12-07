"""
Answer generation orchestration service.
Coordinates embedding → retrieval → LLM → citation extraction pipeline.
"""
import logging
from typing import List, Tuple
from uuid import UUID

from src.models.query import Query
from src.models.answer import Answer, RetrievalMethod
from src.models.passage import RetrievedPassage
from src.models.citation import Citation
from src.services.embedding import EmbeddingService
from src.services.retrieval import RetrievalService
from src.services.llm import LLMService

logger = logging.getLogger(__name__)


class AnswerGenerationService:
    """
    Orchestrates the complete RAG pipeline:
    1. Generate query embedding
    2. Search vector database
    3. Generate LLM answer
    4. Extract citations
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        retrieval_service: RetrievalService,
        llm_service: LLMService
    ):
        """
        Initialize with required services.

        Args:
            embedding_service: Service for query embeddings
            retrieval_service: Service for vector search
            llm_service: Service for answer generation
        """
        self.embedding_service = embedding_service
        self.retrieval_service = retrieval_service
        self.llm_service = llm_service
        logger.info("Initialized AnswerGenerationService")

    async def generate_answer(
        self,
        query: Query
    ) -> Tuple[Answer, List[RetrievedPassage]]:
        """
        Generate answer for a query using RAG pipeline.

        Pipeline:
        1. Embed query text
        2. Search Qdrant for relevant passages (similarity ≥0.7)
        3. If no passages found → return "not available"
        4. Generate LLM answer from passages
        5. Extract citations from passages
        6. Return answer + passages

        Args:
            query: User query object

        Returns:
            Tuple of (Answer, List[RetrievedPassage])

        Raises:
            Exception: If any step in pipeline fails
        """
        try:
            logger.info(f"Starting answer generation for query: {query.id}")

            # Step 1: Generate query embedding
            logger.debug("Step 1/4: Generating query embedding...")
            query_embedding = await self.embedding_service.embed_query(
                query.query_text
            )

            # Step 2: Search vector database
            logger.debug("Step 2/4: Searching vector database...")
            passages = await self.retrieval_service.search(
                query_embedding=query_embedding
            )

            # Step 3: Check if sufficient content found
            if not passages or len(passages) == 0:
                logger.warning("No passages found with similarity ≥0.7")
                return self._create_not_available_answer(query.id), []

            # Step 4: Generate LLM answer from passages
            logger.debug(f"Step 3/4: Generating LLM answer from {len(passages)} passages...")
            answer_text = await self.llm_service.generate_answer(
                query=query.query_text,
                passages=passages
            )

            # Check if LLM returned "not available" response
            if "not available" in answer_text.lower():
                logger.info("LLM determined information not available")
                return self._create_not_available_answer(query.id), passages

            # Step 5: Extract citations from passages
            logger.debug("Step 4/4: Extracting citations...")
            citations = self._extract_citations(passages)

            # Step 6: Calculate confidence score
            confidence_score = self._calculate_confidence(passages)

            # Create answer object
            answer = Answer(
                answer_text=answer_text,
                citations=citations,
                confidence_score=confidence_score,
                retrieval_method=RetrievalMethod.VECTOR_SEARCH,
                query_id=query.id
            )

            logger.info(
                f"Answer generated successfully: "
                f"{len(answer_text)} chars, "
                f"{len(citations)} citations, "
                f"confidence={confidence_score:.2f}"
            )

            return answer, passages

        except Exception as e:
            logger.error(f"Answer generation failed: {e}")
            raise

    def _extract_citations(self, passages: List[RetrievedPassage]) -> List[Citation]:
        """
        Extract citations from retrieved passages.

        Args:
            passages: Retrieved passages from vector search

        Returns:
            List of Citation objects
        """
        citations = []

        for passage in passages:
            citation = Citation(
                passage_id=passage.id,
                chapter_title=passage.chapter_title,
                section_title=passage.section_title,
                source_url=passage.source_url,
                paragraph_id=passage.paragraph_id,
                relevance_score=passage.similarity_score
            )
            citations.append(citation)

        return citations

    def _calculate_confidence(self, passages: List[RetrievedPassage]) -> float:
        """
        Calculate answer confidence score based on passage similarity scores.

        Uses average similarity score of top passages.

        Args:
            passages: Retrieved passages

        Returns:
            Confidence score (0.0-1.0)
        """
        if not passages:
            return 0.0

        # Average similarity score
        avg_score = sum(p.similarity_score for p in passages) / len(passages)

        return round(avg_score, 2)

    def _create_not_available_answer(self, query_id: UUID) -> Answer:
        """
        Create "not available" answer when no relevant content found.

        Args:
            query_id: ID of the query

        Returns:
            Answer with "not available" message
        """
        return Answer(
            answer_text="The information is not available in the book.",
            citations=[],
            confidence_score=0.0,
            retrieval_method=RetrievalMethod.VECTOR_SEARCH,
            query_id=query_id
        )
