"""
Validation helper functions for input validation.
"""
import re
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status


def validate_uuid(value: str, field_name: str = "UUID") -> UUID:
    """
    Validate UUID format.

    Args:
        value: String to validate as UUID
        field_name: Name of field for error messages

    Returns:
        UUID object

    Raises:
        HTTPException: If UUID format is invalid
    """
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format. Must be a valid UUID."
        )


def validate_text_length(
    value: str,
    field_name: str,
    min_length: int = 1,
    max_length: int = 5000
) -> str:
    """
    Validate text length is within bounds.

    Args:
        value: Text to validate
        field_name: Name of field for error messages
        min_length: Minimum allowed length
        max_length: Maximum allowed length

    Returns:
        Validated text (stripped of whitespace)

    Raises:
        HTTPException: If length is out of bounds
    """
    # Strip whitespace
    value = value.strip()

    if len(value) < min_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be at least {min_length} characters."
        )

    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must not exceed {max_length} characters."
        )

    return value


def validate_similarity_threshold(value: float) -> float:
    """
    Validate similarity threshold is between 0.7 and 1.0.

    Args:
        value: Similarity threshold to validate

    Returns:
        Validated threshold

    Raises:
        HTTPException: If threshold is out of bounds
    """
    if not 0.7 <= value <= 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Similarity threshold must be between 0.7 and 1.0"
        )
    return value


def validate_top_k(value: int) -> int:
    """
    Validate top_k parameter for vector search.

    Args:
        value: Number of results to return

    Returns:
        Validated top_k

    Raises:
        HTTPException: If value is out of bounds
    """
    if not 1 <= value <= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="top_k must be between 1 and 10"
        )
    return value


def validate_account_id(value: str) -> str:
    """
    Validate account ID format.

    Account IDs should be alphanumeric with optional hyphens/underscores.
    Max length: 100 characters.

    Args:
        value: Account ID to validate

    Returns:
        Validated account ID

    Raises:
        HTTPException: If format is invalid
    """
    # Allow alphanumeric, hyphens, and underscores
    pattern = r"^[a-zA-Z0-9_-]+$"

    if not re.match(pattern, value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account ID must contain only letters, numbers, hyphens, and underscores."
        )

    if len(value) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account ID must not exceed 100 characters."
        )

    return value


def validate_query_text(query_text: str) -> str:
    """
    Validate query text.

    Args:
        query_text: Query text to validate

    Returns:
        Validated and stripped query text

    Raises:
        HTTPException: If validation fails
    """
    return validate_text_length(
        query_text,
        field_name="Query text",
        min_length=1,
        max_length=5000
    )


def validate_selected_text(selected_text: Optional[str]) -> Optional[str]:
    """
    Validate selected text (optional).

    Args:
        selected_text: Selected text to validate

    Returns:
        Validated and stripped text, or None

    Raises:
        HTTPException: If validation fails
    """
    if selected_text is None:
        return None

    return validate_text_length(
        selected_text,
        field_name="Selected text",
        min_length=1,
        max_length=10000
    )
