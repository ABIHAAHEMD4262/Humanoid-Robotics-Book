import { PersonalizedContent } from '../../models/chapter';
import { logger } from '../../lib/logger';

interface CacheEntry {
  data: PersonalizedContent;
  expiry: number; // Unix timestamp in milliseconds
}

class PersonalizationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private static instance: PersonalizationCache;
  private static readonly CACHE_TTL = parseInt(process.env.PERSONALIZATION_CACHE_TTL || '3600') * 1000; // TTL in milliseconds

  private constructor() {}

  public static getInstance(): PersonalizationCache {
    if (!PersonalizationCache.instance) {
      PersonalizationCache.instance = new PersonalizationCache();
    }
    return PersonalizationCache.instance;
  }

  /**
   * Get personalized content from cache
   */
  public get(userId: string, chapterId: string): PersonalizedContent | null {
    const key = this.generateKey(userId, chapterId);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiry) {
      logger.info(`Cache entry expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Set personalized content in cache
   */
  public set(userId: string, chapterId: string, content: PersonalizedContent): void {
    const key = this.generateKey(userId, chapterId);
    const expiry = Date.now() + PersonalizationCache.CACHE_TTL;

    this.cache.set(key, {
      data: content,
      expiry
    });

    logger.debug(`Cache set for key: ${key}, expires at: ${new Date(expiry).toISOString()}`);
  }

  /**
   * Delete personalized content from cache
   */
  public delete(userId: string, chapterId: string): void {
    const key = this.generateKey(userId, chapterId);
    this.cache.delete(key);
    logger.debug(`Cache deleted for key: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    logger.info('Personalization cache cleared');
  }

  /**
   * Generate cache key from user ID and chapter ID
   */
  private generateKey(userId: string, chapterId: string): string {
    return `${userId}:${chapterId}`;
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }
}

export const personalizationCache = PersonalizationCache.getInstance();