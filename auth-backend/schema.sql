-- Users table (extends Better-Auth default user schema)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  email_verified TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  software_skill_level TEXT NOT NULL CHECK (software_skill_level IN ('beginner', 'intermediate', 'expert')),
  hardware_type TEXT NOT NULL CHECK (hardware_type IN ('cloud', 'PC', 'Jetson', 'robot')),
  preferred_language TEXT NOT NULL,
  robotics_experience TEXT NOT NULL CHECK (robotics_experience IN ('none', 'hobbyist', 'professional'))
);

-- User sessions (for server-side session management)
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Chapters table
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Personalized content cache
CREATE TABLE personalized_content (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  profile_snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cache_expiry TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_personalized_content_user_id ON personalized_content(user_id);
CREATE INDEX idx_personalized_content_chapter_id ON personalized_content(chapter_id);
CREATE INDEX idx_personalized_content_cache_expiry ON personalized_content(cache_expiry);