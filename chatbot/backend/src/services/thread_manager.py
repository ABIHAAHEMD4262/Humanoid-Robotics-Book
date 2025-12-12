"""
Thread management service for OpenAI Assistants API.
Manages the mapping between user sessions and OpenAI conversation threads.
"""
import logging
from typing import Optional, Tuple
from uuid import UUID, uuid4
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import Session
from src.services.assistant import AssistantService

logger = logging.getLogger(__name__)


class ThreadManager:
    """
    Manages the lifecycle of OpenAI Assistant threads and their mapping to user sessions.

    Responsibilities:
    - Get or create OpenAI threads for user sessions
    - Store thread mappings in Neon Postgres
    - Track session activity timestamps
    - Handle session-to-thread persistence
    """

    def __init__(self, assistant_service: AssistantService):
        """
        Initialize ThreadManager with an AssistantService instance.

        Args:
            assistant_service: Service for OpenAI Assistants API operations
        """
        self.assistant_service = assistant_service
        logger.info("Initialized ThreadManager")

    async def get_or_create_thread(
        self,
        db: AsyncSession,
        session_id: Optional[UUID] = None,
        user_id: Optional[str] = None,
        device_info: Optional[dict] = None
    ) -> Tuple[UUID, str]:
        """
        Get existing thread for a session or create a new one.

        This is the primary method for thread management. It ensures that:
        1. Every session has exactly one OpenAI thread
        2. Thread IDs are persisted in Neon Postgres
        3. Session activity timestamps are updated

        Args:
            db: Database session (from FastAPI dependency)
            session_id: Existing session UUID (None for new sessions)
            user_id: Optional user identifier for authenticated users
            device_info: Optional device/browser metadata

        Returns:
            Tuple of (session_id, thread_id)

        Raises:
            Exception: If thread creation or database operation fails
        """
        try:
            # Case 1: Existing session - retrieve thread
            if session_id:
                logger.debug(f"Looking up existing session: {session_id}")

                stmt = select(Session).where(Session.id == session_id)
                result = await db.execute(stmt)
                session = result.scalar_one_or_none()

                if session:
                    # Update last_active_at timestamp
                    session.last_active_at = datetime.utcnow()
                    await db.commit()

                    logger.info(
                        f"Retrieved existing thread: session={session_id}, "
                        f"thread={session.thread_id}"
                    )
                    return session.id, session.thread_id
                else:
                    logger.warning(
                        f"Session {session_id} not found in database, "
                        "creating new session"
                    )

            # Case 2: No session or session not found - create new
            logger.info("Creating new OpenAI thread")
            thread_id = await self.assistant_service.create_thread()

            # Create new session record
            new_session = Session(
                id=uuid4(),
                thread_id=thread_id,
                user_id=user_id,
                device_info=device_info
            )

            db.add(new_session)
            await db.commit()
            await db.refresh(new_session)

            logger.info(
                f"Created new session and thread: session={new_session.id}, "
                f"thread={thread_id}"
            )

            return new_session.id, thread_id

        except Exception as e:
            logger.error(f"Thread management failed: {e}", exc_info=True)
            await db.rollback()
            raise

    async def get_thread_by_session(
        self,
        db: AsyncSession,
        session_id: UUID
    ) -> Optional[str]:
        """
        Get thread ID for an existing session without creating a new one.

        This is a read-only operation useful for validation or analytics.

        Args:
            db: Database session
            session_id: Session UUID to lookup

        Returns:
            Thread ID if session exists, None otherwise
        """
        try:
            stmt = select(Session.thread_id).where(Session.id == session_id)
            result = await db.execute(stmt)
            thread_id = result.scalar_one_or_none()

            if thread_id:
                logger.debug(f"Found thread {thread_id} for session {session_id}")
            else:
                logger.debug(f"No thread found for session {session_id}")

            return thread_id

        except Exception as e:
            logger.error(f"Failed to get thread for session {session_id}: {e}")
            return None

    async def update_session_activity(
        self,
        db: AsyncSession,
        session_id: UUID
    ) -> bool:
        """
        Update the last_active_at timestamp for a session.

        Should be called on every interaction to track session activity.

        Args:
            db: Database session
            session_id: Session UUID to update

        Returns:
            True if update succeeded, False otherwise
        """
        try:
            stmt = select(Session).where(Session.id == session_id)
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()

            if session:
                session.last_active_at = datetime.utcnow()
                await db.commit()
                logger.debug(f"Updated activity timestamp for session {session_id}")
                return True
            else:
                logger.warning(f"Session {session_id} not found for activity update")
                return False

        except Exception as e:
            logger.error(f"Failed to update session activity: {e}")
            await db.rollback()
            return False
