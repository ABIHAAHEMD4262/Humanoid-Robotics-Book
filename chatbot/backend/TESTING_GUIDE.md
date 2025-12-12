# Testing Guide: RAG Chatbot with OpenAI Assistants API

This guide will help you test the newly implemented OpenAI Assistants API integration with Neon Postgres persistence.

## Prerequisites Checklist

Before testing, verify these are configured:

- [x] **Neon Database URL** in `.env`: `NEON_DATABASE_URL`
- [x] **OpenAI API Key** in `.env`: `OPENAI_API_KEY`
- [x] **Qdrant credentials** in `.env`: `QDRANT_URL`, `QDRANT_API_KEY`
- [x] **Python dependencies** installed: `pip install -r requirements.txt`

## Step 1: Verify Environment Configuration

```bash
cd chatbot/backend

# Check .env file exists and has required variables
cat .env | grep -E "NEON_DATABASE_URL|OPENAI_API_KEY|QDRANT_URL"
```

**Expected Output:**
```
NEON_DATABASE_URL=postgresql://neondb_owner:...
OPENAI_API_KEY=sk-proj-...
QDRANT_URL=https://...
```

## Step 2: Run Database Migration

This creates the required tables in Neon Postgres.

```bash
# Make sure you're in chatbot/backend directory
cd chatbot/backend

# Run Alembic migration
alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial_schema, Initial schema
```

**What This Does:**
- Creates `sessions` table (stores OpenAI thread mappings)
- Creates `messages` table (stores user queries and assistant responses)
- Creates `citations` table (stores answer sources)
- Creates `analytics_events` table (tracks usage metrics)
- Creates `book_sections` table (maps Qdrant vectors to book sections)

**Troubleshooting:**
- If you get "cannot import name 'Base'", make sure `src/database/models.py` exists
- If you get SSL errors, check `NEON_DATABASE_URL` has `?sslmode=require` at the end
- If migration fails, check Neon dashboard to see if tables were partially created

## Step 3: Start the Backend Server

```bash
# Option 1: Using Python directly
python -m src.main

# Option 2: Using Uvicorn (recommended for development)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Starting RAG Chatbot Backend...
INFO:     Initializing database connection...
INFO:     Creating async engine for Neon Postgres: ...
INFO:     Database engine and session maker initialized
INFO:     RAG Chatbot Backend started successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Important Startup Checks:**
- ✅ "Database engine and session maker initialized" → Neon connected
- ✅ "RAG Chatbot Backend started successfully" → Lifespan events working
- ✅ CORS configured with specific origins (not "*")

## Step 4: Test Health Check Endpoint

```bash
# Test basic connectivity
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "rag-chatbot-backend",
  "version": "1.0.0"
}
```

## Step 5: Test Query Endpoint (First Query)

This will test the complete flow: thread creation → embedding → retrieval → Assistants API → database persistence.

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What is ROS2?",
    "selected_text": null,
    "session_id": null
  }'
```

**Expected Response (example):**
```json
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "660e8400-e29b-41d4-a716-446655440001",
  "answer": {
    "answer_text": "ROS2 is the second generation of the Robot Operating System...",
    "citations": [
      {
        "chapter_title": "Module 1: ROS2 Fundamentals",
        "section_title": "1.1 Introduction to ROS2",
        "source_url": "/docs/module1-ros2/chapter1-core-concepts/1.1-nodes",
        "relevance_score": 0.87
      }
    ],
    "confidence_score": 0.85,
    "retrieval_method": "VECTOR_SEARCH"
  },
  "retrieved_passages": [
    {
      "id": "point_123",
      "passage_text": "ROS2 is the second generation of the Robot Operating System, a flexible framework...",
      "section_title": "1.1 Introduction to ROS2",
      "similarity_score": 0.87
    }
  ],
  "processing_time_ms": 2345
}
```

**What's Happening (Backend Logs):**
```
INFO: Processing query: query_length=13, has_selected_text=False
INFO: Using session=660e8400-..., thread=thread_abc123...
DEBUG: Generating query embedding...
DEBUG: Searching vector database...
DEBUG: Saving user message to database...
DEBUG: Generating answer from 5 passages...
DEBUG: Saving assistant message to database...
INFO: Query processed successfully: session=660e8400..., thread=thread_abc123..., answer_length=156, citations=3, processing_time=2345ms
```

**Key Indicators of Success:**
- ✅ New `session_id` returned (UUID format)
- ✅ `thread_id` logged in backend (format: `thread_abc123...`)
- ✅ Answer text present (not "The information is not available")
- ✅ Citations array has items
- ✅ Processing time < 5 seconds

## Step 6: Test Conversation Continuity (Second Query)

Use the `session_id` from the previous response to test thread persistence:

```bash
# Replace SESSION_ID with the actual UUID from Step 5
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "Can you explain more about ROS2 nodes?",
    "selected_text": null,
    "session_id": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**Expected Behavior:**
- ✅ Same `session_id` returned
- ✅ Same `thread_id` used (check backend logs)
- ✅ Assistant has context from previous conversation
- ✅ No new session created in database

**Backend Logs:**
```
INFO: Looking up existing session: 660e8400-e29b-41d4-a716-446655440001
INFO: Retrieved existing thread: session=660e8400..., thread=thread_abc123...
INFO: Using session=660e8400..., thread=thread_abc123... (same as before!)
```

## Step 7: Test Conversation History Retrieval

```bash
# Replace SESSION_ID with your actual session UUID
curl http://localhost:8000/api/conversation/660e8400-e29b-41d4-a716-446655440001
```

**Expected Response:**
```json
{
  "session_id": "660e8400-e29b-41d4-a716-446655440001",
  "messages": [
    {
      "id": "770e8400-...",
      "role": "user",
      "content": "What is ROS2?",
      "selected_text": null,
      "created_at": "2025-12-12T10:30:45.123Z",
      "citations": []
    },
    {
      "id": "880e8400-...",
      "role": "assistant",
      "content": "ROS2 is the second generation of the Robot Operating System...",
      "selected_text": null,
      "created_at": "2025-12-12T10:30:47.456Z",
      "citations": [
        {
          "chapter_title": "Module 1: ROS2 Fundamentals",
          "section_title": "1.1 Introduction to ROS2",
          "url_fragment": "/docs/module1-ros2/...",
          "similarity_score": 0.87
        }
      ]
    }
  ],
  "total_messages": 2,
  "total_pairs": 1,
  "remaining_capacity": 49
}
```

## Step 8: Verify Database Persistence

Check that data is actually stored in Neon Postgres.

### Option A: Using Neon Dashboard

1. Go to https://console.neon.tech
2. Select your project
3. Go to "SQL Editor"
4. Run these queries:

```sql
-- Check sessions table
SELECT id, thread_id, created_at, last_active_at
FROM sessions
ORDER BY created_at DESC
LIMIT 5;

-- Check messages table
SELECT id, role, content, created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;

-- Check citations table
SELECT c.chapter_title, c.section_title, c.similarity_score
FROM citations c
ORDER BY c.similarity_score DESC
LIMIT 10;

-- Count messages per session
SELECT session_id, COUNT(*) as message_count
FROM messages
GROUP BY session_id;
```

### Option B: Using psql CLI

```bash
# Connect to Neon database
psql "postgresql://neondb_owner:yLYWXrDtR70c@ep-soft-tree-a24ozg6u-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Run queries
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM citations;
```

**Expected Results:**
- `sessions` table has at least 1 row
- `messages` table has at least 2 rows (1 user + 1 assistant)
- `citations` table has rows matching the number of passages retrieved

## Step 9: Test Text Selection Feature (Backend Ready)

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What does this mean?",
    "selected_text": "ROS2 uses a Data Distribution Service (DDS) for communication between nodes.",
    "session_id": null
  }'
```

**Expected Behavior:**
- ✅ Backend receives `selected_text` parameter
- ✅ AssistantService prioritizes selected text over vector passages
- ✅ `selected_text` stored in user message in database
- ✅ Answer focuses on explaining the selected text

**Backend Logs:**
```
INFO: Processing query: query_length=18, has_selected_text=True
DEBUG: **Selected Text from Book** (primary context):
ROS2 uses a Data Distribution Service (DDS) for communication between nodes.
```

## Step 10: Test Error Handling

### Test 1: Invalid Query (Empty String)
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "",
    "selected_text": null,
    "session_id": null
  }'
```

**Expected:** `400 Bad Request` with validation error

### Test 2: Query with No Matches
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What is the recipe for chocolate cake?",
    "selected_text": null,
    "session_id": null
  }'
```

**Expected:** Answer should be: `"The information is not available in the book."`

### Test 3: Invalid Session ID
```bash
curl http://localhost:8000/api/conversation/invalid-uuid-format
```

**Expected:** `422 Unprocessable Entity` (validation error)

## Step 11: Monitor OpenAI Dashboard

1. Go to https://platform.openai.com/usage
2. Check "Assistants API" usage
3. Verify:
   - ✅ New assistant created (check "Assistants" tab)
   - ✅ Threads created (1 per unique session)
   - ✅ Messages sent to threads
   - ✅ Token usage tracking

## Common Issues & Solutions

### Issue 1: "Database not initialized"
```
RuntimeError: Database not initialized. Call init_db() at app startup.
```
**Solution:** Make sure `lifespan` is working. Check startup logs for "Database engine and session maker initialized"

### Issue 2: "Assistant run failed with status: failed"
```
Exception: Assistant run failed with status: failed
```
**Solution:**
- Check OpenAI API key is valid
- Check OpenAI account has credits
- Look at `run.last_error` in logs for details

### Issue 3: "No passages found with similarity ≥0.7"
```
WARNING: No passages found with similarity ≥0.7
```
**Solution:**
- Check if Qdrant has data (run embedding script first)
- Verify `QDRANT_URL` and `QDRANT_API_KEY` are correct
- Try a query about known content (e.g., "What is ROS2?")

### Issue 4: SSL Connection Error to Neon
```
SSLError: [SSL: CERTIFICATE_VERIFY_FAILED]
```
**Solution:** Ensure database URL ends with `?sslmode=require`

### Issue 5: "ModuleNotFoundError: No module named 'src'"
```
ModuleNotFoundError: No module named 'src'
```
**Solution:**
- Make sure you're running from `chatbot/backend` directory
- Use `python -m src.main` (not `python src/main.py`)

## Success Criteria Checklist

After testing, verify all these are true:

- [x] ✅ Backend starts without errors
- [x] ✅ Database migration completed successfully
- [x] ✅ Health check returns 200 OK
- [x] ✅ Query endpoint creates new session
- [x] ✅ Query endpoint returns answer with citations
- [x] ✅ Second query reuses same session/thread
- [x] ✅ Conversation history retrieval works
- [x] ✅ Data persisted in Neon Postgres (verified via SQL)
- [x] ✅ OpenAI Assistant and threads created (visible in dashboard)
- [x] ✅ Text selection parameter accepted and prioritized
- [x] ✅ Error handling works for invalid inputs

## Performance Benchmarks

Expected performance metrics:

- **First query (new session):** 2-5 seconds
  - Thread creation: ~500ms
  - Embedding generation: ~200ms
  - Qdrant search: ~100ms
  - Assistant API response: 1-3 seconds
  - Database writes: ~200ms

- **Subsequent queries (existing session):** 1.5-4 seconds
  - Thread lookup: ~50ms (cached)
  - Everything else similar to first query

- **Conversation history retrieval:** <500ms

## Next Steps After Testing

Once all tests pass:

1. **Frontend Integration:** Connect Docusaurus chatbot widget to new API
2. **Text Selection UI:** Implement frontend selection handler
3. **Singleton Services (H022-H023):** Optimize performance by ~80%
4. **Production Deployment:** Update environment variables for production
5. **Monitoring:** Set up logging and error tracking

## Testing Commands Summary

```bash
# 1. Migration
alembic upgrade head

# 2. Start server
uvicorn src.main:app --reload --port 8000

# 3. Health check
curl http://localhost:8000/health

# 4. First query
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query_text": "What is ROS2?", "selected_text": null, "session_id": null}'

# 5. Get conversation history (replace SESSION_ID)
curl http://localhost:8000/api/conversation/SESSION_ID
```

---

**Need Help?** Check backend logs for detailed error messages. All operations are logged with INFO/DEBUG/ERROR levels.
