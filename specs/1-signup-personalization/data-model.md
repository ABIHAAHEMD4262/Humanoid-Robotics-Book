# Data Model: Signup & Personalization System for Humanoid Robotics Book

## User Entity
**Description**: Represents a reader of the Humanoid Robotics Book
**Fields**:
- `id` (string, primary key): Unique identifier for the user
- `email` (string, unique, required): User's email address (from Better-Auth)
- `name` (string): User's name (from Better-Auth)
- `image` (string, optional): Profile image URL (from Better-Auth)
- `emailVerified` (timestamp, optional): When email was verified (from Better-Auth)
- `createdAt` (timestamp): Account creation date (from Better-Auth)
- `updatedAt` (timestamp): Last update date (from Better-Auth)
- `softwareSkillLevel` (enum, required): User's software skill level (beginner, intermediate, expert)
- `hardwareType` (enum, required): User's hardware type (cloud, PC, Jetson, robot)
- `preferredLanguage` (string, required): User's preferred programming/content language
- `roboticsExperience` (enum, required): User's experience with robotics (none, hobbyist, professional)

**Relationships**:
- One-to-many with UserSession (one user can have multiple sessions)
- One-to-many with PersonalizedContent (one user can have multiple personalized chapters)

**Validation Rules**:
- Email must be valid format
- All profile fields (softwareSkillLevel, hardwareType, preferredLanguage, roboticsExperience) must be from predefined choices
- All profile fields are required during signup

## UserSession Entity
**Description**: Represents an active user session
**Fields**:
- `id` (string, primary key): Unique session identifier
- `userId` (string, foreign key): References User.id
- `expiresAt` (timestamp): Session expiration time
- `createdAt` (timestamp): Session creation time
- `ipAddress` (string, optional): IP address of the session
- `userAgent` (string, optional): User agent string

**Relationships**:
- Many-to-one with User (many sessions per user)

**Validation Rules**:
- Session must have a valid user reference
- Session must not be expired

## Chapter Entity
**Description**: Represents a distinct section or module of the Humanoid Robotics Book
**Fields**:
- `id` (string, primary key): Unique chapter identifier
- `title` (string, required): Chapter title
- `slug` (string, unique, required): URL-friendly identifier
- `content` (text, required): Original chapter content in Markdown format
- `createdAt` (timestamp): Creation time
- `updatedAt` (timestamp): Last update time
- `status` (enum): Chapter status (draft, published, archived)

**Relationships**:
- One-to-many with PersonalizedContent (one chapter can have multiple personalized versions)

**Validation Rules**:
- Content must be valid Markdown
- Title and slug are required
- Slug must be unique

## PersonalizedContent Entity
**Description**: Stores personalized versions of chapters for specific users
**Fields**:
- `id` (string, primary key): Unique identifier
- `userId` (string, foreign key): References User.id
- `chapterId` (string, foreign key): References Chapter.id
- `content` (text, required): Personalized chapter content in Markdown format
- `profileSnapshot` (jsonb): Snapshot of user profile at time of personalization
- `createdAt` (timestamp): Creation time
- `updatedAt` (timestamp): Last update time
- `cacheExpiry` (timestamp): When this cached content expires

**Relationships**:
- Many-to-one with User (many personalized contents per user)
- Many-to-one with Chapter (many personalized contents per chapter)

**Validation Rules**:
- Must have valid references to both user and chapter
- Content must be valid Markdown
- Cache expiry must be in the future

## Database Schema

```sql
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
```