---
title: RAG Chatbot Backend
emoji: 🤖
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---

# RAG Chatbot Backend for Physical AI & Humanoid Robotics Book

FastAPI backend for the RAG (Retrieval-Augmented Generation) chatbot that answers questions about the Physical AI & Humanoid Robotics book.

## Features

- **Vector Search**: Uses Qdrant cloud vector database for semantic search
- **Embeddings**: Google Gemini text-embedding-004 (768 dimensions)
- **LLM**: OpenAI GPT-4o-mini for answer generation
- **229 Book Passages**: Pre-embedded content from the complete book
- **Citation Support**: Every answer includes source citations with relevance scores
- **CORS Enabled**: Works with GitHub Pages deployment

## API Endpoints

### POST `/api/query`

Submit a question and get an answer with citations.

**Request:**
```json
{
  "query_text": "What is ROS 2?"
}
```

**Response:**
```json
{
  "query_id": "uuid",
  "session_id": "uuid",
  "answer": {
    "answer_text": "ROS 2 stands for...",
    "citations": [
      {
        "chapter_title": "Module 1: ROS 2",
        "section_title": "Introduction",
        "source_url": "https://...",
        "relevance_score": 0.85
      }
    ],
    "confidence_score": 0.75
  },
  "retrieved_passages": [...],
  "processing_time_ms": 2500
}
```

### GET `/health`

Health check endpoint.

## Environment Variables

Required secrets (configured in HF Space settings):

- `QDRANT_URL`: Qdrant cloud cluster URL
- `QDRANT_API_KEY`: Qdrant API key
- `GEMINI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key

## Tech Stack

- **FastAPI**: Web framework
- **Qdrant**: Vector database
- **Google Gemini**: Embeddings (768-dim)
- **OpenAI GPT-4o-mini**: Answer generation
- **Pydantic**: Data validation

## License

MIT
