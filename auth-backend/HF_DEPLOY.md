# Deploy Auth Backend to Hugging Face Spaces

## Quick Deploy Steps

### 1. Create a New Space

1. Go to: https://huggingface.co/new-space
2. **Space name**: `humanoid-robotics-auth`
3. **License**: Apache 2.0
4. **Space SDK**: Docker
5. **Visibility**: Public or Private
6. Click **Create Space**

### 2. Add Files to the Space

You can either:
- **Option A**: Use the web interface to upload files
- **Option B**: Use Git to push files (recommended)

#### Option A: Web Upload

Upload these files from `auth-backend/` to your Space:
- `Dockerfile`
- `package.json`
- `tsconfig.json`
- `server.ts`
- All folders: `auth/`, `lib/`, `models/`, `services/`, `src/`
- `migrate.ts`, `schema.sql`, `create-tables.sql`

#### Option B: Git Push (Recommended)

```bash
# Clone your HF Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/humanoid-robotics-auth
cd humanoid-robotics-auth

# Copy auth-backend files
cp -r ../Humanoid_Robotics_Book/auth-backend/* .

# Commit and push
git add .
git commit -m "Initial deployment of auth backend"
git push
```

### 3. Configure Environment Variables

In your Hugging Face Space:

1. Go to **Settings** tab
2. Scroll to **Variables and secrets**
3. Click **New secret** and add:

```
DATABASE_URL = postgresql://neondb_owner:yLYWXrDtR70c@ep-soft-tree-a24ozg6u-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

BETTER_AUTH_SECRET = 3459d2b6030e090fe1e65cf26a293b82325d3d6304202ec8fccea49bdc427bc6

BETTER_AUTH_URL = https://YOUR_USERNAME-humanoid-robotics-auth.hf.space

PERSONALIZATION_CACHE_TTL = 3600

PORT = 7860
```

**IMPORTANT**: Replace `YOUR_USERNAME` with your actual Hugging Face username.

### 4. Build and Deploy

HF Spaces will automatically:
1. Detect the Dockerfile
2. Build the Docker image
3. Start your backend on port 7860
4. Assign a URL: `https://YOUR_USERNAME-humanoid-robotics-auth.hf.space`

### 5. Verify Deployment

Once the Space is running (green checkmark):

```bash
# Test health endpoint
curl https://YOUR_USERNAME-humanoid-robotics-auth.hf.space/health

# Expected response:
# {"status":"OK","timestamp":"2025-12-12T..."}
```

### 6. Update Frontend Configuration

Update `docusaurus.config.ts` in your main repo:

```typescript
customFields: {
  authEnabled: true,
  authApiUrl: 'https://YOUR_USERNAME-humanoid-robotics-auth.hf.space/api/auth',
},
```

Then commit and push to trigger GitHub Pages redeploy:

```bash
git add docusaurus.config.ts
git commit -m "chore: configure production auth backend URL (HF Spaces)"
git push origin main
```

## Troubleshooting

### Build fails

Check the **Logs** tab in your HF Space. Common issues:
- Missing dependencies in `package.json`
- TypeScript compilation errors
- Port mismatch (must use 7860)

### "Application startup failed"

1. Check environment variables are set correctly
2. Verify `DATABASE_URL` is reachable from HF Spaces
3. Check logs for database connection errors

### CORS errors

Verify the frontend URL is allowed in `server.ts`:
```typescript
origin: [
  'http://localhost:3000',
  'https://abihaahemd4262.github.io'
],
```

### Database connection timeout

Neon Postgres needs to allow connections from HF Spaces:
- Neon allows connections from any IP by default
- Verify your connection string includes `?sslmode=require`

## Alternative: Use HF Inference API

If you want to use Hugging Face for AI-powered personalization:

1. Add to your Space secrets:
   ```
   HF_TOKEN = your_hugging_face_api_token
   ```

2. Update `services/personalization/personalization-service.ts` to use HF Inference API

## Costs

- **Hugging Face Spaces**: Free tier available
  - CPU: Free
  - Persistent storage: Free (limited)
  - Upgrades available for GPU/better CPU

- **Neon Postgres**: Free tier
  - 0.5 GB storage
  - 1 project
  - Compute: Auto-suspend after inactivity

## Next Steps

- [ ] Deploy to HF Spaces
- [ ] Test auth endpoints
- [ ] Update frontend config
- [ ] Test end-to-end flow
- [ ] Monitor Space logs
- [ ] Set up custom domain (optional)

## Resources

- HF Spaces Docs: https://huggingface.co/docs/hub/spaces
- Docker Spaces: https://huggingface.co/docs/hub/spaces-sdks-docker
- Your Space: https://huggingface.co/spaces/YOUR_USERNAME/humanoid-robotics-auth
