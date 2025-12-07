# Backend Setup Instructions

Quick guide to get the RAG Chatbot backend running.

## Step-by-Step Setup

### 1. Install Python Dependencies

```bash
cd chatbot/backend

# Install Poetry (if not installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install all dependencies
poetry install
```

### 2. Set Up Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env file with your credentials
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Required Variables:**
```bash
# OpenAI (for embeddings and GPT-4o-mini)
OPENAI_API_KEY=sk-your_openai_key_here

# Qdrant Cloud (vector database)
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon Postgres (optional for Phase 3)
NEON_DATABASE_URL=postgresql://user:password@host/chatbot?sslmode=require

# Redis (optional, defaults to localhost)
REDIS_URL=redis://localhost:6379

# Model Configuration (already set)
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 3. Initialize Qdrant Collection

**CRITICAL STEP**: Create the vector database collection before starting the server.

```bash
poetry run python scripts/init_qdrant.py
```

Expected output:
```
✓ Collection 'book_passages' created successfully!
  - Vector size: 1536 dimensions
  - Distance metric: Cosine similarity
```

### 4. Start the Server

```bash
# Method 1: Using main.py
poetry run python src/main.py

# Method 2: Using uvicorn directly
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server should start at: http://localhost:8000

### 5. Verify Installation

**Option A: Web Browser**
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/api/docs

**Option B: Command Line**
```bash
# Health check
curl http://localhost:8000/health

# Expected: {"status":"healthy","service":"rag-chatbot-backend","version":"0.1.0"}
```

**Option C: Test Script**
```bash
poetry run python test_api.py
```

## What You'll See

### If Everything Works:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

Visit http://localhost:8000/api/docs to see interactive API documentation.

### Common Issues:

**"Module not found: openai"**
```bash
poetry install  # Re-run installation
```

**"OPENAI_API_KEY not found"**
- Check `.env` file exists in `chatbot/backend/`
- Verify the variable is set correctly
- Restart the server after editing `.env`

**"Collection 'book_passages' not found"**
```bash
poetry run python scripts/init_qdrant.py
```

**Server won't start on port 8000**
- Port already in use, change in `src/main.py` or use:
```bash
poetry run uvicorn src.main:app --reload --port 8001
```

## Testing the API

### Simple Test (No Book Data Required)

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What is ROS 2?",
    "selected_text": null,
    "session_id": null
  }'
```

**Expected Response** (since Qdrant is empty):
```json
{
  "query_id": "...",
  "session_id": "...",
  "answer": {
    "answer_text": "The information is not available in the book.",
    "citations": [],
    "confidence_score": 0.0
  }
}
```

This is **correct behavior** - the API is working, but there's no book content in Qdrant yet!

## Next Steps

1. ✅ Backend is running
2. 📚 **Need to add book content** to Qdrant (embedding pipeline required)
3. 🧪 Run test suite: `poetry run python test_api.py`
4. 💰 **Monitor OpenAI costs**: https://platform.openai.com/usage
5. 🎨 Build the frontend to interact with the API

## Cost Tracking

With your $5 OpenAI credit:
- Each test query: ~$0.0005 (GPT-4o-mini)
- Total capacity: ~10,000 queries
- Current usage: Check OpenAI dashboard

**Tip**: Keep the test script output to track how many queries you've made!
