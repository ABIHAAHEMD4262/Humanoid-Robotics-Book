# Quick Start Guide - 5 Minutes to Running Backend

## Prerequisites Checklist
- [ ] Python 3.11+ installed
- [ ] OpenAI API key ($5 credit)
- [ ] Qdrant Cloud account (free tier)

## 1. Install Dependencies (2 minutes)

```bash
cd chatbot/backend
pip install poetry
poetry install
```

## 2. Configure API Keys (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```bash
OPENAI_API_KEY=sk-your_key_here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_key_here
```

## 3. Initialize Qdrant (1 minute)

```bash
poetry run python scripts/init_qdrant.py
```

You should see:
```
✓ Collection 'book_passages' created successfully!
```

## 4. Start Server (30 seconds)

```bash
poetry run python src/main.py
```

Server starts at: http://localhost:8000

## 5. Test It Works (30 seconds)

**Option A - Browser:**
Open http://localhost:8000/api/docs

**Option B - Test Script:**
```bash
poetry run python test_api.py
```

**Option C - curl:**
```bash
curl http://localhost:8000/health
```

## Expected Result

✅ Server running
✅ API docs accessible
✅ Health check returns `{"status":"healthy"}`
✅ Query endpoint returns "not available" (no book data yet - this is correct!)

## What's Next?

Your backend is ready! But you need to:

1. **Add book content to Qdrant** (embedding pipeline)
   - Parse your Docusaurus book
   - Chunk into 500-750 token passages
   - Generate OpenAI embeddings
   - Upload to Qdrant

2. **Build the frontend** (React components)

3. **Monitor costs** (https://platform.openai.com/usage)
   - Each query: ~$0.0005
   - Your $5 = ~10,000 queries

## Troubleshooting

**Server won't start?**
- Check `.env` file exists
- Verify API keys are valid
- Ensure port 8000 is available

**"Collection not found"?**
```bash
poetry run python scripts/init_qdrant.py
```

**"Module not found"?**
```bash
poetry install
```

## Done!

Your RAG chatbot backend is running and ready to answer questions once you add book content! 🎉
