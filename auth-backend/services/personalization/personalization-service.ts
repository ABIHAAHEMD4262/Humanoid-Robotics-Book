import { logger } from '../../lib/logger';
import { Chapter, PersonalizedContent } from '../../models/chapter';
import { ContentTransformer } from '../content-processing/content-transformer';
import { ProfileService } from '../user-profile/profile-service';
import { ProfileData } from '../user-profile/profile-validator';
import { personalizationCache } from './cache';

export interface PersonalizationRequest {
  chapterId: string;
  userId: string;
}

export interface PersonalizationResult {
  id: string;
  chapterId: string;
  userId: string;
  content: string;
  profileSnapshot: ProfileData;
  createdAt: Date;
  cacheExpiry: Date;
}

export class PersonalizationService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second base delay

  /**
   * Generates personalized content for a chapter based on user profile
   */
  static async generatePersonalizedContent(request: PersonalizationRequest, retryCount: number = 0): Promise<PersonalizationResult> {
    const startTime = Date.now();
    try {
      logger.info(`Generating personalized content for user ${request.userId} and chapter ${request.chapterId}`);

      // Check if content is already in cache
      const cachedContent = personalizationCache.get(request.userId, request.chapterId);
      if (cachedContent) {
        logger.info(`Returning cached personalized content for user ${request.userId} and chapter ${request.chapterId}`);
        return {
          id: cachedContent.id,
          chapterId: cachedContent.chapterId,
          userId: cachedContent.userId,
          content: cachedContent.content,
          profileSnapshot: cachedContent.profileSnapshot,
          createdAt: cachedContent.createdAt,
          cacheExpiry: cachedContent.cacheExpiry,
        };
      }

      // Get the user profile with retry mechanism
      const userProfile = await this.handleNetworkOperation(
        () => ProfileService.getProfileByUserId(request.userId),
        `Failed to get user profile for user ${request.userId}`
      );

      if (!userProfile) {
        throw new Error(`User profile not found for user ${request.userId}`);
      }

      // Get the chapter content with retry mechanism
      const chapter = await this.handleNetworkOperation(
        () => this.getChapterById(request.chapterId),
        `Failed to get chapter content for chapter ${request.chapterId}`
      );

      if (!chapter) {
        throw new Error(`Chapter not found with ID ${request.chapterId}`);
      }

      // Create profile snapshot with proper type assertion
      const profileSnapshot: ProfileData = {
        softwareSkillLevel: userProfile.softwareSkillLevel,
        hardwareType: userProfile.hardwareType,
        preferredLanguage: userProfile.preferredLanguage,
        roboticsExperience: userProfile.roboticsExperience,
      };

      // Transform the content based on the user profile (synchronous operation)
      const personalizedContent: string = ContentTransformer.transformContent(chapter.content, profileSnapshot);

      // Create the result
      const result: PersonalizationResult = {
        id: `pc_${Date.now()}_${request.userId}_${request.chapterId}`, // This would be a real ID from the database
        chapterId: request.chapterId,
        userId: request.userId,
        content: personalizedContent,
        profileSnapshot,
        createdAt: new Date(),
        cacheExpiry: new Date(Date.now() + (parseInt(process.env.PERSONALIZATION_CACHE_TTL || '3600') * 1000)), // Cache TTL from environment
      };

      // Store in cache with error handling
      try {
        personalizationCache.set(request.userId, request.chapterId, {
          id: result.id,
          userId: result.userId,
          chapterId: result.chapterId,
          content: result.content,
          profileSnapshot: result.profileSnapshot,
          createdAt: result.createdAt,
          updatedAt: result.createdAt,
          cacheExpiry: result.cacheExpiry,
        });
      } catch (cacheError) {
        logger.warn(`Failed to store content in cache: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`);
        // Continue execution even if cache fails
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      logger.info(`Personalized content generated successfully for user ${request.userId} and chapter ${request.chapterId} in ${duration}ms`);

      // Log performance warning if processing took too long
      if (duration > 5000) {
        logger.warn(`Personalization took longer than 5 seconds: ${duration}ms for user ${request.userId} and chapter ${request.chapterId}`);
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      logger.error(`Error generating personalized content for user ${request.userId} and chapter ${request.chapterId} after ${duration}ms`, {
        error: error instanceof Error ? error.message : String(error),
        retryCount
      });

      // If we haven't exceeded the retry limit, try again after a short delay
      if (retryCount < this.MAX_RETRIES) {
        logger.info(`Retrying personalization (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1))); // Exponential backoff
        return this.generatePersonalizedContent(request, retryCount + 1);
      }

      // If retries are exhausted, log the error and return the original content as fallback
      logger.error(`All retries failed for user ${request.userId} and chapter ${request.chapterId}. Using fallback.`);

      // Return original chapter content as fallback
      const chapter = await this.handleNetworkOperation(
        () => this.getChapterById(request.chapterId),
        `Failed to get fallback chapter content for chapter ${request.chapterId}`
      );

      if (!chapter) {
        throw error; // If we can't even get the original chapter, re-throw the error
      }

      const fallbackResult: PersonalizationResult = {
        id: `fallback_${Date.now()}_${request.userId}_${request.chapterId}`,
        chapterId: request.chapterId,
        userId: request.userId,
        content: chapter.content, // Use original content as fallback
        profileSnapshot: {
          softwareSkillLevel: 'intermediate', // Default value
          hardwareType: 'PC', // Default value
          preferredLanguage: 'English', // Default value
          roboticsExperience: 'none' // Default value
        },
        createdAt: new Date(),
        cacheExpiry: new Date(Date.now() + (parseInt(process.env.PERSONALIZATION_CACHE_TTL || '3600') * 1000)),
      };

      // Store fallback in cache to prevent repeated failures (with error handling)
      try {
        personalizationCache.set(request.userId, request.chapterId, {
          id: fallbackResult.id,
          userId: fallbackResult.userId,
          chapterId: fallbackResult.chapterId,
          content: fallbackResult.content,
          profileSnapshot: fallbackResult.profileSnapshot,
          createdAt: fallbackResult.createdAt,
          updatedAt: fallbackResult.createdAt,
          cacheExpiry: fallbackResult.cacheExpiry,
        });
      } catch (cacheError) {
        logger.warn(`Failed to store fallback content in cache: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`);
        // Continue execution even if cache fails
      }

      return fallbackResult;
    }
  }

  /**
   * Gets personalized content for a user and chapter, using cache if available
   */
  static async getPersonalizedContent(userId: string, chapterId: string): Promise<PersonalizedContent | null> {
    try {
      logger.info(`Retrieving personalized content for user ${userId} and chapter ${chapterId}`);

      // Check cache first
      const cachedContent = personalizationCache.get(userId, chapterId);
      if (cachedContent) {
        logger.info(`Returning cached personalized content for user ${userId} and chapter ${chapterId}`);
        return cachedContent;
      }

      logger.info(`No cached personalized content found for user ${userId} and chapter ${chapterId}`);
      return null;
    } catch (error) {
      logger.error(`Error retrieving personalized content for user ${userId} and chapter ${chapterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      // Return null instead of throwing to prevent cascading failures
      return null;
    }
  }

  /**
   * Handles network operations with retry mechanism
   */
  private static async handleNetworkOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    maxRetries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`${errorMessage} (attempt ${attempt + 1}/${maxRetries + 1}):`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        });

        if (attempt < maxRetries) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError || new Error(errorMessage);
  }

  /**
   * Gets a chapter by its ID
   */
  private static async getChapterById(chapterId: string): Promise<Chapter | null> {
    // In a real implementation, this would query the database or filesystem for the chapter
    // For demo/testing: return generic content for any chapter ID
    logger.info(`Getting chapter by ID: ${chapterId}`);

    // Return a generic chapter that works for any chapter ID
    return {
      id: chapterId,
      title: `Chapter: ${chapterId}`,
      slug: chapterId,
      content: `# Welcome to Physical AI & Humanoid Robotics

This is an educational book about robotics and artificial intelligence. The content you're reading can be personalized based on your skill level and experience.

## Key Topics

- Robot Operating System (ROS 2)
- Sensors and Actuators
- Control Systems
- Machine Learning for Robotics
- Simulation and Digital Twins

## Learning Path

Whether you're a complete beginner or an experienced developer, this book adapts to your level. Advanced users will see more technical depth, while beginners get simpler explanations with more context.

## Hands-On Projects

Throughout this book, you'll build practical projects that run on different hardware platforms - from cloud simulations to physical robots.`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'published' as const
    };
  }
}