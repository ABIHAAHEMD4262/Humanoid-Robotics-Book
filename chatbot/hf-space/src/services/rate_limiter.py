"""
Rate limiting service using token bucket algorithm.
Hybrid approach: Redis (hot path) + Postgres (cold storage).
"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from src.models.rate_limit import (
    RateLimitState,
    RateLimitResponse,
    get_redis_key,
    RATE_LIMIT_MAX_TOKENS,
    RATE_LIMIT_REFILL_SECONDS,
)

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter with Redis hot path and Postgres cold storage.

    Algorithm:
    1. Check Redis for rate limit state (fast path)
    2. If not in Redis, load from Postgres (cold storage)
    3. Calculate tokens based on time elapsed since last refill
    4. Refill tokens at rate of 1 per 6 seconds
    5. Consume 1 token if available
    6. Update Redis and async update Postgres
    """

    def __init__(self, redis_client: redis.Redis, db_session: AsyncSession):
        self.redis_client = redis_client
        self.db_session = db_session

    async def check_rate_limit(self, session_id: UUID) -> RateLimitResponse:
        """
        Check if request is allowed under rate limit.

        Args:
            session_id: User session UUID

        Returns:
            RateLimitResponse with allowed status and token info
        """
        # Try to get state from Redis (hot path)
        state = await self._get_state_from_redis(session_id)

        # Fallback to Postgres if not in Redis
        if state is None:
            state = await self._get_state_from_postgres(session_id)

        # If no state exists, create new state with full tokens
        if state is None:
            state = RateLimitState(
                session_id=session_id,
                tokens=RATE_LIMIT_MAX_TOKENS,
                last_refill=datetime.utcnow(),
                last_updated=datetime.utcnow(),
            )

        # Refill tokens based on elapsed time
        state = self._refill_tokens(state)

        # Check if request is allowed
        if state.tokens > 0:
            # Consume 1 token
            state.tokens -= 1
            state.last_updated = datetime.utcnow()

            # Update Redis (hot path)
            await self._save_state_to_redis(state)

            # Async update Postgres (don't wait)
            # In production, use background task queue (Celery, RQ)
            # For now, fire and forget
            try:
                await self._save_state_to_postgres(state)
            except Exception as e:
                logger.error(f"Failed to update Postgres: {e}")

            return RateLimitResponse(
                allowed=True,
                tokens_remaining=state.tokens,
                retry_after=None,
                reset_at=self._calculate_reset_time(state),
            )
        else:
            # Rate limit exceeded
            retry_after = self._calculate_retry_after(state)
            return RateLimitResponse(
                allowed=False,
                tokens_remaining=0,
                retry_after=retry_after,
                reset_at=self._calculate_reset_time(state),
            )

    def _refill_tokens(self, state: RateLimitState) -> RateLimitState:
        """
        Refill tokens based on elapsed time since last refill.

        Refill rate: 1 token per 6 seconds (10 tokens per minute)
        """
        now = datetime.utcnow()
        elapsed = (now - state.last_refill).total_seconds()

        # Calculate tokens to refill
        tokens_to_refill = int(elapsed / RATE_LIMIT_REFILL_SECONDS)

        if tokens_to_refill > 0:
            # Refill tokens up to max
            state.tokens = min(state.tokens + tokens_to_refill, RATE_LIMIT_MAX_TOKENS)
            # Update last_refill to account for refilled tokens
            state.last_refill = state.last_refill + timedelta(
                seconds=tokens_to_refill * RATE_LIMIT_REFILL_SECONDS
            )

        return state

    def _calculate_reset_time(self, state: RateLimitState) -> datetime:
        """Calculate when the next token will be available"""
        return state.last_refill + timedelta(seconds=RATE_LIMIT_REFILL_SECONDS)

    def _calculate_retry_after(self, state: RateLimitState) -> int:
        """Calculate seconds until next token is available"""
        reset_time = self._calculate_reset_time(state)
        now = datetime.utcnow()
        retry_after = (reset_time - now).total_seconds()
        return max(0, int(retry_after))

    async def _get_state_from_redis(self, session_id: UUID) -> Optional[RateLimitState]:
        """Get rate limit state from Redis"""
        try:
            key = get_redis_key(session_id)
            data = await self.redis_client.hgetall(key)

            if not data:
                return None

            # Redis returns bytes, decode and parse
            return RateLimitState(
                session_id=session_id,
                tokens=int(data[b"tokens"]),
                last_refill=datetime.fromisoformat(data[b"last_refill"].decode()),
                last_updated=datetime.fromisoformat(data[b"last_updated"].decode()),
            )
        except Exception as e:
            logger.error(f"Redis error: {e}")
            return None

    async def _save_state_to_redis(self, state: RateLimitState) -> None:
        """Save rate limit state to Redis with TTL"""
        try:
            key = get_redis_key(state.session_id)
            await self.redis_client.hset(
                key,
                mapping={
                    "tokens": state.tokens,
                    "last_refill": state.last_refill.isoformat(),
                    "last_updated": state.last_updated.isoformat(),
                },
            )
            # Set TTL to 2 minutes (cleanup inactive sessions)
            await self.redis_client.expire(key, 120)
        except Exception as e:
            logger.error(f"Redis save error: {e}")

    async def _get_state_from_postgres(self, session_id: UUID) -> Optional[RateLimitState]:
        """Get rate limit state from Postgres (cold storage)"""
        try:
            # This assumes you have a RateLimit SQLAlchemy model
            # For now, return None (will be implemented with DB models)
            # TODO: Implement Postgres lookup when DB models are ready
            return None
        except Exception as e:
            logger.error(f"Postgres error: {e}")
            return None

    async def _save_state_to_postgres(self, state: RateLimitState) -> None:
        """Save rate limit state to Postgres (cold storage)"""
        try:
            # TODO: Implement Postgres upsert when DB models are ready
            pass
        except Exception as e:
            logger.error(f"Postgres save error: {e}")
