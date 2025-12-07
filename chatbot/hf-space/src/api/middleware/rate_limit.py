"""
Rate limiting middleware for FastAPI.
Enforces 10 queries per minute per session using token bucket algorithm.
"""
import logging
from typing import Optional
from uuid import UUID

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

from src.services.rate_limiter import RateLimiter
from src.models.rate_limit import RateLimitError

logger = logging.getLogger(__name__)


def get_session_id_from_request(request: Request) -> Optional[UUID]:
    """
    Extract session ID from request.

    Priority:
    1. Request body (session_id field)
    2. Query parameter (session_id)
    3. Header (X-Session-ID)
    4. Cookie (session_id)

    Returns:
        Session UUID or None if not found
    """
    # Try request body (for POST/PUT/PATCH)
    if hasattr(request.state, "body") and request.state.body:
        session_id = request.state.body.get("session_id")
        if session_id:
            try:
                return UUID(session_id)
            except ValueError:
                pass

    # Try query parameter
    session_id = request.query_params.get("session_id")
    if session_id:
        try:
            return UUID(session_id)
        except ValueError:
            pass

    # Try header
    session_id = request.headers.get("X-Session-ID")
    if session_id:
        try:
            return UUID(session_id)
        except ValueError:
            pass

    # Try cookie
    session_id = request.cookies.get("session_id")
    if session_id:
        try:
            return UUID(session_id)
        except ValueError:
            pass

    return None


async def rate_limit_middleware(request: Request, call_next):
    """
    FastAPI middleware to enforce rate limiting.

    Applies token bucket algorithm:
    - Max 10 tokens per session
    - Refill 1 token per 6 seconds (10 queries/minute)
    - Returns HTTP 429 when rate limit exceeded
    """
    # Skip rate limiting for health check and docs endpoints
    if request.url.path in ["/health", "/api/docs", "/api/redoc", "/openapi.json"]:
        return await call_next(request)

    # Get session ID
    session_id = get_session_id_from_request(request)

    if not session_id:
        # No session ID provided - skip rate limiting for now
        # In production, you might want to rate limit by IP address
        logger.warning(f"No session ID found for rate limiting: {request.url.path}")
        return await call_next(request)

    # Get rate limiter from app state
    if not hasattr(request.app.state, "rate_limiter"):
        logger.error("RateLimiter not initialized in app state")
        return await call_next(request)

    rate_limiter: RateLimiter = request.app.state.rate_limiter

    # Check rate limit
    try:
        rate_limit_response = await rate_limiter.check_rate_limit(session_id)

        if not rate_limit_response.allowed:
            # Rate limit exceeded - return 429
            error = RateLimitError(
                detail="Rate limit exceeded. You can make up to 10 queries per minute.",
                error_code="RATE_LIMIT_EXCEEDED",
                retry_after=rate_limit_response.retry_after or 0,
                tokens_remaining=0,
                reset_at=rate_limit_response.reset_at or rate_limit_response.reset_at,
            )

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=error.model_dump(),
                headers={
                    "Retry-After": str(rate_limit_response.retry_after),
                    "X-RateLimit-Limit": "10",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": rate_limit_response.reset_at.isoformat()
                    if rate_limit_response.reset_at
                    else "",
                },
            )

        # Request allowed - add rate limit headers to response
        response = await call_next(request)

        # Add rate limit info to response headers
        response.headers["X-RateLimit-Limit"] = "10"
        response.headers["X-RateLimit-Remaining"] = str(rate_limit_response.tokens_remaining)
        if rate_limit_response.reset_at:
            response.headers["X-RateLimit-Reset"] = rate_limit_response.reset_at.isoformat()

        return response

    except Exception as e:
        # Log error but don't block the request
        logger.error(f"Rate limiting error: {e}")
        return await call_next(request)
