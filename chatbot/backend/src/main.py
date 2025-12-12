"""
RAG Chatbot Backend API
FastAPI application entry point with CORS middleware and service lifecycle management
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from src.utils.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI app startup and shutdown.

    Manages singleton service instances to prevent per-request instantiation.
    This is critical for performance and resource management.
    """
    logger.info("Starting RAG Chatbot Backend...")

    # Initialize database connection
    from src.database.connection import init_db, close_db
    logger.info("Initializing database connection...")
    init_db()

    # Initialize singleton services (H022-H023)
    from src.services.assistant import AssistantService
    from src.services.embedding import EmbeddingService
    from src.services.retrieval import RetrievalService
    from src.services.thread_manager import ThreadManager
    from src.database.repositories import MessageRepository

    logger.info("Initializing singleton services...")

    # Create service instances once
    app.state.assistant_service = AssistantService()
    logger.info("  - AssistantService initialized")

    app.state.embedding_service = EmbeddingService()
    logger.info("  - EmbeddingService initialized")

    app.state.retrieval_service = RetrievalService()
    logger.info("  - RetrievalService initialized")

    app.state.thread_manager = ThreadManager(
        assistant_service=app.state.assistant_service
    )
    logger.info("  - ThreadManager initialized")

    app.state.message_repository = MessageRepository()
    logger.info("  - MessageRepository initialized")

    logger.info("RAG Chatbot Backend started successfully")

    yield

    # Cleanup on shutdown
    logger.info("Shutting down RAG Chatbot Backend...")

    # Close OpenAI client
    if hasattr(app.state, 'assistant_service'):
        await app.state.assistant_service.close()
        logger.info("  - AssistantService closed")

    # Close Qdrant client (if it has a close method)
    if hasattr(app.state, 'retrieval_service'):
        if hasattr(app.state.retrieval_service, 'close'):
            await app.state.retrieval_service.close()
        logger.info("  - RetrievalService closed")

    # Close database
    await close_db()

    logger.info("RAG Chatbot Backend shutdown complete")


# Create FastAPI app with lifespan management
app = FastAPI(
    title="RAG Chatbot API",
    description="Retrieval-Augmented Generation chatbot for AI-Native Book with OpenAI Assistants API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS with specific allowed origins (SECURITY FIX)
logger.info(f"Configuring CORS with allowed origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Use specific origins from settings
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "rag-chatbot-backend",
            "version": "0.1.0"
        }
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "RAG Chatbot API",
        "version": "0.1.0",
        "docs": "/api/docs",
        "health": "/health"
    }

# Register API routes
from src.api.routes import query
app.include_router(query.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )
