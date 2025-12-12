// Chapter model representing a distinct section of the Humanoid Robotics Book

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  content: string; // Original chapter content in Markdown format
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface PersonalizedContent {
  id: string;
  userId: string; // References the user for whom the content is personalized
  chapterId: string; // References the original chapter
  content: string; // Personalized chapter content in Markdown format
  profileSnapshot: {
    softwareSkillLevel: 'beginner' | 'intermediate' | 'expert';
    hardwareType: 'cloud' | 'PC' | 'Jetson' | 'robot';
    preferredLanguage: string;
    roboticsExperience: 'none' | 'hobbyist' | 'professional';
  };
  createdAt: Date;
  updatedAt: Date;
  cacheExpiry: Date; // When this cached content expires
}

// Mock data for initial testing
export const mockChapters: Chapter[] = [
  {
    id: 'ch1-intro-ros2',
    title: 'Introduction to ROS 2',
    slug: 'intro-ros2',
    content: `# Introduction to ROS 2\n\nROS 2 (Robot Operating System 2) is a flexible framework for writing robot software. It is a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robot platforms.\n\n## Key Concepts\n\n- Nodes\n- Topics\n- Services\n- Actions\n\nThis chapter provides a comprehensive overview of ROS 2 architecture and basic concepts.`,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    status: 'published'
  },
  {
    id: 'ch2-digital-twin',
    title: 'Digital Twin Concepts',
    slug: 'digital-twin',
    content: `# Digital Twin in Robotics\n\nA digital twin is a virtual representation that serves as the real-time digital counterpart of a physical object or process. In robotics, digital twins enable simulation, testing, and optimization of robotic systems before deployment.\n\n## Applications\n\n- Simulation\n- Testing\n- Optimization\n- Maintenance\n\nThis chapter explores how digital twins are used in robotics applications.`,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    status: 'published'
  }
];