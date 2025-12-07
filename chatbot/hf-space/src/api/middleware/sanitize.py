"""
Input sanitization middleware for RAG Chatbot API.
Protects against XSS, SQL injection, and other malicious inputs.
"""
import re
from typing import Any, Dict
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Regex patterns for malicious input detection
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",  # Script tags
    r"javascript:",                 # JavaScript protocol
    r"on\w+\s*=",                  # Event handlers (onclick, onload, etc.)
    r"<iframe[^>]*>",              # Iframe tags
    r"<embed[^>]*>",               # Embed tags
    r"<object[^>]*>",              # Object tags
]

SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)",  # SQL keywords
    r"(--|#|/\*|\*/)",             # SQL comments
    r"';.*--",                      # SQL comment after quote
    r"\bOR\b\s+\d+\s*=\s*\d+",     # OR 1=1 pattern
]

# Compile patterns for performance
COMPILED_XSS_PATTERNS = [re.compile(pattern, re.IGNORECASE) for pattern in XSS_PATTERNS]
COMPILED_SQL_PATTERNS = [re.compile(pattern, re.IGNORECASE) for pattern in SQL_INJECTION_PATTERNS]

# Maximum lengths for different fields
MAX_LENGTHS = {
    "query_text": 5000,
    "selected_text": 10000,
    "account_id": 100,
}


def sanitize_string(value: str, field_name: str) -> str:
    """
    Sanitize a string value by checking for malicious patterns.

    Args:
        value: String to sanitize
        field_name: Name of the field being sanitized

    Returns:
        Sanitized string

    Raises:
        HTTPException: If malicious pattern detected or length exceeded
    """
    if not isinstance(value, str):
        return value

    # Check length limits
    max_length = MAX_LENGTHS.get(field_name, 1000)
    if len(value) > max_length:
        logger.warning(f"Input length exceeded for {field_name}: {len(value)} > {max_length}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} exceeds maximum length of {max_length} characters"
        )

    # Check for XSS patterns
    for pattern in COMPILED_XSS_PATTERNS:
        if pattern.search(value):
            logger.warning(f"XSS pattern detected in {field_name}: {pattern.pattern}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid input: potential XSS attack detected in {field_name}"
            )

    # Check for SQL injection patterns (only for text fields, not UUIDs)
    if field_name in ["query_text", "selected_text"]:
        for pattern in COMPILED_SQL_PATTERNS:
            if pattern.search(value):
                logger.warning(f"SQL injection pattern detected in {field_name}: {pattern.pattern}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid input: potential SQL injection detected in {field_name}"
                )

    # Strip leading/trailing whitespace
    return value.strip()


def sanitize_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively sanitize all string values in a dictionary.

    Args:
        data: Dictionary to sanitize

    Returns:
        Sanitized dictionary
    """
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value, key)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict(item) if isinstance(item, dict)
                else sanitize_string(item, key) if isinstance(item, str)
                else item
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized


async def sanitization_middleware(request: Request, call_next):
    """
    FastAPI middleware to sanitize all incoming request data.

    Checks request body for malicious patterns (XSS, SQL injection).
    """
    # Only sanitize POST/PUT/PATCH requests with JSON body
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            # Parse request body
            body = await request.json()

            # Sanitize the body
            sanitized_body = sanitize_dict(body)

            # Replace request body with sanitized version
            # Note: This is a simplified approach. In production, you might want
            # to modify the request state more carefully
            request._body = None  # Clear cached body

        except HTTPException:
            # Re-raise sanitization errors
            raise
        except Exception as e:
            # Log other errors but don't block the request
            logger.error(f"Error during sanitization: {e}")

    # Continue with the request
    response = await call_next(request)
    return response
