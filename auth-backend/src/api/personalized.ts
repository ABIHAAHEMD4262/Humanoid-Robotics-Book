// Personalized content API endpoint router
import express from 'express';
import { logger } from '../../lib/logger';
import { PersonalizationService } from '../../services/personalization/personalization-service';
import { auth } from '../../auth/better-auth.config';

const router = express.Router();

// Simple middleware to validate authentication (in a real implementation, you'd use Better-Auth's middleware properly)
const authMiddleware: express.RequestHandler = async (req, res, next) => {
  // In a real implementation, this would properly validate the session token
  // For now, we'll just pass through - Better-Auth would handle this properly when integrated correctly
  next();
  return; // Explicitly return to satisfy TypeScript
};

// GET /api/personalized/:chapterId - Retrieve previously generated personalized content for a chapter (with caching)
router.get('/:chapterId', authMiddleware, async (req, res) => {
  try {
    const { chapterId } = req.params;
    logger.info('Get personalized content endpoint called', { chapterId });

    // In a real implementation, the user would be available from the auth middleware
    // For now, we'll simulate a user - this would be properly handled by Better-Auth
    const user = (req as any).user || { id: 'test-user-id' };

    if (!user || !user.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be authenticated to access personalized content'
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'chapterId is required'
      });
    }

    // Try to get cached personalized content
    const cachedContent = await PersonalizationService.getPersonalizedContent(user.id, chapterId);

    if (cachedContent) {
      // Check if the cached content has expired
      if (new Date() > cachedContent.cacheExpiry) {
        logger.info('Cached content expired, generating new content');
        // If expired, generate new content
        const result = await PersonalizationService.generatePersonalizedContent({
          chapterId,
          userId: user.id
        });
        return res.status(200).json(result);
      } else {
        // Return cached content if not expired
        return res.status(200).json(cachedContent);
      }
    } else {
      // If no cached content exists, generate new content
      const result = await PersonalizationService.generatePersonalizedContent({
        chapterId,
        userId: user.id
      });
      return res.status(200).json(result);
    }
  } catch (error: any) {
    logger.error('Error in personalized content endpoint', { error: error.message });

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
    return; // Explicit return to satisfy TypeScript
  }
});

export { router as personalizedRouter };