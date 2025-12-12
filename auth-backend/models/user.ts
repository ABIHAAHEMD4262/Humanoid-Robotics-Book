// User model extending Better-Auth default user schema
// Note: Better-Auth handles the user model internally, so we define the additional fields
// in the Better-Auth configuration rather than creating a separate model file.
// This file exists to document the user structure and can be used for type definitions if needed.

/**
 * User interface representing a reader of the Humanoid Robotics Book
 * This extends the default Better-Auth user schema with additional profile fields
 */
export interface User {
  // Default Better-Auth fields
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Custom profile fields
  softwareSkillLevel: 'beginner' | 'intermediate' | 'expert';
  hardwareType: 'cloud' | 'PC' | 'Jetson' | 'robot';
  preferredLanguage: string;
  roboticsExperience: 'none' | 'hobbyist' | 'professional';
}

/**
 * User Session interface for server-side session management
 */
export interface UserSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Chapter interface representing a distinct section of the Humanoid Robotics Book
 */
export interface Chapter {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
}

/**
 * PersonalizedContent interface storing personalized versions of chapters
 */
export interface PersonalizedContent {
  id: string;
  userId: string;
  chapterId: string;
  content: string;
  profileSnapshot: {
    softwareSkillLevel: 'beginner' | 'intermediate' | 'expert';
    hardwareType: 'cloud' | 'PC' | 'Jetson' | 'robot';
    preferredLanguage: string;
    roboticsExperience: 'none' | 'hobbyist' | 'professional';
  };
  createdAt: Date;
  updatedAt: Date;
  cacheExpiry: Date;
}