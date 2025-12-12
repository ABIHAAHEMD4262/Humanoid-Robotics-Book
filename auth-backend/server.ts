import 'dotenv/config';
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
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better-Auth routes - mount auth handler with proper URL construction
app.all('/api/auth/*', async (req, res) => {
  try {
    // Construct the full URL for Better-Auth
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    // Create a Web Request object from Express request
    const request = new Request(fullUrl, {
      method: req.method,
      headers: new Headers(req.headers as HeadersInit),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Call Better-Auth handler
    const response = await auth.handler(request);

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set status and send response
    res.status(response.status);

    // Send response body
    if (response.body) {
      const text = await response.text();
      res.send(text);
    } else {
      res.end();
    }
  } catch (error: any) {
    logger.error('Better-Auth handler error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Authentication error' });
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