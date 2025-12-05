/**
 * TypeScript schema for homepage components
 * Feature: AI-Native Book for Physical AI & Humanoid Robotics
 *
 * Used in: src/pages/index.tsx
 */

export interface HeroSection {
  /** Main heading displayed prominently (H1) */
  title: string; // 5-60 characters

  /** Subtitle/tagline below title */
  tagline: string; // 20-150 characters

  /** Primary call-to-action button */
  primaryCTA: CallToAction;

  /** Optional secondary button */
  secondaryCTA?: CallToAction;

  /** Background image or gradient (optional) */
  backgroundImage?: string;
}

export interface CallToAction {
  /** Button text */
  label: string; // 5-25 characters

  /** Target URL or doc ID */
  link: string;

  /** Visual style */
  variant: 'primary' | 'secondary' | 'outline';

  /** Optional icon before label */
  icon?: string; // Emoji or icon name
}

export interface FeatureCard {
  /** Icon or emoji representing the feature */
  icon: string; // Emoji (🤖) or SVG path

  /** Feature name/title */
  title: string; // 5-40 characters

  /** Brief description */
  description: string; // 30-150 characters (1-2 sentences)

  /** Optional link to learn more */
  link?: string;
}

export interface HomepageData {
  /** Hero section at top of page */
  hero: HeroSection;

  /** Feature highlights (3-6 cards) */
  features: FeatureCard[]; // Min: 3, Max: 6

  /** Optional stats or metrics section */
  stats?: StatisticCard[];
}

export interface StatisticCard {
  /** Numeric value */
  value: string; // e.g., "25", "100%"

  /** Label explaining the statistic */
  label: string; // e.g., "Chapters", "Code Examples"

  /** Optional icon */
  icon?: string;
}

/**
 * Example implementation data
 */
export const exampleHomepageData: HomepageData = {
  hero: {
    title: 'Master Physical AI & Humanoid Robotics',
    tagline: 'A beginner-friendly guide to embodied intelligence, from foundational concepts to real-world applications',
    primaryCTA: {
      label: 'Start Learning',
      link: '/docs/intro',
      variant: 'primary',
      icon: '🚀',
    },
    secondaryCTA: {
      label: 'View on GitHub',
      link: 'https://github.com/username/Humanoid_Robotics_Book',
      variant: 'secondary',
      icon: '⭐',
    },
  },
  features: [
    {
      icon: '🤖',
      title: 'Beginner-Friendly',
      description: 'Clear explanations with analogies and examples for readers with no AI background.',
    },
    {
      icon: '💻',
      title: 'Hands-On Code',
      description: 'Executable examples with version-pinned libraries you can run yourself.',
    },
    {
      icon: '📊',
      title: 'Visual Learning',
      description: 'Diagram-rich content to understand complex systems at a glance.',
    },
    {
      icon: '🎯',
      title: 'Comprehensive Coverage',
      description: '15-25 chapters organized by topic, from fundamentals to advanced concepts.',
    },
    {
      icon: '✅',
      title: 'Quality Assured',
      description: 'All content meets readability standards and accessibility guidelines.',
    },
    {
      icon: '📖',
      title: 'Always Up-to-Date',
      description: 'Quarterly code example reviews ensure current best practices.',
    },
  ],
  stats: [
    {
      value: '20+',
      label: 'Chapters',
      icon: '📚',
    },
    {
      value: '50+',
      label: 'Code Examples',
      icon: '💻',
    },
    {
      value: '100%',
      label: 'Free & Open',
      icon: '🆓',
    },
  ],
};

/**
 * Validation rules (from requirements)
 */
export const validationRules = {
  hero: {
    title: {
      minLength: 5,
      maxLength: 60,
    },
    tagline: {
      minLength: 20,
      maxLength: 150,
    },
  },
  cta: {
    label: {
      minLength: 5,
      maxLength: 25,
    },
  },
  feature: {
    title: {
      minLength: 5,
      maxLength: 40,
    },
    description: {
      minLength: 30,
      maxLength: 150,
    },
  },
  features: {
    minCount: 3,
    maxCount: 6,
  },
};
