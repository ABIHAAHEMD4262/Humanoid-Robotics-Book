# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm install -g typescript
RUN npx tsc -p tsconfig.json

# Expose port (HF Spaces uses port 7860)
EXPOSE 7860

# Set environment
ENV NODE_ENV=production
ENV PORT=7860

# Start server
CMD ["node", "dist/server.js"]
