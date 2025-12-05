import React from 'react';
import styles from './styles.module.css';

const features = [
  {
    icon: '📚',
    title: 'Comprehensive & Structured',
    description:
      'Four modules covering ROS 2, simulation, perception, and VLA models. Each module builds on the previous, taking you from fundamentals to advanced implementations.',
  },
  {
    icon: '💻',
    title: 'Hands-On Projects',
    description:
      'Learn by building real robotic systems. Create walking gaits, implement vision pipelines, and deploy AI models on simulated humanoid robots.',
  },
  {
    icon: '🎯',
    title: 'Beginner-Friendly',
    description:
      'No prior robotics experience required. Clear explanations, step-by-step tutorials, and detailed code examples guide you through complex concepts.',
  },
  {
    icon: '🚀',
    title: 'Industry-Standard Tools',
    description:
      'Master ROS 2 Humble, NVIDIA Isaac Sim, Gazebo, and modern VLA frameworks. Learn the same tools used by robotics companies worldwide.',
  },
  {
    icon: '🔬',
    title: 'Theory Meets Practice',
    description:
      'Understand the "why" behind implementations. Each concept includes theoretical foundations, practical examples, and real-world applications.',
  },
  {
    icon: '🌐',
    title: 'Cloud & Local Paths',
    description:
      'Flexible learning paths for different setups. Run locally with powerful hardware, use WSL2, or leverage cloud platforms for computationally intensive tasks.',
  },
  {
    icon: '🧪',
    title: 'Test-Driven Development',
    description:
      'Build reliable robotic systems with proper testing strategies. Learn unit tests, integration tests, and simulation-based validation.',
  },
  {
    icon: '📖',
    title: 'Open Source & Free',
    description:
      'Completely free and open source. Contribute improvements, report issues, and join a growing community of robotics enthusiasts and professionals.',
  },
];

export default function BookFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why This Book?</h2>
          <p className={styles.subtitle}>
            A modern, comprehensive guide designed for the next generation of robotics engineers
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
