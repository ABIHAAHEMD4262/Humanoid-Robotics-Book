"""
Query API routes for RAG chatbot.
Handles POST /api/query endpoint for question answering.
"""
import logging
import time
from typing import List
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, status, Depends

from src.models.query import QueryRequest, Query
from src.models.answer import QueryResponse, InsufficientContentResponse
from src.models.passage import RetrievedPassage
from src.services.answer_generator import AnswerGenerationService
from src.services.conversation import ConversationService
from src.services.embedding import EmbeddingService
from src.services.retrieval import RetrievalService
from src.services.llm import LLMService
from src.utils.validators import validate_query_text, validate_selected_text

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["query"])


# Dependency injection for services
# TODO: Move to app lifecycle (startup/shutdown) for proper resource management
def get_embedding_service() -> EmbeddingService:
    """Get embedding service instance"""
    return EmbeddingService()


def get_retrieval_service() -> RetrievalService:
    """Get retrieval service instance"""
    return RetrievalService()


def get_llm_service() -> LLMService:
    """Get LLM service instance"""
    return LLMService()


def get_answer_service(
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    llm_service: LLMService = Depends(get_llm_service)
) -> AnswerGenerationService:
    """Get answer generation service instance"""
    return AnswerGenerationService(
        embedding_service=embedding_service,
        retrieval_service=retrieval_service,
        llm_service=llm_service
    )


def get_conversation_service() -> ConversationService:
    """Get conversation service instance"""
    return ConversationService()


@router.post("/query", response_model=QueryResponse, status_code=status.HTTP_200_OK)
async def submit_query(
    request: QueryRequest,
    answer_service: AnswerGenerationService = Depends(get_answer_service),
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Submit a query and get grounded answer with citations.

    Pipeline:
    1. Validate input (query text, selected text)
    2. Generate query embedding
    3. Search vector database (similarity ≥0.7)
    4. Generate LLM answer from passages
    5. Extract citations
    6. Save to conversation history
    7. Return answer + metadata

    Returns:
        - 200: Success with answer and citations
        - 400: Invalid input
        - 429: Rate limit exceeded
        - 500: Internal server error
        - 503: External service unavailable
    """
    start_time = time.time()

    try:
        # Validate input
        query_text = validate_query_text(request.query_text)
        selected_text = validate_selected_text(request.selected_text)

        # Generate session ID if not provided
        session_id = request.session_id or uuid4()

        logger.info(
            f"Processing query: session={session_id}, "
            f"query_length={len(query_text)}, "
            f"has_selected_text={selected_text is not None}"
        )

        # Create Query object
        query = Query(
            query_text=query_text,
            selected_text=selected_text,
            session_id=session_id
        )

        # Generate answer using RAG pipeline
        answer, passages = await answer_service.generate_answer(query)

        # Save query-answer pair to conversation
        await conversation_service.save_query_answer_pair(
            session_id=session_id,
            query=query,
            answer=answer
        )

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)  # milliseconds

        logger.info(
            f"Query processed successfully: "
            f"query_id={query.id}, "
            f"answer_length={len(answer.answer_text)}, "
            f"citations={len(answer.citations)}, "
            f"processing_time={processing_time}ms"
        )

        # Convert passages to dict for response
        passages_dict = [
            {
                "id": p.id,
                "passage_text": p.passage_text[:200] + "...",  # Truncate for response size
                "section_title": p.section_title,
                "similarity_score": p.similarity_score
            }
            for p in passages
        ]

        # Build response
        response = QueryResponse(
            query_id=query.id,
            session_id=session_id,
            answer=answer,
            retrieved_passages=passages_dict,
            processing_time_ms=processing_time
        )

        return response

    except HTTPException:
        # Re-raise validation errors
        raise

    except Exception as e:
        logger.error(f"Query processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your query. Please try again."
        )


@router.get("/conversation/{session_id}")
async def get_conversation_history(
    session_id: UUID,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get conversation history for a session.

    Args:
        session_id: Session UUID

    Returns:
        Conversation history with all query-answer pairs

    Raises:
        404: Conversation not found
    """
    try:
        conversation = await conversation_service.get_conversation(session_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation not found: {session_id}"
            )

        total_pairs = conversation.get_total_pairs()
        remaining_capacity = 50 - total_pairs

        return {
            "conversation": conversation,
            "total_pairs": total_pairs,
            "remaining_capacity": remaining_capacity
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Failed to retrieve conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation history"
        )
