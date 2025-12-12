import { ProfileData } from '../user-profile/profile-validator';
import { logger } from '../../lib/logger';

export class ContentTransformer {
  /**
   * Transforms content based on user profile to make it more relevant
   */
  static transformContent(content: string, profile: ProfileData): string {
    try {
      // First, extract code blocks and other protected content to preserve them
      const { protectedContent, cleanContent } = this.extractProtectedContent(content);

      // Apply transformations based on user's software skill level
      let transformedContent = this.transformBySkillLevel(cleanContent, profile.softwareSkillLevel);

      // Apply transformations based on user's hardware type
      transformedContent = this.transformByHardwareType(transformedContent, profile.hardwareType);

      // Apply transformations based on user's robotics experience
      transformedContent = this.transformByExperience(transformedContent, profile.roboticsExperience);

      // Now reinsert the protected content (code blocks, etc.) back into the transformed content
      transformedContent = this.reinsertProtectedContent(transformedContent, protectedContent);

      return transformedContent;
    } catch (error) {
      logger.error('Error transforming content:', { error, content });
      // Return original content if transformation fails
      return content;
    }
  }

  /**
   * Extracts protected content (code blocks, etc.) to preserve during transformation
   */
  private static extractProtectedContent(content: string): { protectedContent: Array<{ id: string; content: string }>; cleanContent: string } {
    const protectedContent: Array<{ id: string; content: string }> = [];
    let cleanContent = content;

    // Extract fenced code blocks (```...```) - more efficient single-pass extraction
    const fencedCodeRegex = /(```[\s\S]*?```)/g;
    cleanContent = cleanContent.replace(fencedCodeRegex, (match) => {
      const id = `CODE_BLOCK_${protectedContent.length}`;
      protectedContent.push({ id, content: match });
      return `{{${id}}}`;
    });

    // Extract inline code blocks (`...`) - more efficient single-pass extraction
    const inlineCodeRegex = /(`[^`]*`)/g;
    cleanContent = cleanContent.replace(inlineCodeRegex, (match) => {
      const id = `INLINE_CODE_${protectedContent.length}`;
      protectedContent.push({ id, content: match });
      return `{{${id}}}`;
    });

    return { protectedContent, cleanContent };
  }

  /**
   * Reinserts protected content back into the transformed content
   */
  private static reinsertProtectedContent(transformedContent: string, protectedContent: Array<{ id: string; content: string }>): string {
    let result = transformedContent;

    // Process all replacements in a single pass for better performance
    for (const item of protectedContent) {
      // Use string replace instead of regex for better performance
      const placeholder = `{{${item.id}}}`;
      result = result.split(placeholder).join(item.content);
    }

    return result;
  }

  /**
   * Transforms content based on user's software skill level
   */
  private static transformBySkillLevel(content: string, skillLevel: string): string {
    let transformed = content;

    if (skillLevel === 'beginner') {
      // Add more explanations for beginners
      transformed = transformed.replace(/(##\s+Key Concepts)/g, '## Key Concepts (Explained Simply)\n\nAs a beginner, we\'ll explain these concepts in more detail:\n\n');
      // Use a single replace operation for all technical terms to improve performance
      transformed = transformed.replace(/\b(Nodes|Topics|Services|Actions)\b/gi, (match) => {
        switch(match.toLowerCase()) {
          case 'nodes':
            return 'Nodes (the basic building blocks of ROS 2)';
          case 'topics':
            return 'Topics (how different parts of your robot communicate)';
          case 'services':
            return 'Services (request-response communication between robot parts)';
          case 'actions':
            return 'Actions (more advanced communication for tasks that take time)';
          default:
            return match;
        }
      });
    } else if (skillLevel === 'intermediate') {
      // Add moderate explanations for intermediate users
      transformed = transformed.replace(/(##\s+Key Concepts)/g, '## Key Concepts\n\nThese are the core concepts you should understand:\n\n');
    } else if (skillLevel === 'expert') {
      // Add advanced explanations for experts
      transformed = transformed.replace(/(##\s+Key Concepts)/g, '## Key Concepts\n\nAs an expert, you likely know these, but here\'s an advanced overview:\n\n');
    }

    return transformed;
  }

  /**
   * Transforms content based on user's hardware type
   */
  private static transformByHardwareType(content: string, hardwareType: string): string {
    let transformed = content;

    // Define hardware-specific replacements based on user's hardware type
    let simulationReplacement = 'simulation';
    let developmentReplacement = 'development';

    switch (hardwareType) {
      case 'PC':
        simulationReplacement = 'PC-based simulation';
        developmentReplacement = 'PC-based development';
        break;
      case 'Jetson':
        simulationReplacement = 'Jetson-targeted simulation';
        developmentReplacement = 'Jetson-optimized development';
        break;
      case 'robot':
        simulationReplacement = 'real-robot testing';
        developmentReplacement = 'robot-integrated development';
        break;
      case 'cloud':
        simulationReplacement = 'cloud-based simulation';
        developmentReplacement = 'cloud-based development';
        break;
    }

    // Use a single pass to replace both terms for better performance
    transformed = transformed.replace(/\b(simulation|development)\b/gi, (match) => {
      const lowerMatch = match.toLowerCase();
      if (lowerMatch === 'simulation') {
        // Preserve original case if possible
        return match === 'Simulation' ?
          simulationReplacement.charAt(0).toUpperCase() + simulationReplacement.slice(1) :
          simulationReplacement;
      } else if (lowerMatch === 'development') {
        return match === 'Development' ?
          developmentReplacement.charAt(0).toUpperCase() + developmentReplacement.slice(1) :
          developmentReplacement;
      }
      return match;
    });

    return transformed;
  }

  /**
   * Transforms content based on user's robotics experience
   */
  private static transformByExperience(content: string, experience: string): string {
    let transformed = content;

    if (experience === 'none') {
      // Add beginner-friendly explanations for those with no robotics experience
      transformed = transformed.replace(/\b(robot|ROS)\b/gi, (match) => {
        const lowerMatch = match.toLowerCase();
        if (lowerMatch === 'robot') {
          return match === 'Robot' ?
            'Robot (a machine that can perform tasks automatically)' :
            'robot (a machine that can perform tasks automatically)';
        } else if (lowerMatch === 'ros') {
          return match === 'ROS' ?
            'ROS (Robot Operating System - a framework for robot software development)' :
            'ros (Robot Operating System - a framework for robot software development)';
        }
        return match;
      });
    } else if (experience === 'hobbyist' || experience === 'professional') {
      // Add experience-relevant content for hobbyist or professional
      const applicationsReplacement = experience === 'hobbyist'
        ? 'applications (perfect for your hobby projects)'
        : 'applications (with considerations for production environments)';

      transformed = transformed.replace(/\b(applications)\b/gi, (match) => {
        return match === 'Applications' ?
          applicationsReplacement.charAt(0).toUpperCase() + applicationsReplacement.slice(1) : // Capitalized version
          applicationsReplacement;
      });
    }

    return transformed;
  }

  /**
   * Applies all transformations to a chapter based on user profile
   */
  static personalizeChapter(chapterContent: string, profile: ProfileData): string {
    return this.transformContent(chapterContent, profile);
  }
}