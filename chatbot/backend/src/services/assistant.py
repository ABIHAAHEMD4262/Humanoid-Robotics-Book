"""
OpenAI Assistants API service for stateful conversation management.
Replaces the basic chat completions API with thread-based persistence.
"""
import logging
from typing import List, Optional
from uuid import UUID

from openai import AsyncOpenAI
from openai.types.beta.threads import Run
from openai.types.beta.assistant import Assistant

from src.models.passage import RetrievedPassage
from src.utils.config import settings

logger = logging.getLogger(__name__)


class AssistantService:
    """
    Service for OpenAI Assistants API integration.

    Uses OpenAI Assistants API for:
    - Stateful conversation management (threads)
    - Built-in conversation memory
    - Function calling capabilities
    - Persistent thread storage

    This replaces the basic chat.completions.create() approach.
    """

    def __init__(self, api_key: str | None = None):
        """
        Initialize OpenAI Assistants API client.

        Args:
            api_key: OpenAI API key (defaults to settings.openai_api_key)
        """
        self.client = AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        self.model = settings.openai_model
        self.assistant_id: Optional[str] = None
        logger.info(f"Initialized AssistantService with model: {self.model}")

    def _build_system_instructions(self) -> str:
        """
        Build system instructions for the assistant.

        Critical instructions for zero-hallucination RAG:
        - Answer ONLY from provided context
        - Never use general knowledge
        - Respond "not available" when uncertain
        - Always cite sources
        """
        return """You are an AI assistant helping readers understand a book about Physical AI and Humanoid Robotics.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

1. **Answer ONLY from the provided context**
   - DO NOT use any general knowledge or information outside the provided passages
   - DO NOT make assumptions or inferences beyond what's explicitly stated
   - If the answer is not clearly stated in the context, you MUST respond: "The information is not available in the book."

2. **Zero Hallucination Tolerance**
   - Every fact in your answer MUST come directly from the provided context
   - Never fabricate details, examples, or explanations
   - When uncertain, always respond "not available"

3. **Citation Requirements**
   - Synthesize information from multiple passages when applicable
   - Keep answers concise (2-4 sentences maximum)
   - Use simple, clear language

4. **Response Format**
   - Provide a direct answer to the question
   - DO NOT include citation references in the answer text (citations are handled separately)
   - DO NOT say "According to the passage" or "The text states" - just answer directly

5. **When to Say "Not Available"**
   - Question asks about content not in the passages
   - Passages don't contain enough detail to answer
   - Information is ambiguous or contradictory

6. **User-Selected Text Priority**
   - When the user has selected text from the book, treat it as the PRIMARY context
   - The selected text is what the user wants explained
   - Supplement with additional passages only if needed for clarity

Remember: It's better to say "not available" than to risk including any information not explicitly stated in the provided context."""

    async def create_assistant(self) -> Assistant:
        """
        Create an OpenAI Assistant for the chatbot.

        This should be called once at app startup to create the assistant.
        The assistant ID is then stored and reused for all conversations.

        Returns:
            Assistant: The created OpenAI Assistant

        Raises:
            Exception: If assistant creation fails
        """
        try:
            logger.info("Creating OpenAI Assistant")

            assistant = await self.client.beta.assistants.create(
                name="Humanoid Robotics Expert",
                instructions=self._build_system_instructions(),
                model=self.model,
                tools=[],  # No built-in tools needed, we handle RAG manually
            )

            self.assistant_id = assistant.id
            logger.info(f"Created assistant with ID: {self.assistant_id}")

            return assistant

        except Exception as e:
            logger.error(f"Failed to create assistant: {e}")
            raise

    async def get_or_create_assistant(self) -> str:
        """
        Get existing assistant ID or create a new one.

        Returns:
            str: Assistant ID

        Raises:
            Exception: If assistant creation fails
        """
        if self.assistant_id:
            return self.assistant_id

        assistant = await self.create_assistant()
        return assistant.id

    async def create_thread(self) -> str:
        """
        Create a new conversation thread.

        Returns:
            str: Thread ID for the created thread

        Raises:
            Exception: If thread creation fails
        """
        try:
            thread = await self.client.beta.threads.create()
            logger.info(f"Created new thread: {thread.id}")
            return thread.id

        except Exception as e:
            logger.error(f"Failed to create thread: {e}")
            raise

    def _build_user_message(
        self,
        query: str,
        passages: List[RetrievedPassage],
        selected_text: Optional[str] = None
    ) -> str:
        """
        Build user message with context from retrieved passages.

        Args:
            query: User's question
            passages: Retrieved passages from vector search
            selected_text: User-selected text (highest priority context)

        Returns:
            Formatted message with context and query
        """
        # Start with selected text if provided (highest priority)
        context_parts = []

        if selected_text:
            context_parts.append(
                f"**Selected Text from Book** (primary context):\n\n{selected_text}\n"
            )

        # Add retrieved passages as additional context
        if passages:
            passage_texts = []
            for i, passage in enumerate(passages, 1):
                passage_texts.append(
                    f"Passage {i} (from {passage.section_title}):\n{passage.passage_text}"
                )
            context_parts.append(
                "**Additional Context from Book**:\n\n" + "\n\n".join(passage_texts)
            )

        # Combine context
        if context_parts:
            context = "\n\n---\n\n".join(context_parts)
        else:
            context = "(No context available - answer from provided knowledge only)"

        # Build final message
        message = f"""Context from the book:

{context}

---

Question: {query}

Answer (remember: ONLY use information from the context above, or respond "The information is not available in the book."):"""

        return message

    async def answer_query(
        self,
        thread_id: str,
        query: str,
        passages: List[RetrievedPassage],
        selected_text: Optional[str] = None,
        max_retries: int = 3
    ) -> str:
        """
        Generate answer using OpenAI Assistants API.

        Args:
            thread_id: OpenAI thread ID for conversation
            query: User's question
            passages: Retrieved passages from vector search
            selected_text: User-selected text (optional, highest priority)
            max_retries: Maximum polling attempts for run completion

        Returns:
            Generated answer text

        Raises:
            Exception: If answer generation fails
        """
        try:
            # Ensure we have an assistant
            assistant_id = await self.get_or_create_assistant()

            # Build user message with context
            user_message = self._build_user_message(query, passages, selected_text)

            logger.debug(
                f"Generating answer for query: {query[:100]}... "
                f"using {len(passages)} passages" +
                (f" and selected text" if selected_text else "")
            )

            # Add message to thread
            await self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=user_message
            )

            # Run assistant
            run = await self.client.beta.threads.runs.create_and_poll(
                thread_id=thread_id,
                assistant_id=assistant_id,
                poll_interval_ms=1000,  # Poll every 1 second
                timeout=30.0  # 30 second timeout
            )

            # Check run status
            if run.status != "completed":
                logger.error(f"Run failed with status: {run.status}")
                if run.status == "failed":
                    logger.error(f"Run error: {run.last_error}")
                raise Exception(f"Assistant run failed with status: {run.status}")

            # Retrieve messages
            messages = await self.client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=1
            )

            if not messages.data:
                logger.warning("No messages returned from assistant")
                return "The information is not available in the book."

            # Extract answer from latest assistant message
            latest_message = messages.data[0]
            if latest_message.role != "assistant":
                logger.warning(f"Latest message is not from assistant: {latest_message.role}")
                return "The information is not available in the book."

            # Get text content
            answer_text = ""
            for content_block in latest_message.content:
                if content_block.type == "text":
                    answer_text = content_block.text.value
                    break

            if not answer_text:
                logger.warning("Assistant returned empty answer")
                return "The information is not available in the book."

            logger.info(
                f"Generated answer: {len(answer_text)} characters, "
                f"thread={thread_id}, run={run.id}"
            )

            return answer_text.strip()

        except Exception as e:
            logger.error(f"Answer generation failed: {e}", exc_info=True)
            raise

    async def close(self):
        """Close the OpenAI client and cleanup resources."""
        await self.client.close()
        logger.info("AssistantService closed")
