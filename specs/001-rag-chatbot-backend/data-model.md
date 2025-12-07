# Data Model: RAG Chatbot

**Feature**: RAG Chatbot for AI-Native Book (001-rag-chatbot-backend)
**Date**: 2025-12-06
**Status**: Phase 1 Complete

## Overview

This document defines the data entities, schemas, validation rules, and storage strategies for the RAG chatbot system. All entities are derived from the specification (spec.md Key Entities section) and clarifications.

---

## Entity Schemas

### 1. Query

**Purpose**: Represents a user's question submitted to the chatbot

**Storage**: Neon Serverless Postgres (`queries` table)

**Schema** (Pydantic):

```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID, uuid4

class Query(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    query_text: str = Field(..., min_length=1, max_length=5000)  # ~500 words
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    selected_text: str | None = Field(None, max_length=10000)
    session_id: str = Field(..., min_length=36, max_length=36)  # UUID format

    @validator('query_text')
    def sanitize_input(cls, v):
        """Sanitize input to prevent injection attacks (FR-010)"""
        # Remove SQL/XSS patterns, excessive whitespace
        import re
        v = re.sub(r'<script.*?</script>', '', v, flags=re.IGNORECASE | re.DOTALL)
        v = re.sub(r'[;\'"\\]', '', v)  # Remove SQL injection chars
        v = ' '.join(v.split())  # Normalize whitespace
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "query_text": "What is ROS 2?",
                "selected_text": "ROS 2 is a robot operating system...",
                "session_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
```

**Database Table**:

```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL CHECK (char_length(query_text) <= 5000),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    selected_text TEXT CHECK (char_length(selected_text) <= 10000),
    session_id UUID NOT NULL,
    FOREIGN KEY (session_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_queries_session ON queries(session_id);
CREATE INDEX idx_queries_timestamp ON queries(timestamp DESC);
```

**Validation Rules**:
- `query_text` max 5000 chars (~500 words at 10 chars/word) per edge case
- `selected_text` optional, max 10000 chars (assume ~1-2 paragraphs)
- `session_id` must be valid UUID format
- Input sanitization removes SQL/XSS patterns (FR-010)

**Relationships**:
- Many-to-one with `Conversation` (via `session_id`)

---

### 2. RetrievedPassage

**Purpose**: Content chunk from book retrieved via vector search

**Storage**: Qdrant (vector embeddings), Neon Postgres (metadata + passage text for citations)

**Schema** (Pydantic):

```python
class RetrievedPassage(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    passage_text: str = Field(..., min_length=1, max_length=5000)  # 500-750 tokens ~= 2500-3750 chars
    chapter_title: str = Field(..., min_length=1, max_length=200)
    section_title: str = Field(..., min_length=1, max_length=200)
    similarity_score: float = Field(..., ge=0.7, le=1.0)  # FR-001: threshold ≥ 0.7
    source_url: str = Field(..., regex=r'^https?://.*')  # Docusaurus page URL
    paragraph_id: str | None = Field(None, max_length=100)  # e.g., "para-003"

    @validator('similarity_score')
    def validate_threshold(cls, v):
        """Ensure similarity meets FR-001 threshold"""
        if v < 0.7:
            raise ValueError(f"Similarity score {v} below threshold 0.7 (FR-001)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "passage_text": "ROS 2 is a robot operating system designed for...",
                "chapter_title": "Module 1: ROS 2 Basics",
                "section_title": "1.1 Introduction",
                "similarity_score": 0.85,
                "source_url": "https://example.com/docs/module1-ros2/",
                "paragraph_id": "para-003"
            }
        }
```

**Database Table** (Postgres metadata):

```sql
CREATE TABLE passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_text TEXT NOT NULL CHECK (char_length(passage_text) <= 5000),
    chapter_title VARCHAR(200) NOT NULL,
    section_title VARCHAR(200) NOT NULL,
    source_url TEXT NOT NULL,
    paragraph_id VARCHAR(100),
    embedding_id VARCHAR(100) NOT NULL UNIQUE  -- References Qdrant vector ID
);

CREATE INDEX idx_passages_chapter ON passages(chapter_title);
CREATE INDEX idx_passages_embedding ON passages(embedding_id);
```

**Qdrant Collection**:

```python
# Qdrant collection configuration
{
    "collection_name": "book_passages",
    "vector_size": 1536,  # text-embedding-3-small dimension
    "distance": "Cosine",  # For similarity threshold ≥ 0.7
    "on_disk_payload": True  # Store metadata in Qdrant for filtering
}
```

**Validation Rules**:
- `similarity_score` must be ≥ 0.7 (FR-001 threshold)
- `passage_text` max 5000 chars (500-750 tokens × 5 chars/token upper bound)
- `source_url` must be valid HTTP/HTTPS URL

**Relationships**:
- Many-to-many with `Answer` (via `answer_passages` join table)

---

### 3. Answer

**Purpose**: Generated response to a query with citations

**Storage**: Neon Serverless Postgres (`answers` table)

**Schema** (Pydantic):

```python
from enum import Enum

class RetrievalMethod(str, Enum):
    SELECTED_TEXT = "selected_text"
    VECTOR_SEARCH = "vector_search"
    HYBRID = "hybrid"

class Answer(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    answer_text: str = Field(..., min_length=1, max_length=2000)
    citations: list['Citation'] = Field(..., min_items=0)  # ≥1 if answer not "not available"
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    retrieval_method: RetrievalMethod
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    query_id: UUID

    @validator('citations')
    def validate_citations(cls, v, values):
        """Ensure ≥1 citation when answer provided (FR-002, SC-005)"""
        answer_text = values.get('answer_text', '')
        if answer_text != "The information is not available in the book." and len(v) == 0:
            raise ValueError("Answer must include ≥1 citation when information is provided (FR-002)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "answer_text": "ROS 2 is a robot operating system designed for...",
                "citations": [
                    {
                        "chapter_title": "Module 1: ROS 2 Basics",
                        "section_title": "1.1 Introduction",
                        "url_fragment": "#introduction",
                        "paragraph_id": "para-003"
                    }
                ],
                "confidence_score": 0.85,
                "retrieval_method": "hybrid",
                "query_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
```

**Database Table**:

```sql
CREATE TYPE retrieval_method_enum AS ENUM ('selected_text', 'vector_search', 'hybrid');

CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_text TEXT NOT NULL CHECK (char_length(answer_text) <= 2000),
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    retrieval_method retrieval_method_enum NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    query_id UUID NOT NULL UNIQUE,  -- One answer per query
    FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
);

CREATE TABLE answer_passages (
    answer_id UUID NOT NULL,
    passage_id UUID NOT NULL,
    PRIMARY KEY (answer_id, passage_id),
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
    FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE CASCADE
);

CREATE INDEX idx_answers_query ON answers(query_id);
CREATE INDEX idx_answers_timestamp ON answers(timestamp DESC);
```

**Validation Rules**:
- `citations` length ≥ 1 when answer is not "not available" message (FR-002, SC-005)
- `answer_text` max 2000 chars (keep responses concise, FR-011)
- `confidence_score` 0.0-1.0 range
- One answer per query (enforced by UNIQUE constraint on `query_id`)

**Relationships**:
- One-to-one with `Query` (via `query_id`)
- Many-to-many with `RetrievedPassage` (via `answer_passages` join table)

---

### 4. Citation

**Purpose**: Reference to specific location in book

**Storage**: Embedded within `Answer` (JSON array in Postgres)

**Schema** (Pydantic):

```python
class Citation(BaseModel):
    chapter_title: str = Field(..., min_length=1, max_length=200)
    section_title: str = Field(..., min_length=1, max_length=200)
    paragraph_id: str | None = Field(None, max_length=100)
    page_number: int | None = Field(None, ge=1)
    url_fragment: str | None = Field(None, max_length=200)  # e.g., "#introduction"

    @validator('url_fragment', 'paragraph_id', 'page_number')
    def at_least_one_identifier(cls, v, values, field):
        """Ensure at least one of paragraph_id, page_number, or url_fragment is present"""
        if field.name == 'url_fragment':  # Last field in validator order
            if not any([
                values.get('paragraph_id'),
                values.get('page_number'),
                v
            ]):
                raise ValueError("At least one of paragraph_id, page_number, or url_fragment must be provided")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "chapter_title": "Module 1: ROS 2 Basics",
                "section_title": "1.1 Introduction",
                "url_fragment": "#introduction",
                "paragraph_id": "para-003"
            }
        }
```

**Database Storage** (within `answers` table):

```sql
-- Citations stored as JSONB array in answers table
ALTER TABLE answers ADD COLUMN citations JSONB NOT NULL DEFAULT '[]';

-- Example JSONB structure:
-- [
--   {"chapter_title": "Module 1", "section_title": "1.1 Intro", "url_fragment": "#intro", "paragraph_id": "para-003"},
--   {"chapter_title": "Module 2", "section_title": "2.3 Advanced", "url_fragment": "#advanced", "page_number": 42}
-- ]
```

**Validation Rules**:
- At least one of `paragraph_id`, `page_number`, or `url_fragment` must be present
- `chapter_title` and `section_title` are mandatory
- `url_fragment` must start with `#` if provided

**Relationships**:
- Embedded within `Answer` (not a separate table)

---

### 5. Conversation

**Purpose**: Collection of query-answer pairs for a single user session

**Storage**: Dual storage - browser localStorage (primary), Neon Postgres (optional sync)

**Schema** (Pydantic):

```python
class QueryAnswerPair(BaseModel):
    query: Query
    answer: Answer

class Conversation(BaseModel):
    id: UUID = Field(default_factory=uuid4)  # Also used as session_id
    query_answer_pairs: list[QueryAnswerPair] = Field(default_factory=list, max_items=50)  # SC-007 limit
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    account_id: str | None = Field(None, max_length=100)  # Optional for cross-device sync

    @validator('query_answer_pairs')
    def validate_max_pairs(cls, v):
        """Enforce max 50 pairs for SC-007 performance target"""
        if len(v) > 50:
            raise ValueError(f"Conversation has {len(v)} pairs, exceeds max 50 (SC-007)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2025-12-06T09:00:00Z",
                "updated_at": "2025-12-06T10:30:00Z",
                "account_id": None
            }
        }
```

**Database Table**:

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    account_id VARCHAR(100),  -- Optional, for cross-device sync
    CHECK ((SELECT COUNT(*) FROM queries WHERE session_id = id) <= 50)  -- SC-007 limit
);

CREATE INDEX idx_conversations_account ON conversations(account_id) WHERE account_id IS NOT NULL;
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
```

**localStorage Structure** (TypeScript):

```typescript
interface LocalConversation {
  id: string;  // UUID
  createdAt: string;  // ISO 8601 timestamp
  updatedAt: string;
  queryAnswerPairs: Array<{
    query: { queryText: string; timestamp: string; selectedText?: string };
    answer: { answerText: string; citations: Citation[]; timestamp: string };
  }>;
  accountId?: string;
}

// localStorage key: `chatbot_conversation_${conversationId}`
```

**Validation Rules**:
- Max 50 query-answer pairs per conversation (SC-007 performance target)
- `updated_at` timestamp updates on every new query-answer pair
- `account_id` optional; if present, conversation syncs to Postgres

**Relationships**:
- One-to-many with `Query` (via `session_id` foreign key)
- Query-Answer pairs linked via `query_id` in `answers` table

---

### 6. AnalyticsEvent

**Purpose**: Anonymized record of user interaction for content improvement

**Storage**: Neon Serverless Postgres (`analytics_events` table)

**Schema** (Pydantic):

```python
class AnalyticsEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    query_topic: list[str] = Field(..., min_items=1, max_items=10)  # Extracted keywords
    chapter_referenced: str | None = Field(None, max_length=200)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    answered: bool  # True if answer provided, False if "not available"
    session_id_hash: str = Field(..., min_length=64, max_length=64)  # SHA-256 hash, not raw session_id (FR-014)

    @validator('session_id_hash')
    def validate_anonymization(cls, v):
        """Ensure session_id is hashed, not plain (FR-014 no PII)"""
        import re
        if not re.match(r'^[a-f0-9]{64}$', v):  # SHA-256 hex string
            raise ValueError("session_id_hash must be 64-char hex string (SHA-256)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "query_topic": ["ROS 2", "nodes", "communication"],
                "chapter_referenced": "Module 1: ROS 2 Basics",
                "timestamp": "2025-12-06T10:30:00Z",
                "answered": True,
                "session_id_hash": "abc123..."  # 64-char SHA-256 hash
            }
        }
```

**Database Table**:

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_topic TEXT[] NOT NULL CHECK (array_length(query_topic, 1) BETWEEN 1 AND 10),
    chapter_referenced VARCHAR(200),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    answered BOOLEAN NOT NULL,
    session_id_hash CHAR(64) NOT NULL CHECK (session_id_hash ~ '^[a-f0-9]{64}$')
);

CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_topic ON analytics_events USING GIN(query_topic);
CREATE INDEX idx_analytics_chapter ON analytics_events(chapter_referenced);
CREATE INDEX idx_analytics_answered ON analytics_events(answered);
```

**Validation Rules**:
- `query_topic` array of 1-10 keywords (extracted from query via NLP)
- `session_id_hash` must be SHA-256 hash (64-char hex), never plain session_id (FR-014 no PII)
- `chapter_referenced` nullable (if query unanswered or spans multiple chapters)
- `answered` boolean flag (used to identify content gaps per User Story 4)

**Relationships**:
- No foreign keys (anonymized, decoupled from conversations for privacy)

---

## Storage Strategy

### Primary Storage

| Entity | Storage | Rationale |
|--------|---------|-----------|
| Query | Neon Postgres | Relational queries (by session, timestamp) |
| RetrievedPassage | Qdrant (vectors) + Postgres (metadata) | Vector search in Qdrant, citation metadata in Postgres |
| Answer | Neon Postgres | Relational queries (by query, conversation) |
| Citation | Postgres (JSONB in answers table) | Embedded in Answer, no separate table needed |
| Conversation | localStorage (primary) + Postgres (optional sync) | Fast local access, optional cloud sync |
| AnalyticsEvent | Neon Postgres | Aggregation queries for analytics dashboard |

### Sync Strategy

**localStorage → Postgres**:
- Triggered when user links account (optional)
- Batch sync all query-answer pairs from localStorage to Postgres
- Bidirectional: if user logs in on new device, load from Postgres → localStorage

**Postgres → localStorage**:
- On page load, check if `account_id` exists in localStorage
- If yes, fetch conversation from Postgres and merge with local data
- Use `updated_at` timestamp to resolve conflicts (latest wins)

---

## Rate Limiting Data Model

### Redis Schema

```python
# Key format: rate_limit:{session_id}
# Value: JSON with token bucket state
{
  "tokens": 8,  # Current tokens (0-10)
  "last_refill": "2025-12-06T10:30:00Z",  # Last refill timestamp
  "ttl": 600  # Expire after 10 minutes of inactivity
}
```

### Postgres Schema

```sql
CREATE TABLE rate_limits (
    session_id UUID PRIMARY KEY,
    tokens INT NOT NULL CHECK (tokens BETWEEN 0 AND 10),
    last_refill TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_updated ON rate_limits(last_updated DESC);
```

**Sync**: Redis writes to Postgres every 60 seconds (background job)

---

## Next Steps

1. **Create API Contracts**: Generate `contracts/openapi.yaml` based on data model
2. **Create Quickstart Guide**: Write `quickstart.md` with setup instructions
3. **Update Agent Context**: Add technology stack to agent memory
4. **Validate Constitution Check**: Ensure Phase 1 design maintains compliance
