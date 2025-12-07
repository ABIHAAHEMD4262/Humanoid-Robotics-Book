# Backend Testing Guide

This guide will help you test the RAG Chatbot backend API.

## Prerequisites

Before testing, you need to set up:

1. **Python 3.11+** installed
2. **Poetry** for dependency management
3. **API Keys**:
   - OpenAI API Key (for embeddings and GPT-4o-mini)
   - Qdrant Cloud account and API key
   - Neon Postgres database URL
   - Redis (optional, for rate limiting)

## Setup Steps

### 1. Install Dependencies

```bash
cd chatbot/backend

# Install Poetry if not already installed
curl -sSL https://install.python-poetry.org | python3 -

# Install project dependencies
poetry install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
# Required variables:
# - OPENAI_API_KEY=sk-...
# - QDRANT_URL=https://...
# - QDRANT_API_KEY=...
# - NEON_DATABASE_URL=postgresql://...
# - REDIS_URL=redis://localhost:6379 (or use Upstash)
```

### 3. Initialize Qdrant Collection

**IMPORTANT**: Before running the API, you must create the Qdrant collection:

```bash
# Run the Qdrant initialization script
poetry run python scripts/init_qdrant.py

# Expected output:
# ✓ Collection 'book_passages' created successfully!
# - Vector size: 1536 dimensions
# - Distance metric: Cosine similarity
```

### 4. (Optional) Initialize Postgres Database

If you want to use Postgres for persistence:

```bash
# Using psql
psql $NEON_DATABASE_URL -f scripts/init_db.sql

# Or using the connection string directly
PGPASSWORD=your_password psql -h your-host -U your-user -d chatbot -f scripts/init_db.sql
```

**Note**: Phase 3 MVP uses in-memory conversation storage, so this step is optional for now.

## Running the Server

### Start the Development Server

```bash
cd chatbot/backend

# Run with Poetry
poetry run python src/main.py

# Or use uvicorn directly
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Verify Server is Running

Open your browser or use curl:

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"rag-chatbot-backend","version":"0.1.0"}

# API root
curl http://localhost:8000/

# API documentation
# Open: http://localhost:8000/api/docs
```

## Testing the API

### Option 1: Interactive API Docs (Recommended)

1. Open http://localhost:8000/api/docs
2. You'll see the Swagger UI with all endpoints
3. Click on `POST /api/query` endpoint
4. Click "Try it out"
5. Enter a test query (see examples below)
6. Click "Execute"

### Option 2: Using curl

```bash
# Test query (requires book passages in Qdrant)
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What is ROS 2?",
    "selected_text": null,
    "session_id": null
  }'
```

### Option 3: Using Python requests

Create a file `test_api.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Test health check
response = requests.get(f"{BASE_URL}/health")
print("Health check:", response.json())

# Test query
query_data = {
    "query_text": "What are the main components of a humanoid robot?",
    "selected_text": None,
    "session_id": None
}

response = requests.post(f"{BASE_URL}/api/query", json=query_data)
print("\nQuery response:")
print(json.dumps(response.json(), indent=2))
```

Run:
```bash
poetry run python test_api.py
```

## Expected Responses

### Success (200)

When relevant passages are found:
```json
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "answer": {
    "id": "answer_abc123",
    "answer_text": "The main components include...",
    "citations": [
      {
        "passage_id": "p_123",
        "chapter_title": "Module 1",
        "section_title": "1.2 Robot Components",
        "source_url": "https://...",
        "relevance_score": 0.87
      }
    ],
    "confidence_score": 0.85,
    "retrieval_method": "vector_search",
    "timestamp": "2025-12-06T10:30:05Z",
    "query_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "retrieved_passages": [...],
  "processing_time_ms": 2450
}
```

### No Relevant Content (200)

When no passages found with similarity ≥0.7:
```json
{
  "query_id": "...",
  "session_id": "...",
  "answer": {
    "answer_text": "The information is not available in the book.",
    "citations": [],
    "confidence_score": 0.0,
    "retrieval_method": "vector_search"
  },
  "retrieved_passages": [],
  "processing_time_ms": 1200
}
```

### Validation Error (400)

When invalid input:
```json
{
  "detail": [
    {
      "loc": ["body", "query_text"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Rate Limit Error (429)

When exceeding 10 queries/minute:
```json
{
  "detail": "Rate limit exceeded. You can make up to 10 queries per minute.",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 42,
  "tokens_remaining": 0,
  "reset_at": "2025-12-06T10:31:00Z"
}
```

## Troubleshooting

### "Collection 'book_passages' not found"

**Problem**: Qdrant collection doesn't exist

**Solution**:
```bash
poetry run python scripts/init_qdrant.py
```

### "No module named 'src'"

**Problem**: Python path not set correctly

**Solution**: Run from project root or use:
```bash
cd chatbot/backend
poetry run python -m src.main
```

### "OpenAI API key not found"

**Problem**: Environment variables not loaded

**Solution**:
- Verify `.env` file exists in `chatbot/backend/`
- Check that `OPENAI_API_KEY` is set
- Restart the server after updating `.env`

### "Connection refused" to Qdrant

**Problem**: Invalid Qdrant URL or API key

**Solution**:
- Verify `QDRANT_URL` is correct (should be `https://...`)
- Check `QDRANT_API_KEY` is valid
- Test connection: `curl -H "api-key: YOUR_KEY" https://your-qdrant-url/collections`

### Empty passages (no results)

**Problem**: No book content embedded in Qdrant yet

**Solution**: You need to embed your book content first. This requires:
1. Parsing your Docusaurus book content
2. Chunking into 500-750 token passages
3. Generating embeddings with OpenAI
4. Uploading to Qdrant

**Quick test without real data**:
- The API will return "The information is not available in the book."
- This is expected behavior when Qdrant collection is empty

## Next Steps

Once the backend is working:

1. **Add sample data** to Qdrant for testing
2. **Run integration tests** with pytest
3. **Test rate limiting** by making 11 queries rapidly
4. **Monitor costs** in OpenAI dashboard
5. **Build the frontend** to interact with the API

## Cost Monitoring

With $5 OpenAI credit and GPT-4o-mini:
- Each query costs ~$0.0005
- You can make ~10,000 test queries
- Monitor usage: https://platform.openai.com/usage

Keep track of:
- Embedding calls: ~$0.00000040 per query
- LLM calls: ~$0.0005 per query
- Total remaining: $5 - (queries × $0.0005)
