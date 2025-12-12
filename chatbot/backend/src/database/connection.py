"""
Database connection management for Neon Serverless Postgres.
Provides async engine and session management using SQLAlchemy.
"""
import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    AsyncEngine,
    async_sessionmaker
)
from sqlalchemy.pool import NullPool

from src.utils.config import settings

logger = logging.getLogger(__name__)


# Global async engine (initialized once at app startup)
_engine: AsyncEngine | None = None
_async_session_maker: async_sessionmaker[AsyncSession] | None = None


def get_database_url() -> str:
    """
    Construct async database URL for Neon Postgres.
    Converts postgresql:// to postgresql+asyncpg:// and removes sslmode parameter.
    """
    db_url = settings.neon_database_url

    # Remove sslmode parameter (asyncpg doesn't support it in URL)
    # SSL is configured via connect_args in create_engine()
    if "?sslmode=" in db_url:
        db_url = db_url.split("?sslmode=")[0]

    # Replace sync driver with async driver
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif not db_url.startswith("postgresql+asyncpg://"):
        raise ValueError(
            f"Invalid database URL. Must start with 'postgresql://' or 'postgresql+asyncpg://'. "
            f"Got: {db_url[:20]}..."
        )

    return db_url


def create_engine() -> AsyncEngine:
    """
    Create async SQLAlchemy engine for Neon Postgres.

    Configuration:
    - NullPool: Neon Serverless handles connection pooling
    - echo: Log SQL queries in development
    - future: Use SQLAlchemy 2.0 API
    """
    database_url = get_database_url()

    logger.info(f"Creating async engine for Neon Postgres: {database_url.split('@')[1] if '@' in database_url else 'hidden'}")

    # Import ssl module for asyncpg SSL configuration
    import ssl
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = True
    ssl_context.verify_mode = ssl.CERT_REQUIRED

    engine = create_async_engine(
        database_url,
        echo=settings.debug,  # Log SQL queries in debug mode
        future=True,  # Use SQLAlchemy 2.0 behavior
        poolclass=NullPool,  # Neon handles pooling
        connect_args={
            "ssl": ssl_context,  # Use SSL context for asyncpg
            "server_settings": {
                "application_name": "rag-chatbot-backend"
            }
        }
    )

    return engine


def init_db() -> None:
    """
    Initialize database engine and session maker.
    Called once at FastAPI app startup.
    """
    global _engine, _async_session_maker

    if _engine is not None:
        logger.warning("Database engine already initialized")
        return

    _engine = create_engine()
    _async_session_maker = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,  # Don't expire objects after commit
        autoflush=False,  # Manual control over flushing
        autocommit=False  # Transactions required
    )

    logger.info("Database engine and session maker initialized")


async def close_db() -> None:
    """
    Close database engine and cleanup connections.
    Called at FastAPI app shutdown.
    """
    global _engine, _async_session_maker

    if _engine is None:
        logger.warning("Database engine not initialized, nothing to close")
        return

    logger.info("Closing database engine")
    await _engine.dispose()
    _engine = None
    _async_session_maker = None
    logger.info("Database engine closed")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI routes to get database session.

    Usage:
        @app.post("/query")
        async def query_endpoint(db: AsyncSession = Depends(get_db)):
            # Use db for queries
            pass

    Yields:
        AsyncSession: Database session (auto-commits on success, rolls back on error)
    """
    if _async_session_maker is None:
        raise RuntimeError(
            "Database not initialized. Call init_db() at app startup."
        )

    async with _async_session_maker() as session:
        try:
            yield session
            await session.commit()  # Auto-commit if no exceptions
        except Exception:
            await session.rollback()  # Rollback on error
            raise
        finally:
            await session.close()


def get_engine() -> AsyncEngine:
    """
    Get the global async engine instance.

    Returns:
        AsyncEngine: The initialized database engine

    Raises:
        RuntimeError: If engine not initialized
    """
    if _engine is None:
        raise RuntimeError(
            "Database engine not initialized. Call init_db() at app startup."
        )
    return _engine
