// Environment variables are loaded via --env-file flag in package.json
import express from 'express';
import cors from 'cors';
import apiRouter from './src/api';
import { logger } from './lib/logger';
import { db } from './lib/database';
import { auth } from './auth/better-auth.config';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS middleware - allow frontend to connect
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://abihaahemd4262.github.io'
  ],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better-Auth routes - convert Express request to Web Request
app.all('/api/auth/*', async (req, res) => {
  try {
    // Get the protocol and host, handling proxy headers
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('x-forwarded-host') || req.get('host');

    // Build the full URL
    const url = `${protocol}://${host}${req.originalUrl}`;

    // Get request body as text if it exists
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined;

    // Create Web Request
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body,
    });

    // Call Better-Auth handler
    const webResponse = await auth.handler(webRequest);

    // Copy headers from Web Response to Express response
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set status code
    res.status(webResponse.status);

    // Send body
    if (webResponse.body) {
      const responseText = await webResponse.text();
      res.send(responseText);
    } else {
      res.end();
    }
  } catch (error: any) {
    logger.error('Better-Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled application error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`API available at http://localhost:${PORT}/api`);
});

export default app;