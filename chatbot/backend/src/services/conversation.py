"""
Conversation persistence service.
Manages conversation history in Neon Serverless Postgres.
"""
import logging
from typing import Optional
from uuid import UUID

from src.models.conversation import Conversation, QueryAnswerPair
from src.models.query import Query
from src.models.answer import Answer

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Service for managing conversation persistence.

    In-memory implementation for Phase 3 MVP.
    TODO: Implement Postgres persistence in later phase.
    """

    def __init__(self):
        """Initialize conversation service with in-memory storage"""
        self._conversations: dict[UUID, Conversation] = {}
        logger.info("Initialized ConversationService (in-memory)")

    async def get_or_create_conversation(
        self,
        session_id: UUID,
        account_id: Optional[str] = None
    ) -> Conversation:
        """
        Get existing conversation or create new one.

        Args:
            session_id: Session UUID
            account_id: Optional account ID for cross-device sync

        Returns:
            Conversation object
        """
        if session_id in self._conversations:
            logger.debug(f"Retrieved existing conversation: {session_id}")
            return self._conversations[session_id]

        # Create new conversation
        conversation = Conversation(
            id=session_id,
            account_id=account_id,
            query_answer_pairs=[]
        )

        self._conversations[session_id] = conversation

        logger.info(f"Created new conversation: {session_id}")

        return conversation

    async def save_query_answer_pair(
        self,
        session_id: UUID,
        query: Query,
        answer: Optional[Answer] = None
    ) -> Conversation:
        """
        Save query-answer pair to conversation.

        Args:
            session_id: Session UUID
            query: User query
            answer: Generated answer (None if query failed)

        Returns:
            Updated conversation

        Raises:
            ValueError: If conversation has reached max 50 pairs
        """
        try:
            # Get or create conversation
            conversation = await self.get_or_create_conversation(session_id)

            # Add query-answer pair
            conversation.add_pair(query, answer)

            # Save updated conversation
            self._conversations[session_id] = conversation

            logger.info(
                f"Saved query-answer pair to conversation {session_id}: "
                f"total pairs = {conversation.get_total_pairs()}"
            )

            return conversation

        except ValueError as e:
            logger.error(f"Failed to save pair: {e}")
            raise

    async def get_conversation(self, session_id: UUID) -> Optional[Conversation]:
        """
        Get conversation by session ID.

        Args:
            session_id: Session UUID

        Returns:
            Conversation or None if not found
        """
        conversation = self._conversations.get(session_id)

        if conversation:
            logger.debug(f"Retrieved conversation {session_id}: {conversation.get_total_pairs()} pairs")
        else:
            logger.debug(f"Conversation {session_id} not found")

        return conversation

    async def delete_conversation(self, session_id: UUID) -> bool:
        """
        Delete conversation by session ID.

        Args:
            session_id: Session UUID

        Returns:
            True if deleted, False if not found
        """
        if session_id in self._conversations:
            del self._conversations[session_id]
            logger.info(f"Deleted conversation: {session_id}")
            return True

        logger.warning(f"Conversation not found for deletion: {session_id}")
        return False

    async def get_total_pairs(self, session_id: UUID) -> int:
        """
        Get total query-answer pairs in conversation.

        Args:
            session_id: Session UUID

        Returns:
            Number of pairs (0 if conversation not found)
        """
        conversation = await self.get_conversation(session_id)
        if not conversation:
            return 0

        return conversation.get_total_pairs()

    async def get_remaining_capacity(self, session_id: UUID) -> int:
        """
        Get remaining capacity before hitting 50 pair limit.

        Args:
            session_id: Session UUID

        Returns:
            Remaining pairs (50 if conversation not found)
        """
        total = await self.get_total_pairs(session_id)
        return 50 - total
