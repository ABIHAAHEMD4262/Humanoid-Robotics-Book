# Implementation Plan: RAG Chatbot for AI-Native Book

**Branch**: `001-rag-chatbot-backend` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rag-chatbot-backend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Retrieval-Augmented Generation (RAG) chatbot that provides grounded answers strictly from book content stored in a vector database, with mandatory source citations and zero hallucination tolerance. The chatbot will be embedded in the Docusaurus site, retrieve 3-5 passages per query using 0.7-0.75 cosine similarity threshold, and prioritize user-selected text over vector search. Session history persists via browser localStorage with optional account linking for cross-device sync. Rate limiting enforces 10 queries/minute per session.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend integration), Python 3.11+ (backend API)
**Primary Dependencies**:
- Frontend: React 18+ (Docusaurus), Qdrant Client SDK, Browser localStorage API
- Backend: FastAPI, LangChain, Qdrant Python Client, Neon Serverless Postgres SDK, Pydantic
**Storage**:
- Vector: Qdrant Cloud (book embeddings, 500-750 token chunks)
- Relational: Neon Serverless Postgres (conversation history, analytics)
- Session: Browser localStorage (primary), Postgres (optional account sync)
**Testing**: pytest (backend), Jest + React Testing Library (frontend), contract tests via OpenAPI
**Target Platform**: Web (Docusaurus embedded chatbot widget), deployed to Vercel/Netlify/GitHub Pages
**Project Type**: Web application (TypeScript frontend + Python backend API)
**Performance Goals**:
- 95% of queries answered within 3 seconds (p95 latency < 3000ms)
- Vector search retrieval < 500ms
- LLM response generation < 2000ms
- Conversation history load < 2000ms for 50 query-answer pairs
**Constraints**:
- Zero hallucination tolerance (must respond "The information is not available in the book." when content insufficient)
- All answers MUST include ≥1 citation to source book section
- 99.5% uptime for query processing (excluding maintenance)
- Rate limit: 10 queries/minute/session
**Scale/Scope**:
- Initial: Single book (~200 pages, ~50 chapters)
- Users: Concurrent readers (estimated 100-500 during peak)
- Queries: ~1000-5000/day expected
- Vector DB: ~2000-4000 chunks (500-750 tokens each)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle: Utility
- ✅ **Pass**: The chatbot provides practical, actionable guidance by answering reader questions with cited book content, directly supporting learning.

### Principle: Clarity
- ✅ **Pass**: FR-009 requires "simple, precise language appropriate for general readers." Answer format includes clear citations.

### Principle: Maintainability
- ✅ **Pass**: Well-organized structure with backend API (Python/FastAPI) and frontend widget (TypeScript/React), following standard patterns. Vector DB and Postgres provide clear separation of concerns.

### Principle: Reproducibility
- ✅ **Pass**: All technical decisions (chunk size: 500-750 tokens, k=3-5, threshold ≥0.7, rate limit: 10/min) are explicitly documented. Backend API contracts and data models will be captured in Phase 1.

### Standards Compliance
- ✅ **Content in MDX, Docusaurus 3+**: Chatbot embeds within existing Docusaurus site
- ✅ **Tool Integration**: Generated answers compatible with Docusaurus display (Markdown citations rendered as links)
- ✅ **Code Quality**: Backend will use Pydantic for validation, frontend will use TypeScript strict mode
- ✅ **Accessibility**: WCAG 2.1 AA compliance for chatbot UI (keyboard navigation, ARIA labels, screen reader support)

### Constraints Compliance
- ✅ **Technology Stack**: Uses Docusaurus (existing), Qdrant (vector DB), Neon Postgres (storage), LLM API (OpenAI/Anthropic)
- ✅ **GitHub Repository**: Existing repo at `Humanoid_Robotics_Book`

### Success Criteria Alignment
- ✅ **Deployed to GitHub Pages**: Chatbot will deploy alongside existing Docusaurus site
- ✅ **Code blocks functional**: All API contracts and examples will be tested

**Result**: ✅ All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-rag-chatbot-backend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command) - Technology research
├── data-model.md        # Phase 1 output (/sp.plan command) - Entity schemas
├── quickstart.md        # Phase 1 output (/sp.plan command) - Developer quickstart
├── contracts/           # Phase 1 output (/sp.plan command) - API contracts
│   ├── openapi.yaml     # REST API specification
│   └── schemas/         # Pydantic/TypeScript shared schemas
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
chatbot/
├── backend/
│   ├── src/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── models/
│   │   │   ├── query.py            # Query entity
│   │   │   ├── passage.py          # RetrievedPassage entity
│   │   │   ├── answer.py           # Answer entity
│   │   │   ├── conversation.py     # Conversation entity
│   │   │   ├── citation.py         # Citation entity
│   │   │   └── analytics.py        # AnalyticsEvent entity
│   │   ├── services/
│   │   │   ├── retrieval.py        # Vector search service (Qdrant)
│   │   │   ├── llm.py              # LLM answer generation service
│   │   │   ├── citation.py         # Citation extraction service
│   │   │   ├── conversation.py     # Conversation persistence service
│   │   │   └── analytics.py        # Analytics tracking service
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── query.py        # POST /api/query (main endpoint)
│   │   │   │   ├── conversation.py # GET /api/conversations/{id}
│   │   │   │   └── analytics.py    # GET /api/analytics (admin)
│   │   │   └── middleware/
│   │   │       ├── rate_limit.py   # 10 queries/min enforcement
│   │   │       └── sanitize.py     # Input sanitization (FR-010)
│   │   └── utils/
│   │       ├── config.py           # Environment configuration
│   │       └── validators.py       # Input validation helpers
│   ├── tests/
│   │   ├── contract/               # API contract tests (OpenAPI validation)
│   │   ├── integration/            # Qdrant + Postgres integration tests
│   │   └── unit/                   # Service unit tests
│   ├── pyproject.toml              # Python dependencies (Poetry)
│   └── .env.example                # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatWidget.tsx      # Main chatbot UI component
    │   │   ├── MessageList.tsx     # Query-answer display
    │   │   ├── QueryInput.tsx      # Question input with text selection
    │   │   ├── Citation.tsx        # Citation link component
    │   │   └── ConversationHistory.tsx  # History panel
    │   ├── services/
    │   │   ├── api.ts              # Backend API client
    │   │   ├── localStorage.ts     # Session persistence
    │   │   └── textSelection.ts    # User text selection capture
    │   ├── hooks/
    │   │   ├── useQuery.ts         # Query submission hook
    │   │   ├── useConversation.ts  # Conversation state hook
    │   │   └── useRateLimit.ts     # Client-side rate limit tracking
    │   └── types/
    │       └── api.ts              # TypeScript types from OpenAPI schema
    ├── tests/
    │   ├── components/             # React component tests
    │   └── services/               # Service unit tests
    └── package.json                # npm dependencies
```

**Structure Decision**: Web application with TypeScript frontend (Docusaurus plugin) and Python backend (FastAPI). Frontend integrates as a Docusaurus theme component or plugin. Backend deploys separately as serverless API (Vercel/AWS Lambda/Google Cloud Functions). This separation allows independent scaling (backend can handle bursts, frontend is static) and follows Docusaurus plugin best practices.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - All gates passed. No complexity violations to justify.

---

## Phase 0: Research & Technology Decisions

**Status**: Pending execution
**Output**: `research.md`

### Research Tasks

1. **LLM API Selection** (NEEDS CLARIFICATION resolved)
   - Decision: OpenAI GPT-4 Turbo vs Anthropic Claude 3.5 Sonnet
   - Rationale: Need to evaluate cost/token, latency, and grounding capability
   - Research: Compare hallucination rates for RAG tasks, API latency, pricing

2. **Embedding Model** (NEEDS CLARIFICATION resolved)
   - Decision: OpenAI text-embedding-3-small vs text-embedding-ada-002 vs open-source (e.g., sentence-transformers)
   - Rationale: Must be consistent with ingestion model (per assumptions)
   - Research: Embedding quality for technical documentation, cost, inference speed

3. **Qdrant Deployment** (NEEDS CLARIFICATION resolved)
   - Decision: Qdrant Cloud vs self-hosted (Docker/Kubernetes)
   - Rationale: Cloud offers managed scaling, self-hosted offers cost control
   - Research: Qdrant Cloud pricing tiers, self-hosted operational overhead, latency comparison

4. **Backend Deployment** (NEEDS CLARIFICATION resolved)
   - Decision: Vercel Serverless vs AWS Lambda + API Gateway vs Google Cloud Functions
   - Rationale: Need serverless for auto-scaling + cost efficiency
   - Research: Cold start times, concurrent execution limits, pricing, integration with Neon Postgres

5. **Rate Limiting Implementation** (NEEDS CLARIFICATION resolved)
   - Decision: In-memory (Redis) vs token bucket in Postgres vs client-side + server validation
   - Rationale: 10 queries/min/session requires session-aware tracking
   - Research: Best practices for session-based rate limiting, Redis vs Postgres trade-offs

6. **Text Selection Capture** (NEEDS CLARIFICATION resolved)
   - Decision: Browser Selection API vs custom range tracking
   - Rationale: Must capture user-highlighted text from Docusaurus content
   - Research: Browser Selection API compatibility, handling across mobile/desktop, edge cases

### Expected Research Outcomes

- **LLM API**: Recommended choice with cost/latency/quality justification
- **Embedding Model**: Selected model with consistency note (must match ingestion)
- **Qdrant Deployment**: Cloud vs self-hosted decision with operational impact
- **Backend Deployment**: Serverless platform choice with scaling characteristics
- **Rate Limiting**: Implementation pattern with session persistence strategy
- **Text Selection**: Browser API approach with cross-platform compatibility notes

---

## Phase 1: Data Model & API Contracts

**Status**: Pending (awaits Phase 0 research.md)
**Output**: `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

### Data Model (Entities)

**Source**: Extracted from spec.md Key Entities section

1. **Query**
   - Fields: `id` (UUID), `query_text` (string), `timestamp` (datetime), `selected_text` (string, optional), `session_id` (string)
   - Validation: `query_text` max 500 words (FR edge case), sanitized input (FR-010)
   - Relationships: Many-to-one with Conversation

2. **RetrievedPassage**
   - Fields: `id` (UUID), `passage_text` (string), `chapter_title` (string), `section_title` (string), `similarity_score` (float), `source_url` (string)
   - Validation: `similarity_score` ≥ 0.7 (FR-001)
   - Relationships: Many-to-many with Answer (via citations)

3. **Answer**
   - Fields: `id` (UUID), `answer_text` (string), `citations` (list[Citation]), `confidence_score` (float), `retrieval_method` (enum: selected_text | vector_search | hybrid), `timestamp` (datetime)
   - Validation: `citations` length ≥ 1 (FR-002, SC-005)
   - Relationships: Many-to-one with Conversation, many-to-many with RetrievedPassage

4. **Conversation**
   - Fields: `id` (UUID, also session_id), `query_answer_pairs` (list[tuple[Query, Answer]]), `created_at` (datetime), `updated_at` (datetime), `account_id` (string, optional for cross-device sync)
   - Validation: Max 50 pairs for SC-007 performance target
   - Storage: Browser localStorage (primary), Neon Postgres (optional sync)

5. **Citation**
   - Fields: `chapter_title` (string), `section_title` (string), `paragraph_id` (string), `page_number` (int, optional), `url_fragment` (string)
   - Validation: At least one of `paragraph_id`, `page_number`, or `url_fragment` must be present
   - Relationships: Embedded within Answer

6. **AnalyticsEvent**
   - Fields: `id` (UUID), `query_topic` (list[string], extracted keywords), `chapter_referenced` (string), `timestamp` (datetime), `answered` (boolean)
   - Validation: No PII (FR-014), anonymized session tracking
   - Storage: Neon Postgres (analytics table)

### API Contracts

**Source**: Derived from functional requirements (FR-001 to FR-015) and user stories

#### Endpoint 1: POST /api/query

**Purpose**: Submit question and get grounded answer with citations

**Request**:
```json
{
  "query_text": "What is ROS 2?",
  "selected_text": "ROS 2 is a robot operating system...",  // optional
  "session_id": "uuid-v4"
}
```

**Response** (200 OK):
```json
{
  "answer_text": "ROS 2 is a robot operating system designed for...",
  "citations": [
    {
      "chapter_title": "Module 1: ROS 2 Basics",
      "section_title": "1.1 Introduction",
      "url_fragment": "#introduction",
      "paragraph_id": "para-003"
    }
  ],
  "retrieved_passages": [
    {
      "passage_text": "...",
      "similarity_score": 0.85,
      "chapter_title": "Module 1: ROS 2 Basics"
    }
  ],
  "retrieval_method": "hybrid",
  "timestamp": "2025-12-06T10:30:00Z"
}
```

**Response** (200 OK, not found):
```json
{
  "answer_text": "The information is not available in the book.",
  "citations": [],
  "retrieved_passages": [],
  "retrieval_method": "vector_search",
  "timestamp": "2025-12-06T10:30:00Z"
}
```

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "message": "You're asking questions quickly! Please wait 45 seconds before submitting another query.",
  "retry_after": 45
}
```

**Acceptance Criteria** (from User Story 1):
- Retrieves 3-5 passages with similarity ≥ 0.7 (FR-001, FR-004)
- If `selected_text` provided, prioritizes it over vector search (FR-004, FR-006)
- Returns "not available" message when no relevant passages found (FR-003, SC-003)
- Includes ≥1 citation when answer provided (FR-002, SC-005)
- Response time p95 < 3 seconds (SC-001)

#### Endpoint 2: GET /api/conversations/{session_id}

**Purpose**: Retrieve conversation history for session

**Response** (200 OK):
```json
{
  "session_id": "uuid-v4",
  "created_at": "2025-12-06T09:00:00Z",
  "updated_at": "2025-12-06T10:30:00Z",
  "query_answer_pairs": [
    {
      "query": {
        "query_text": "What is ROS 2?",
        "timestamp": "2025-12-06T09:15:00Z"
      },
      "answer": {
        "answer_text": "...",
        "citations": [...],
        "timestamp": "2025-12-06T09:15:02Z"
      }
    }
  ],
  "account_id": null  // or uuid if synced
}
```

**Acceptance Criteria** (from User Story 3):
- Returns all query-answer pairs in chronological order (SC acceptance scenario 1)
- Response time < 2 seconds for ≤50 pairs (SC-007)
- Loads from localStorage (client) or Postgres (if account linked) (FR-013)

#### Endpoint 3: GET /api/analytics (Admin)

**Purpose**: Retrieve aggregated analytics for content improvement

**Response** (200 OK):
```json
{
  "top_topics": [
    {"topic": "ROS 2 nodes", "query_count": 245},
    {"topic": "URDF modeling", "query_count": 189}
  ],
  "unanswered_queries": [
    {"topic": "real-time control", "count": 42, "chapters_searched": ["Module 3", "Module 4"]}
  ],
  "total_queries": 1547,
  "period": "2025-12-01 to 2025-12-06"
}
```

**Acceptance Criteria** (from User Story 4):
- Returns top 10 most queried topics with chapter references (SC-008)
- Flags content gaps (unanswered queries by topic) (acceptance scenario 2)
- No PII in analytics data (FR-014, acceptance scenario 3)

### Quickstart Guide

**Purpose**: Enable developers to set up local development environment

**Contents**:
1. Prerequisites (Python 3.11+, Node 18+, Qdrant local instance, Postgres)
2. Environment setup (`.env` file with API keys, database URLs)
3. Backend startup (Poetry install, FastAPI dev server)
4. Frontend startup (npm install, Docusaurus dev server with plugin)
5. Test query walkthrough (example cURL/Postman request)
6. Architecture diagram (frontend → backend API → Qdrant/Postgres/LLM)

---

## Phase 2: Task Breakdown

**Status**: Not started (requires `/sp.tasks` command after Phase 1 complete)
**Output**: `tasks.md` (NOT generated by `/sp.plan`)

**Note**: After Phase 1 artifacts (data-model.md, contracts/, quickstart.md) are created, run `/sp.tasks` to generate the detailed task breakdown with red-green-refactor cycles.

---

## Next Steps

1. **Execute Phase 0**: Generate `research.md` by researching the 6 NEEDS CLARIFICATION items
2. **Execute Phase 1**: Create `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
3. **Update Agent Context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
4. **Re-validate Constitution Check**: Ensure Phase 1 design maintains compliance
5. **Generate Tasks**: Run `/sp.tasks` to create task breakdown from plan

**Estimated Timeline** (for planning reference only, not commitments):
- Phase 0 Research: 2-4 hours
- Phase 1 Design: 4-6 hours
- Phase 2 Tasks Generation: 1-2 hours
- Total Planning: ~8-12 hours before implementation begins
