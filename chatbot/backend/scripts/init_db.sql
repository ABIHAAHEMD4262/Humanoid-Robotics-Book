-- RAG Chatbot Database Schema for Neon Serverless Postgres
-- Creates tables for conversations, queries, answers, passages, analytics, and rate limiting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS answer_passages CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS queries CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS passages CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    account_id VARCHAR(100),  -- Optional, for cross-device sync
    CONSTRAINT max_50_queries CHECK ((SELECT COUNT(*) FROM queries WHERE session_id = id) <= 50)
);

CREATE INDEX idx_conversations_account ON conversations(account_id) WHERE account_id IS NOT NULL;
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- Queries table
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL CHECK (char_length(query_text) <= 5000),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    selected_text TEXT CHECK (char_length(selected_text) <= 10000),
    session_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_queries_session ON queries(session_id);
CREATE INDEX idx_queries_timestamp ON queries(timestamp DESC);

-- Retrieval method enum
CREATE TYPE retrieval_method_enum AS ENUM ('selected_text', 'vector_search', 'hybrid');

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_text TEXT NOT NULL CHECK (char_length(answer_text) <= 2000),
    citations JSONB NOT NULL DEFAULT '[]',
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    retrieval_method retrieval_method_enum NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    query_id UUID NOT NULL UNIQUE REFERENCES queries(id) ON DELETE CASCADE
);

CREATE INDEX idx_answers_query ON answers(query_id);
CREATE INDEX idx_answers_timestamp ON answers(timestamp DESC);

-- Passages table (metadata for Qdrant vectors)
CREATE TABLE passages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passage_text TEXT NOT NULL CHECK (char_length(passage_text) <= 5000),
    chapter_title VARCHAR(200) NOT NULL,
    section_title VARCHAR(200) NOT NULL,
    source_url TEXT NOT NULL,
    paragraph_id VARCHAR(100),
    embedding_id VARCHAR(100) NOT NULL UNIQUE  -- References Qdrant vector ID
);

CREATE INDEX idx_passages_chapter ON passages(chapter_title);
CREATE INDEX idx_passages_embedding ON passages(embedding_id);

-- Answer-Passage junction table (many-to-many)
CREATE TABLE answer_passages (
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
    PRIMARY KEY (answer_id, passage_id)
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_topic TEXT[] NOT NULL CHECK (array_length(query_topic, 1) BETWEEN 1 AND 10),
    chapter_referenced VARCHAR(200),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    answered BOOLEAN NOT NULL,
    session_id_hash CHAR(64) NOT NULL CHECK (session_id_hash ~ '^[a-f0-9]{64}$')  -- SHA-256 hash
);

CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_topic ON analytics_events USING GIN(query_topic);
CREATE INDEX idx_analytics_chapter ON analytics_events(chapter_referenced);
CREATE INDEX idx_analytics_answered ON analytics_events(answered);

-- Rate limits table
CREATE TABLE rate_limits (
    session_id UUID PRIMARY KEY,
    tokens INT NOT NULL CHECK (tokens BETWEEN 0 AND 10),
    last_refill TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_updated ON rate_limits(last_updated DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update conversations.updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Verify schema
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

COMMENT ON TABLE conversations IS 'Stores user conversation sessions with max 50 query-answer pairs';
COMMENT ON TABLE queries IS 'User questions with optional selected text context';
COMMENT ON TABLE answers IS 'Generated responses with citations and retrieval method';
COMMENT ON TABLE passages IS 'Book content metadata linked to Qdrant vectors';
COMMENT ON TABLE analytics_events IS 'Anonymized usage analytics with hashed session IDs';
COMMENT ON TABLE rate_limits IS 'Token bucket rate limiting (10 queries/min/session)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema initialized successfully!';
    RAISE NOTICE 'Tables created: conversations, queries, answers, passages, analytics_events, rate_limits';
END $$;
