// PersonalizedContent model storing personalized versions of chapters for specific users

// Mock data for initial testing
export const mockPersonalizedContent = [
  {
    id: 'pc1-user1-ch1',
    userId: 'user1',
    chapterId: 'ch1-intro-ros2',
    content: `# Introduction to ROS 2 (Personalized)\n\nROS 2 (Robot Operating System 2) is a flexible framework for writing robot software. Since you're a beginner with a PC setup, we'll focus on getting you started with the basics.\n\n## Key Concepts for Beginners\n\n- **Nodes**: The basic unit of computation in ROS 2\n- **Topics**: How nodes communicate with each other\n- **Services**: Request/response communication\n- **Actions**: Goal-oriented communication\n\nThis chapter provides a beginner-friendly overview of ROS 2 architecture and basic concepts, tailored for PC-based development.`,
    profileSnapshot: {
      softwareSkillLevel: 'beginner',
      hardwareType: 'PC',
      preferredLanguage: 'English',
      roboticsExperience: 'none'
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    cacheExpiry: new Date(Date.now() + 3600000) // 1 hour from now
  }
];