"""
Message repository for database operations.
Handles CRUD operations for messages and citations.
"""
import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database.models import Message, Citation, Session
from src.models.passage import RetrievedPassage

logger = logging.getLogger(__name__)


class MessageRepository:
    """
    Repository for message and citation persistence operations.

    Handles:
    - Saving user queries and assistant responses
    - Storing citations for answers
    - Retrieving conversation history
    - Tracking message metadata
    """

    async def save_user_message(
        self,
        db: AsyncSession,
        session_id: UUID,
        thread_id: str,
        content: str,
        selected_text: Optional[str] = None,
        message_id: Optional[str] = None
    ) -> Message:
        """
        Save a user message to the database.

        Args:
            db: Database session
            session_id: Session UUID
            thread_id: OpenAI thread ID
            content: User's query text
            selected_text: Optional user-selected text from the book
            message_id: Optional OpenAI message ID

        Returns:
            Created Message object

        Raises:
            Exception: If database operation fails
        """
        try:
            user_message = Message(
                session_id=session_id,
                thread_id=thread_id,
                message_id=message_id,
                role="user",
                content=content,
                selected_text=selected_text
            )

            db.add(user_message)
            await db.commit()
            await db.refresh(user_message)

            logger.info(
                f"Saved user message: id={user_message.id}, "
                f"session={session_id}, thread={thread_id}"
            )

            return user_message

        except Exception as e:
            logger.error(f"Failed to save user message: {e}", exc_info=True)
            await db.rollback()
            raise

    async def save_assistant_message(
        self,
        db: AsyncSession,
        session_id: UUID,
        thread_id: str,
        content: str,
        passages: List[RetrievedPassage],
        message_id: Optional[str] = None
    ) -> Message:
        """
        Save an assistant message with citations to the database.

        Args:
            db: Database session
            session_id: Session UUID
            thread_id: OpenAI thread ID
            content: Assistant's answer text
            passages: Retrieved passages used for answer (for citations)
            message_id: Optional OpenAI message ID

        Returns:
            Created Message object with citations

        Raises:
            Exception: If database operation fails
        """
        try:
            # Create assistant message
            assistant_message = Message(
                session_id=session_id,
                thread_id=thread_id,
                message_id=message_id,
                role="assistant",
                content=content,
                selected_text=None  # Assistants don't have selected text
            )

            db.add(assistant_message)
            await db.flush()  # Get message ID before creating citations

            # Create citations from passages
            for passage in passages:
                citation = Citation(
                    message_id=assistant_message.id,
                    chapter_title=passage.chapter_title,
                    section_title=passage.section_title,
                    url_fragment=passage.source_url,  # Store full URL
                    passage_text=passage.passage_text[:500],  # Truncate to 500 chars
                    similarity_score=passage.similarity_score,
                    qdrant_point_id=passage.id  # Store Qdrant point ID for reference
                )
                db.add(citation)

            await db.commit()
            await db.refresh(assistant_message)

            logger.info(
                f"Saved assistant message: id={assistant_message.id}, "
                f"citations={len(passages)}, session={session_id}"
            )

            return assistant_message

        except Exception as e:
            logger.error(f"Failed to save assistant message: {e}", exc_info=True)
            await db.rollback()
            raise

    async def get_conversation_messages(
        self,
        db: AsyncSession,
        session_id: UUID,
        limit: int = 50
    ) -> List[Message]:
        """
        Get conversation messages for a session with citations.

        Args:
            db: Database session
            session_id: Session UUID
            limit: Maximum messages to retrieve (default 50)

        Returns:
            List of Message objects ordered by creation time (newest first)
        """
        try:
            stmt = (
                select(Message)
                .where(Message.session_id == session_id)
                .options(selectinload(Message.citations))
                .order_by(Message.created_at.desc())
                .limit(limit)
            )

            result = await db.execute(stmt)
            messages = result.scalars().all()

            logger.debug(
                f"Retrieved {len(messages)} messages for session {session_id}"
            )

            return list(messages)

        except Exception as e:
            logger.error(f"Failed to get conversation messages: {e}")
            return []

    async def get_message_by_id(
        self,
        db: AsyncSession,
        message_id: UUID
    ) -> Optional[Message]:
        """
        Get a specific message by its ID.

        Args:
            db: Database session
            message_id: Message UUID

        Returns:
            Message object if found, None otherwise
        """
        try:
            stmt = (
                select(Message)
                .where(Message.id == message_id)
                .options(selectinload(Message.citations))
            )

            result = await db.execute(stmt)
            message = result.scalar_one_or_none()

            return message

        except Exception as e:
            logger.error(f"Failed to get message {message_id}: {e}")
            return None

    async def get_session_message_count(
        self,
        db: AsyncSession,
        session_id: UUID
    ) -> int:
        """
        Get total message count for a session.

        Args:
            db: Database session
            session_id: Session UUID

        Returns:
            Total number of messages in the session
        """
        try:
            stmt = select(Message).where(Message.session_id == session_id)
            result = await db.execute(stmt)
            messages = result.scalars().all()

            return len(messages)

        except Exception as e:
            logger.error(f"Failed to count messages for session {session_id}: {e}")
            return 0
