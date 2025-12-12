# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including TypeScript for build)
RUN npm install

# Copy all source code
COPY . .

# Build TypeScript to JavaScript
RUN npx tsc -p tsconfig.json

# Remove dev dependencies after build (reduce image size)
RUN npm prune --production

# Expose port 7860 (required by HF Spaces)
EXPOSE 7860

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "dist/server.js"]
