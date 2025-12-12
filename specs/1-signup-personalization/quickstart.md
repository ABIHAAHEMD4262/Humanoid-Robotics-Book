# Quickstart: Signup & Personalization System for Humanoid Robotics Book

## Prerequisites

- Node.js 20+ installed
- Neon Postgres database instance
- Better-Auth compatible environment
- Docusaurus project set up

## Installation

1. **Install required dependencies:**
   ```bash
   npm install better-auth @neondatabase/serverless drizzle-orm express
   ```

2. **Set up environment variables:**
   ```bash
   # .env file
   DATABASE_URL="your_neon_postgres_connection_string"
   BETTER_AUTH_SECRET="your_auth_secret"
   BETTER_AUTH_URL="http://localhost:3000"
   PERSONALIZATION_CACHE_TTL=3600  # 1 hour in seconds
   ```

## Project Structure

The project is organized as follows:
- `auth-backend/` - Backend services for authentication and personalization
- `backend/` - Additional backend services (content processing, etc.)
- `frontend/` or main directory - Docusaurus frontend
- `specs/` - Specification and documentation files

## Configuration

1. **Better-Auth is configured with custom user fields:**
   The configuration is already set up in `auth-backend/auth/better-auth.config.ts` with the following custom fields:
   - softwareSkillLevel
   - hardwareType
   - preferredLanguage
   - roboticsExperience

2. **Database schema:**
   The schema is defined in `auth-backend/schema.sql` and uses Neon Postgres with Drizzle ORM.

3. **API endpoints:**
   - POST `/api/personalize` - Generate personalized content
   - GET `/api/personalized/:chapterId` - Retrieve personalized content
   - Authentication endpoints are handled by Better-Auth

## Running the System

1. **Install all dependencies:**
   ```bash
   npm install
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest tsx
   ```

2. **Set up environment variables:**
   Create a `.env` file with your database URL and auth secrets (see Installation section)

3. **Start the backend server:**
   ```bash
   # For development (with auto-restart on changes)
   npm run dev:backend
   # Or for production build and start
   npm run build:backend
   npm run start:backend
   ```

4. **Start the Docusaurus frontend:**
   ```bash
   npm run start
   ```

5. **Access the signup page:**
   Navigate to `/signup` to register a new user with profile information

6. **Test personalization:**
   - Sign in with your credentials at `/signin`
   - Navigate to any chapter
   - Click the "Personalize" button
   - Verify the content is customized based on your profile

7. **Check the backend health:**
   - Backend API is available at `http://localhost:4000/api`
   - Health check available at `http://localhost:4000/health`

## Testing

1. **Run unit tests:**
   ```bash
   # Note: You may need to install testing dependencies first
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
   npm test
   ```

   Or run tests directly with:
   ```bash
   npx jest
   ```

2. **Unit tests location:**
   Unit tests are located in `tests/unit/` directory with test files for each service.

## Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform** (Vercel, Netlify, etc.)

3. **Ensure environment variables are set** in your production environment

4. **Database migrations:**
   Make sure your Neon Postgres database is properly configured with the schema from `auth-backend/schema.sql`