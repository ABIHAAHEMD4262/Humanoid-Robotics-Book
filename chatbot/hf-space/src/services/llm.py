"""
LLM service for answer generation using OpenAI API.
Generates grounded answers from retrieved passages with strict zero-hallucination prompt.
"""
import logging
from typing import List
from openai import AsyncOpenAI

from src.models.passage import RetrievedPassage
from src.utils.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for LLM-powered answer generation.

    Uses standard OpenAI API with GPT-4o-mini:
    - Model: gpt-4o-mini (cost-effective, good quality)
    - Max tokens: 500 (concise answers)
    - Temperature: 0.1 (deterministic, factual)
    - Strict grounding prompt (zero hallucination)
    - Simple direct API calls (no agent framework)
    """

    def __init__(self, api_key: str | None = None):
        """
        Initialize OpenAI client.

        Args:
            api_key: OpenAI API key (defaults to settings.openai_api_key)
        """
        self.client = AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        self.model = settings.openai_model
        logger.info(f"Initialized LLMService with model: {self.model}")

    def _build_system_prompt(self) -> str:
        """
        Build system prompt for strict grounding.

        Critical instructions:
        - Answer ONLY from provided passages
        - Never use general knowledge
        - Respond "not available" when uncertain
        - Always cite sources
        """
        return """You are an AI assistant helping readers understand a book about Physical AI and Humanoid Robotics.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

1. **Answer ONLY from the provided context passages**
   - DO NOT use any general knowledge or information outside the passages
   - DO NOT make assumptions or inferences beyond what's explicitly stated
   - If the answer is not clearly stated in the passages, you MUST respond: "The information is not available in the book."

2. **Zero Hallucination Tolerance**
   - Every fact in your answer MUST come directly from a provided passage
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

Remember: It's better to say "not available" than to risk including any information not explicitly stated in the passages."""

    def _build_user_prompt(
        self,
        query: str,
        passages: List[RetrievedPassage]
    ) -> str:
        """
        Build user prompt with query and retrieved passages.

        Args:
            query: User's question
            passages: Retrieved passages from vector search

        Returns:
            Formatted prompt with passages and query
        """
        # Format passages
        passage_texts = []
        for i, passage in enumerate(passages, 1):
            passage_texts.append(
                f"Passage {i} (from {passage.section_title}):\n{passage.passage_text}"
            )

        passages_formatted = "\n\n".join(passage_texts)

        # Build complete prompt
        prompt = f"""Here are the relevant passages from the book:

{passages_formatted}

Question: {query}

Answer (remember: ONLY use information from the passages above, or respond "The information is not available in the book."):"""

        return prompt

    async def generate_answer(
        self,
        query: str,
        passages: List[RetrievedPassage],
        max_tokens: int = 500,
        temperature: float = 0.1
    ) -> str:
        """
        Generate grounded answer from passages.

        Args:
            query: User's question
            passages: Retrieved passages from vector search
            max_tokens: Maximum response length (default: 500)
            temperature: Sampling temperature (default: 0.1 for factual)

        Returns:
            Generated answer text

        Raises:
            Exception: If LLM generation fails
        """
        try:
            logger.debug(
                f"Generating answer for query: {query[:100]}... "
                f"using {len(passages)} passages"
            )

            # Build prompts
            system_prompt = self._build_system_prompt()
            user_prompt = self._build_user_prompt(query, passages)

            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )

            # Extract answer
            answer_text = response.choices[0].message.content.strip()

            logger.info(
                f"Generated answer: {len(answer_text)} characters, "
                f"model={self.model}"
            )

            # Validate answer is not empty
            if not answer_text:
                logger.warning("LLM returned empty answer")
                return "The information is not available in the book."

            return answer_text

        except Exception as e:
            logger.error(f"Answer generation failed: {e}")
            raise

    async def close(self):
        """Close the OpenAI client"""
        await self.client.close()
