# Book Content Embedding Guide

This guide explains how to embed your Docusaurus book content into Qdrant for semantic search.

## What This Does

The embedding pipeline:
1. **Parses** all `.md` and `.mdx` files in your `docs/` folder
2. **Chunks** content into ~600 token passages (500-750 range)
3. **Generates embeddings** using OpenAI text-embedding-3-small
4. **Uploads** to Qdrant with metadata (chapter, section, source URL)

After this, your chatbot can answer questions about your book!

## Prerequisites

✅ Qdrant collection initialized (`init_qdrant.py`)
✅ OpenAI API key with credits
✅ Book content in `docs/` folder

## Cost Estimate

For your book (~50 MDX files):

**Estimated:**
- Files: ~50 pages
- Total words: ~50,000 words
- Chunks: ~100-150 passages (600 tokens avg)
- Embedding cost: 150 × 600 tokens × $0.00002/1K = **$0.002** (less than $0.01!)

**Your $5 budget:**
- Cost: ~$0.01 for embedding
- Remaining: $4.99 for queries
- Impact: Negligible! ✅

## How to Run

### Step 1: Install Dependencies

```bash
cd chatbot/backend
poetry install  # Installs tiktoken dependency
```

### Step 2: Run Embedding Pipeline

```bash
poetry run python scripts/embed_book_content.py
```

### Step 3: Watch Progress

You'll see output like:
```
============================================================
BOOK CONTENT EMBEDDING PIPELINE
============================================================

Found 52 Markdown files

Processing: docs/intro.md
  ✓ Generated 2 passages (1,234 tokens)
Processing: docs/module1-ros2/chapter1-core-concepts/1.1-nodes.mdx
  ✓ Generated 3 passages (1,678 tokens)
...

============================================================
Total passages generated: 150
Total tokens: 87,450
============================================================

Generating embeddings for 150 passages...
  Embedding batch 1/2...
  Embedding batch 2/2...
✓ Generated 150 embeddings

Uploading to Qdrant...
  Uploaded batch 1/2
  Uploaded batch 2/2
✓ Uploaded 150 passages to Qdrant

============================================================
EMBEDDING PIPELINE COMPLETE!
============================================================

Your Qdrant collection now has 150 searchable passages.
You can now test queries against your book content!
```

## What Gets Embedded

For each `.md`/`.mdx` file:

**Example File:** `docs/module1-ros2/chapter1-core-concepts/1.1-nodes.mdx`

**Extracted:**
- **Chapter**: "Module1 Ros2 - Chapter1 Core Concepts"
- **Section**: "1.1-nodes"
- **Content**: Full text (stripped of MDX syntax)
- **Source URL**: `https://your-book-url.com/docs/module1-ros2/chapter1-core-concepts/1.1-nodes`

**Chunks**: If content > 600 tokens, splits into:
- "1.1-nodes (Part 1/3)"
- "1.1-nodes (Part 2/3)"
- "1.1-nodes (Part 3/3)"

## Verify It Worked

After embedding, test a query:

```bash
# Start backend server
poetry run python src/main.py

# In another terminal, test query
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What are ROS 2 nodes?",
    "session_id": null
  }'
```

**Expected: Real answer with citations!** 🎉

## Customization

### Change Chunk Size

Edit `embed_book_content.py`:
```python
pipeline = BookEmbeddingPipeline(
    chunk_size=600,  # tokens (default)
    chunk_overlap=100  # tokens (default)
)
```

**Recommendations:**
- **Smaller chunks (400-500)**: More precise retrieval, more chunks
- **Larger chunks (700-800)**: More context, fewer chunks
- **Keep overlap (100)**: Prevents splitting concepts across chunks

### Custom Base URL

Set environment variable:
```bash
# In .env
BOOK_BASE_URL=https://your-actual-book-url.com
```

Or the script uses a default placeholder.

## Re-Running

**To update/re-embed:**

1. Delete existing collection:
```bash
poetry run python scripts/init_qdrant.py
# Answer "yes" when prompted to delete existing collection
```

2. Re-run embedding:
```bash
poetry run python scripts/embed_book_content.py
```

**Note**: This will cost another ~$0.01 (negligible).

## Troubleshooting

### "No such file or directory: docs"

**Problem**: Script can't find docs folder

**Solution**: The script looks for `../../docs` relative to `scripts/`. Your structure should be:
```
Humanoid_Robotics_Book/
├── docs/           # Docusaurus content
└── chatbot/
    └── backend/
        └── scripts/
            └── embed_book_content.py
```

### "Invalid API key"

**Problem**: OpenAI API key not set

**Solution**:
```bash
# Check .env file
cat .env | grep OPENAI_API_KEY

# Should show: OPENAI_API_KEY=sk-...
```

### "Collection not found"

**Problem**: Qdrant collection doesn't exist

**Solution**:
```bash
poetry run python scripts/init_qdrant.py
```

### "Rate limit exceeded"

**Problem**: Too many embedding requests too fast

**Solution**: Script already batches (100 at a time). If this happens, wait a minute and re-run. Progress is incremental.

## Next Steps

After embedding:

1. ✅ **Test queries** - Try asking about your book content
2. ✅ **Build frontend** - Create React UI for user interactions
3. ✅ **Monitor costs** - Check OpenAI usage dashboard
4. ✅ **Iterate** - Re-embed if you update book content

## Cost Tracking

Keep track of embedding runs:

| Date | Files | Passages | Tokens | Cost | Remaining Budget |
|------|-------|----------|--------|------|------------------|
| Today | 52 | 150 | 87K | $0.002 | $4.998 |

Your $5 budget = ~9,500 queries after embedding!
