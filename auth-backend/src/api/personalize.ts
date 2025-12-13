// Personalize API endpoint router
import express from 'express';
import { logger } from '../../lib/logger';
import { PersonalizationService } from '../../services/personalization/personalization-service';
import { auth } from '../../auth/better-auth.config';

const router = express.Router();

// POST /api/personalize - Generate personalized content for a specific chapter based on user profile
router.post('/', async (req, res) => {
  try {
    logger.info('Personalize endpoint called', { body: req.body });

    // Get session from Better-Auth using the session cookie
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session?.user) {
      logger.warn('Unauthorized personalization request - no valid session');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be authenticated to access personalization'
      });
    }

    const user = session.user;
    logger.info('Authenticated user:', { userId: user.id, email: user.email });

    // Extract chapterId from the request body
    const { chapterId } = req.body;
    if (!chapterId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'chapterId is required'
      });
    }

    // Generate personalized content
    const result = await PersonalizationService.generatePersonalizedContent({
      chapterId,
      userId: user.id
    });

    res.status(200).json(result);
    return; // Explicit return to satisfy TypeScript
  } catch (error: any) {
    logger.error('Error in personalization endpoint', { error: error.message });

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
    return; // Explicit return to satisfy TypeScript
  }
});

export { router as personalizeRouter };