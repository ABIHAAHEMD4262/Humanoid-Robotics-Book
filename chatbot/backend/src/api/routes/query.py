"""
Query API routes for RAG chatbot.
Handles POST /api/query endpoint for question answering.

UPDATED: Now uses OpenAI Assistants API with Neon Postgres persistence.
"""
import logging
import time
from typing import List
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.query import QueryRequest, Query
from src.models.answer import QueryResponse, InsufficientContentResponse
from src.models.passage import RetrievedPassage
from src.models.citation import Citation as CitationModel
from src.services.embedding import EmbeddingService
from src.services.retrieval import RetrievalService
from src.services.assistant import AssistantService
from src.services.thread_manager import ThreadManager
from src.database.repositories import MessageRepository
from src.database.connection import get_db
from src.utils.validators import validate_query_text, validate_selected_text

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["query"])


# Dependency injection for singleton services (H022-H023 COMPLETE)
# Services are initialized once at app startup and reused across all requests
def get_embedding_service(request: Request) -> EmbeddingService:
    """Get singleton embedding service instance from app state"""
    return request.app.state.embedding_service


def get_retrieval_service(request: Request) -> RetrievalService:
    """Get singleton retrieval service instance from app state"""
    return request.app.state.retrieval_service


def get_assistant_service(request: Request) -> AssistantService:
    """Get singleton OpenAI Assistants API service instance from app state"""
    return request.app.state.assistant_service


def get_thread_manager(request: Request) -> ThreadManager:
    """Get singleton thread manager instance from app state"""
    return request.app.state.thread_manager


def get_message_repository(request: Request) -> MessageRepository:
    """Get singleton message repository instance from app state"""
    return request.app.state.message_repository


@router.post("/query", response_model=QueryResponse, status_code=status.HTTP_200_OK)
async def submit_query(
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    assistant_service: AssistantService = Depends(get_assistant_service),
    thread_manager: ThreadManager = Depends(get_thread_manager),
    message_repo: MessageRepository = Depends(get_message_repository)
):
    """
    Submit a query and get grounded answer with citations.

    NEW PIPELINE (OpenAI Assistants API + Neon Postgres):
    1. Validate input (query text, selected text)
    2. Get or create conversation thread (with Neon persistence)
    3. Generate query embedding
    4. Search vector database (similarity ≥0.7)
    5. Save user message to Neon Postgres
    6. Generate answer using OpenAI Assistants API
    7. Save assistant message to Neon Postgres
    8. Extract citations and persist
    9. Return answer + metadata

    Returns:
        - 200: Success with answer and citations
        - 400: Invalid input
        - 429: Rate limit exceeded
        - 500: Internal server error
        - 503: External service unavailable
    """
    start_time = time.time()

    try:
        # Step 1: Validate input
        query_text = validate_query_text(request.query_text)
        selected_text = validate_selected_text(request.selected_text)

        logger.info(
            f"Processing query: query_length={len(query_text)}, "
            f"has_selected_text={selected_text is not None}"
        )

        # Step 2: Get or create thread (with session management)
        session_id, thread_id = await thread_manager.get_or_create_thread(
            db=db,
            session_id=request.session_id,
            user_id=None,  # TODO: Add user authentication
            device_info=None  # TODO: Extract from request headers
        )

        logger.info(f"Using session={session_id}, thread={thread_id}")

        # Step 3: Generate query embedding
        logger.debug("Generating query embedding...")
        query_embedding = await embedding_service.embed_query(query_text)

        # Step 4: Search vector database
        logger.debug("Searching vector database...")
        passages = await retrieval_service.search(
            query_embedding=query_embedding
        )

        # Check if sufficient content found
        if not passages or len(passages) == 0:
            logger.warning("No passages found with similarity ≥0.7")
            answer_text = "The information is not available in the book."
            passages = []
        else:
            # Step 5: Save user message to database
            logger.debug("Saving user message to database...")
            await message_repo.save_user_message(
                db=db,
                session_id=session_id,
                thread_id=thread_id,
                content=query_text,
                selected_text=selected_text
            )

            # Step 6: Generate answer using OpenAI Assistants API
            logger.debug(f"Generating answer from {len(passages)} passages...")
            answer_text = await assistant_service.answer_query(
                thread_id=thread_id,
                query=query_text,
                passages=passages,
                selected_text=selected_text
            )

        # Step 7: Save assistant message to database
        logger.debug("Saving assistant message to database...")
        assistant_message = await message_repo.save_assistant_message(
            db=db,
            session_id=session_id,
            thread_id=thread_id,
            content=answer_text,
            passages=passages
        )

        # Step 8: Extract citations from database
        citations = [
            CitationModel(
                passage_id=c.qdrant_point_id,
                chapter_title=c.chapter_title,
                section_title=c.section_title,
                source_url=c.url_fragment,
                relevance_score=c.similarity_score
            )
            for c in assistant_message.citations
        ]

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)  # milliseconds

        logger.info(
            f"Query processed successfully: "
            f"session={session_id}, "
            f"thread={thread_id}, "
            f"answer_length={len(answer_text)}, "
            f"citations={len(citations)}, "
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
        from src.models.answer import Answer, RetrievalMethod
        answer = Answer(
            answer_text=answer_text,
            citations=citations,
            confidence_score=round(sum(p.similarity_score for p in passages) / len(passages), 2) if passages else 0.0,
            retrieval_method=RetrievalMethod.VECTOR_SEARCH,
            query_id=uuid4()
        )

        response = QueryResponse(
            query_id=uuid4(),
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
    db: AsyncSession = Depends(get_db),
    message_repo: MessageRepository = Depends(get_message_repository)
):
    """
    Get conversation history for a session from Neon Postgres.

    Args:
        session_id: Session UUID

    Returns:
        Conversation history with all messages and citations

    Raises:
        404: Conversation not found
    """
    try:
        # Get messages from database
        messages = await message_repo.get_conversation_messages(
            db=db,
            session_id=session_id,
            limit=50
        )

        if not messages:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation not found: {session_id}"
            )

        # Format messages for response
        formatted_messages = [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "selected_text": msg.selected_text,
                "created_at": msg.created_at.isoformat(),
                "citations": [
                    {
                        "chapter_title": c.chapter_title,
                        "section_title": c.section_title,
                        "url_fragment": c.url_fragment,
                        "similarity_score": c.similarity_score
                    }
                    for c in msg.citations
                ] if msg.role == "assistant" else []
            }
            for msg in reversed(messages)  # Reverse to show oldest first
        ]

        # Calculate metrics
        total_messages = len(messages)
        total_pairs = total_messages // 2  # Each pair is 1 user + 1 assistant message
        remaining_capacity = 50 - total_pairs

        return {
            "session_id": str(session_id),
            "messages": formatted_messages,
            "total_messages": total_messages,
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
