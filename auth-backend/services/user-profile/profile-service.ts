import { db } from '../../lib/database';
import { logger } from '../../lib/logger';
import { ProfileValidator, ProfileData, ValidationError } from './profile-validator';

export interface UserProfile {
  id: string;
  userId: string;
  softwareSkillLevel: 'beginner' | 'intermediate' | 'expert';
  hardwareType: 'cloud' | 'PC' | 'Jetson' | 'robot';
  preferredLanguage: string;
  roboticsExperience: 'none' | 'hobbyist' | 'professional';
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileService {
  /**
   * Creates or updates a user profile with validation
   */
  static async createOrUpdateProfile(userId: string, profileData: ProfileData): Promise<UserProfile> {
    try {
      // Validate the profile data
      const validationErrors = ProfileValidator.validateProfileData(profileData);
      if (validationErrors.length > 0) {
        throw new Error(`Profile validation failed: ${validationErrors.map(e => e.message).join('; ')}`);
      }

      // In a real implementation, we would interact with the database to create/update the profile
      // For now, we'll return a mock profile object
      const profile: UserProfile = {
        id: `profile_${Date.now()}`, // This would be a real ID from the database
        userId,
        softwareSkillLevel: profileData.softwareSkillLevel,
        hardwareType: profileData.hardwareType,
        preferredLanguage: profileData.preferredLanguage,
        roboticsExperience: profileData.roboticsExperience,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info(`Profile created/updated for user ${userId}`, { profileId: profile.id });
      return profile;
    } catch (error) {
      // Log the error with context
      logger.error(`Error creating/updating profile for user ${userId}`, {
        error: error instanceof Error ? error.message : String(error),
        userId,
        profileData
      });

      // Re-throw the error with more context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unknown error occurred while creating or updating profile');
      }
    }
  }

  /**
   * Retrieves a user profile by user ID from Better-Auth user table
   */
  static async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      logger.info(`Retrieving profile for user ${userId}`);

      // Query the Better-Auth user table which contains profile fields
      const user = await db
        .selectFrom('user')
        .selectAll()
        .where('id', '=', userId)
        .executeTakeFirst();

      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return null;
      }

      // Extract profile data from user record
      const profile: UserProfile = {
        id: `profile_${user.id}`,
        userId: user.id,
        softwareSkillLevel: (user as any).softwareSkillLevel || 'beginner',
        hardwareType: (user as any).hardwareType || 'PC',
        preferredLanguage: (user as any).preferredLanguage || 'English',
        roboticsExperience: (user as any).roboticsExperience || 'none',
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };

      logger.info(`Profile retrieved for user ${userId}`, { profile });
      return profile;
    } catch (error) {
      // Log the error with context
      logger.error(`Error retrieving profile for user ${userId}`, {
        error: error instanceof Error ? error.message : String(error),
        userId
      });

      // Re-throw the error with more context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unknown error occurred while retrieving profile');
      }
    }
  }

  /**
   * Updates an existing user profile
   */
  static async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<UserProfile> {
    try {
      // Validate the profile data if any fields are provided
      const validationErrors = ProfileValidator.validateIncompleteProfile(profileData);

      if (validationErrors.length > 0) {
        throw new Error(`Profile validation failed: ${validationErrors.map(e => e.message).join('; ')}`);
      }

      // In a real implementation, we would update the profile in the database
      // For now, we'll return a mock updated profile object
      const profile: UserProfile = {
        id: `profile_${Date.now()}`, // This would be the real profile ID from the database
        userId,
        softwareSkillLevel: profileData.softwareSkillLevel || 'beginner',
        hardwareType: profileData.hardwareType || 'PC',
        preferredLanguage: profileData.preferredLanguage || 'English',
        roboticsExperience: profileData.roboticsExperience || 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info(`Profile updated for user ${userId}`, { profileId: profile.id });
      return profile;
    } catch (error) {
      // Log the error with context
      logger.error(`Error updating profile for user ${userId}`, {
        error: error instanceof Error ? error.message : String(error),
        userId,
        profileData
      });

      // Re-throw the error with more context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unknown error occurred while updating profile');
      }
    }
  }

  /**
   * Checks if a user with the given email already exists
   */
  static async checkDuplicateEmail(email: string): Promise<boolean> {
    try {
      // In a real implementation, we would query the database to check for duplicate email
      // For now, we'll simulate a database check
      logger.info(`Checking for duplicate email: ${email}`);

      // This is a placeholder implementation - in a real app, we would query the database
      // to check if a user with this email already exists
      return false; // Assume no duplicate for now
    } catch (error) {
      // Log the error with context
      logger.error(`Error checking for duplicate email: ${email}`, {
        error: error instanceof Error ? error.message : String(error),
        email
      });

      // Re-throw the error with more context
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unknown error occurred while checking for duplicate email');
      }
    }
  }

  /**
   * Handles network errors with retry mechanism
   */
  static async handleNetworkError<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Network operation failed (attempt ${attempt}/${maxRetries}):`, {
          error: lastError.message,
          attempt,
          maxRetries
        });

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError || new Error('Unknown network error occurred');
  }
}