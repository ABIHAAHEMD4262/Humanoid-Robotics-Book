<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 (Initial Constitution)
Constitution Type: NEW - RAG Chatbot for AI-Native Book

Modified Principles:
- All principles are NEW (initial creation)

Added Sections:
- Core Principles (6 principles specific to RAG chatbot)
- Data & Knowledge Integrity
- Quality Assurance & Validation
- Governance

Removed Sections:
- None (initial creation)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section will use these principles
✅ spec-template.md - Functional requirements will align with RAG accuracy standards
✅ tasks-template.md - Tasks will include citation verification and retrieval validation

Follow-up TODOs:
- None - All placeholders filled
-->

# RAG Chatbot for AI-Native Book Constitution

## Core Principles

### I. Grounded Responses Only (NON-NEGOTIABLE)

**Rule**: Every answer MUST be derived exclusively from retrieved book content. The system SHALL NOT generate information beyond what is explicitly present in the knowledge sources.

**Rationale**: Hallucination in educational contexts damages trust and spreads misinformation. A chatbot for learning materials must maintain perfect fidelity to source material.

**Enforcement**:
- All responses must reference specific retrieved passages
- Implement hallucination detection in validation layer
- Reject queries where confidence score falls below retrieval threshold
- Log all "information not available" responses for analysis

### II. Retrieval Priority Hierarchy

**Rule**: Context sources MUST be prioritized in strict order:
1. User-selected text (highest priority)
2. Top-k vector search passages from Qdrant
3. Metadata context from Neon Postgres

**Rationale**: User-selected text represents explicit intent and focus. Respecting this hierarchy ensures the system answers what users actually care about, not what the retrieval algorithm favors.

**Implementation Requirements**:
- User-selected text overrides vector similarity scores
- Selected text must be embedded and boosted in retrieval pipeline
- Metadata used only for disambiguation, not primary answers

### III. Mandatory Source Citation

**Rule**: Every response MUST include citations identifying:
- Which chapter/section the information came from
- Direct quote or paraphrase indicator
- Page/paragraph reference where applicable

**Rationale**: Citations enable verification, build trust, and encourage users to explore primary sources. Educational applications require transparency about information provenance.

**Format Standard**:
```
[Answer text]

Source: [Chapter X, Section Y: "direct quote" or Summary of paragraph Z]
```

### IV. Verifiability & Accuracy

**Rule**: System responses MUST be verifiable against source material:
- Direct quotes must be exact (character-for-character)
- Paraphrases must preserve original meaning without interpretation
- No assumptions or inferences beyond explicit text

**Rationale**: In educational contexts, precision matters. Misquoting or misrepresenting author intent undermines the learning experience.

**Quality Gates**:
- Automated quote verification against source embeddings
- Semantic similarity checks for paraphrases (threshold: 0.85+)
- Red-flag terms that indicate speculation ("probably", "might", "could be")

### V. Graceful Knowledge Boundaries

**Rule**: When information cannot be found in retrieved context, system MUST respond:
> "The information is not available in the book."

Never attempt to answer from general knowledge, never deflect, never approximate.

**Rationale**: Honest acknowledgment of knowledge gaps is more valuable than plausible-sounding fabrications. Users deserve to know when they need to consult external resources.

**Enhanced Response** (optional):
- Suggest related sections that might contain partial information
- Offer to search with different keywords
- Never suggest the answer "might be" in unstated sections

### VI. Simplicity & Instructional Clarity

**Rule**: Responses MUST use:
- Concise, direct language
- Technical terms only when used in source material
- Plain explanations for general readers
- Active voice and concrete examples

**Rationale**: The target audience is learners, not domain experts. Clear communication amplifies the value of retrieved content.

**Anti-patterns to avoid**:
- Overly formal academic language when source is conversational
- Jargon not present in the book
- Unnecessarily verbose explanations
- Hedging language that reduces clarity

## Data & Knowledge Integrity

### Knowledge Sources

**Primary Source**: Qdrant vector database containing embedded book content
- Chunking strategy: preserve semantic completeness (paragraphs/sections)
- Embedding model: must be consistent across updates
- Version control: track which book version is embedded

**Metadata Source**: Neon Serverless Postgres
- User interaction history
- Chapter/section metadata
- Retrieval analytics for quality improvement

**Ephemeral Context**: User-selected text from Docusaurus UI
- Treated as highest-priority context
- Not persisted beyond session unless user opts in
- Must not pollute vector database

### Data Consistency Requirements

- Book content updates MUST trigger full re-embedding
- Partial updates prohibited (prevents version mismatch)
- Metadata schema migrations must preserve citation integrity
- No manual overrides of retrieved content

### Privacy & User Data

- User queries logged only for system improvement (opt-in)
- No personally identifiable information in vector database
- Selected text context discarded after response generation
- Compliance with educational data privacy standards

## Quality Assurance & Validation

### Response Validation Pipeline

Every response MUST pass these checks before delivery:

1. **Retrieval Verification**: Confirm text exists in vector store
2. **Citation Completeness**: All citations include chapter/section
3. **Hallucination Detection**: Flag responses with unsourced claims
4. **Semantic Accuracy**: Paraphrases match source meaning (0.85+ similarity)
5. **Boundary Respect**: "Not available" responses logged for review

### Testing Requirements

- **Contract Tests**: API responses include required citation fields
- **Integration Tests**: End-to-end query → retrieval → response flow
- **Adversarial Tests**: Queries designed to trigger hallucination
- **Accuracy Benchmarking**: Sample queries with ground-truth answers

### Monitoring & Observability

- Log retrieval confidence scores for all queries
- Track "information not available" response rate
- Monitor average citation count per response
- Alert on citation format violations

## Governance

### Amendment Process

This constitution governs all RAG chatbot development. Amendments require:

1. Documented justification (impact analysis)
2. Stakeholder review (educators, developers, users)
3. Migration plan for existing features
4. Updated validation tests

### Compliance Verification

- All PRs must include constitution compliance checklist
- Automated tests enforce citation requirements
- Quarterly audits of response accuracy against source material
- User feedback loop for accuracy issues

### Complexity Budget

Favor simplicity. Any addition of:
- New retrieval strategies
- Response post-processing
- Metadata enrichment

Must justify why existing approach insufficient.

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
