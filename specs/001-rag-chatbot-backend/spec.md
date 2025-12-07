# Feature Specification: RAG Chatbot for AI-Native Book

**Feature Branch**: `001-rag-chatbot-backend`
**Created**: 2025-12-06
**Status**: Draft
**Input**: User description: "Project: Retrieval-Augmented Generation (RAG) chatbot for AI-Native Book with grounded answers strictly from retrieved book content, never hallucinating information not present in sources, prioritizing accuracy, verifiability, and transparency, respecting user-selected text as highest-priority context"

## Clarifications

### Session 2025-12-06

- Q: Vector Search Top-K Value - The spec mentions "top-k vector search passages" (FR-004) but doesn't specify how many passages to retrieve. → A: 3-5 passages (balanced, industry standard for RAG)
- Q: Session Persistence Mechanism - The spec mentions conversation history persistence (User Story 3, FR-013) but doesn't specify how sessions are identified across browser sessions. → A: Browser localStorage + optional account linking (flexible, best UX)
- Q: Chunk Size for Vector Database - The assumptions mention "appropriate chunking strategy" but don't specify the chunk size for book content stored in Qdrant. → A: 500-750 tokens per chunk (balanced for technical docs, recommended)
- Q: Similarity Threshold for Vector Search - When retrieving passages from Qdrant, what minimum similarity score should be required to consider a passage relevant? → A: 0.7-0.75 cosine similarity (balanced, industry standard, recommended)
- Q: Rate Limiting Strategy - The spec doesn't specify how to handle users who submit excessive queries (potential abuse or accidental loops). → A: 10 queries per minute per session (balanced, recommended)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Question and Get Grounded Answer (Priority: P1)

A reader is studying a specific chapter and wants to ask questions about the content to deepen their understanding. The chatbot should provide accurate answers strictly based on the book content and clearly cite sources.

**Why this priority**: This is the core value proposition - enabling readers to get instant, accurate answers from the book without hallucination. Without this, the chatbot has no utility.

**Independent Test**: Can be fully tested by asking a question about content in the book and verifying that (1) the answer is accurate to the source material, (2) sources are cited, and (3) no information outside the book is included.

**Acceptance Scenarios**:

1. **Given** a reader is viewing a chapter, **When** they ask "What is ROS 2?", **Then** the chatbot retrieves relevant passages from the book, provides a grounded answer, and cites the specific section/paragraph
2. **Given** a reader asks a question, **When** the answer cannot be found in the book content, **Then** the chatbot responds with "The information is not available in the book." without attempting to answer from general knowledge
3. **Given** a reader asks about a technical concept, **When** multiple sections discuss it, **Then** the chatbot synthesizes information from all relevant passages and cites each source
4. **Given** a reader asks a vague question, **When** the chatbot retrieves context, **Then** it provides the most relevant answer possible while acknowledging if the question needs clarification

---

### User Story 2 - Query with User-Selected Text (Priority: P2)

A reader highlights a specific paragraph in the Docusaurus book and asks a follow-up question about that exact text. The chatbot should prioritize the selected text as the primary context.

**Why this priority**: This enhances precision by allowing readers to focus the chatbot on specific passages, reducing ambiguity and improving answer relevance.

**Independent Test**: Can be tested by selecting text in a Docusaurus page, asking a question about it, and verifying that the chatbot prioritizes the selected text over general vector search results.

**Acceptance Scenarios**:

1. **Given** a reader has selected a paragraph about "ROS 2 nodes", **When** they ask "How do these communicate?", **Then** the chatbot uses the selected text as primary context and supplements with related passages if needed
2. **Given** a reader selects text and asks a question, **When** the selected text fully answers the question, **Then** the chatbot answers without retrieving additional passages
3. **Given** a reader selects text and asks a question, **When** the selected text is insufficient, **Then** the chatbot supplements with top-k vector search results from the same chapter first, then other chapters

---

### User Story 3 - Browse Conversation History (Priority: P3)

A reader wants to review their previous questions and answers to reinforce learning or continue a line of inquiry.

**Why this priority**: This supports learning continuity and allows readers to build on previous questions, but the chatbot is still valuable without this feature.

**Independent Test**: Can be tested by asking multiple questions, then retrieving conversation history and verifying all questions and answers are persisted correctly.

**Acceptance Scenarios**:

1. **Given** a reader has asked 5 questions, **When** they view their conversation history, **Then** all questions, answers, and citations are displayed in chronological order
2. **Given** a reader returns after closing the browser, **When** they open the chatbot, **Then** their previous conversation history is loaded from persistent storage
3. **Given** a reader views conversation history, **When** they click on a citation, **Then** they are navigated to the exact section in the book

---

### User Story 4 - Track User Interactions for Analytics (Priority: P4)

System administrators and content authors want to understand which topics readers ask about most frequently to improve the book content and identify gaps.

**Why this priority**: This provides valuable insights for content improvement but is not essential for the reader experience.

**Independent Test**: Can be tested by generating sample queries, then retrieving analytics showing query frequency, topics, and sections referenced.

**Acceptance Scenarios**:

1. **Given** readers have asked 100 questions, **When** an administrator views analytics, **Then** they see the top 10 most queried topics and the chapters they relate to
2. **Given** a reader asks a question that cannot be answered, **When** this happens repeatedly for the same topic, **Then** the analytics flag this as a content gap
3. **Given** user interactions are tracked, **When** personally identifiable information is involved, **Then** only anonymized metadata is stored (question topic, timestamp, chapter, not user identity)

---

### Edge Cases

- What happens when a user asks a question in a language other than English? (The book is in English, so the chatbot should politely indicate it can only answer questions about the English content)
- How does the system handle extremely long questions (>500 words)? (System should truncate or ask for a more concise question)
- What happens when the vector database is temporarily unavailable? (System should return a user-friendly error message indicating the chatbot is temporarily unavailable)
- How does the system handle questions about content that doesn't exist yet (e.g., "coming soon" chapters)? (System should respond that the information is not yet available in the book)
- What happens when a user selects text from outside the book content (e.g., navigation, footer)? (System should validate that selected text is from book content; if not, ignore it and use standard retrieval)
- How does the system handle malicious input (SQL injection, XSS attempts in questions)? (All user input should be sanitized before processing)
- What happens when vector search returns zero results? (System must respond "The information is not available in the book." rather than hallucinating)
- What happens when a user exceeds the rate limit? (System should display a friendly message: "You're asking questions quickly! Please wait [X seconds] before submitting another query.")

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve answers strictly from book content stored in Qdrant vector database using a minimum similarity threshold of 0.7-0.75 cosine similarity
- **FR-002**: System MUST cite the specific section/paragraph from which each answer is derived
- **FR-003**: System MUST respond "The information is not available in the book." when the answer cannot be found in retrieved context
- **FR-004**: System MUST prioritize retrieval in this order: (1) user-selected text, (2) top-k vector search passages (k=3-5), (3) metadata context
- **FR-005**: System MUST store user interactions (questions, answers, timestamps, citations) in Neon Serverless Postgres
- **FR-006**: System MUST support user-selected text from Docusaurus document sections as highest-priority context
- **FR-007**: System MUST NOT generate answers from the AI model's general knowledge when book content is insufficient
- **FR-008**: System MUST preserve the author's original intent without modification or interpretation beyond what is explicitly stated in the source text
- **FR-009**: System MUST use simple, precise language appropriate for general readers
- **FR-010**: System MUST sanitize all user input to prevent injection attacks
- **FR-011**: System MUST keep responses concise and instructional, focusing on direct answers rather than lengthy explanations
- **FR-012**: System MUST handle graceful degradation when external services (Qdrant, Postgres) are unavailable
- **FR-013**: System MUST support retrieval of conversation history for returning users via browser localStorage with optional account linking for cross-device sync
- **FR-014**: System MUST store anonymized analytics data (query topics, timestamps, chapters referenced) without personally identifiable information
- **FR-015**: System MUST enforce rate limiting of 10 queries per minute per session to prevent abuse and accidental loops

### Key Entities

- **Query**: User's question submitted to the chatbot; includes query text, timestamp, selected text (if any), and session identifier
- **RetrievedPassage**: Content chunk from the book retrieved via vector search; includes passage text, chapter/section metadata, similarity score (cosine similarity ≥ 0.7), and source citation reference
- **Answer**: Generated response to a query; includes answer text, list of citation references, confidence score, and retrieval method used (selected text, vector search, or hybrid)
- **Conversation**: Collection of query-answer pairs for a single user session; includes session ID (stored in browser localStorage), timestamp, optional account identifier for cross-device sync, and metadata
- **Citation**: Reference to a specific location in the book; includes chapter title, section title, paragraph identifier, and optionally page number or URL fragment
- **Analytics Event**: Anonymized record of a user interaction; includes query topic (extracted keywords), chapter referenced, timestamp, and whether the query was successfully answered

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of answerable questions receive responses citing specific book sections within 3 seconds
- **SC-002**: Zero instances of hallucinated information not present in the book content (verified through manual spot-checks of 100 random queries)
- **SC-003**: When information is not available, system correctly responds "The information is not available in the book." in 100% of cases
- **SC-004**: User-selected text is prioritized and used as context in 100% of queries where text is selected
- **SC-005**: All answers include at least one citation linking to the source section in the book
- **SC-006**: System maintains 99.5% uptime for query processing (excluding planned maintenance)
- **SC-007**: Conversation history retrieval completes in under 2 seconds for sessions with up to 50 query-answer pairs
- **SC-008**: Analytics correctly identify the top 10 most frequently queried topics with 95% accuracy

## Assumptions

- The book content has already been processed and embedded into the Qdrant vector database with 500-750 token chunks (paragraph-level for technical content)
- Qdrant vector database is hosted and accessible via API
- Neon Serverless Postgres instance is provisioned and accessible
- Docusaurus provides a mechanism to capture user-selected text (via browser selection API or custom UI)
- The chatbot will be embedded within the Docusaurus site (not a standalone application)
- User authentication is handled by the parent application (Docusaurus/hosting platform) if required
- The embedding model used for vector search is consistent between ingestion and query time
- Book content is in English; multilingual support is out of scope for this feature

## Out of Scope

- Implementing the book content ingestion pipeline (assumes content is already in Qdrant)
- Building a standalone chatbot UI (assumes integration with existing Docusaurus site)
- Multilingual support for questions or book content
- Real-time collaborative features (multiple users discussing the same topic)
- Advanced NLP features like sentiment analysis or question intent classification
- Integration with external knowledge bases or APIs beyond the book content
- User authentication and authorization (assumes handled by parent application)
- Fine-tuning custom language models (will use existing LLM APIs)

## Dependencies

- **Qdrant Vector Database**: Cloud-hosted or self-hosted instance for storing and retrieving book content embeddings
- **Neon Serverless Postgres**: For persisting user interactions, conversation history, and analytics
- **LLM API**: Access to a language model API (e.g., OpenAI, Anthropic Claude) for generating grounded answers from retrieved passages
- **Docusaurus Platform**: The book hosting platform where the chatbot will be embedded
- **Embedding Model**: Consistent embedding model for vector search (e.g., OpenAI text-embedding-ada-002 or open-source alternative)
