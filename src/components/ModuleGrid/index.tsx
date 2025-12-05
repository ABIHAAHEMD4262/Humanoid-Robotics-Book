import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const modules = [
  {
    title: 'Module 1: The Robotic Nervous System (ROS 2)',
    icon: '🧠',
    description: 'Master ROS 2, the communication framework that powers modern robots. Learn nodes, topics, services, and actions.',
    link: '/docs/module1-ros2/',
    chapters: 5,
    time: '12 hours',
    difficulty: 'Beginner to Intermediate',
    available: true,
  },
  {
    title: 'Module 2: Digital Twin & Simulation',
    icon: '🎮',
    description: 'Build virtual replicas of robots using Isaac Sim and Gazebo. Test algorithms safely before deploying to hardware.',
    link: '/docs/module2-digital-twin/',
    chapters: 4,
    time: '10 hours',
    difficulty: 'Intermediate',
    available: true,
  },
  {
    title: 'Module 3: Perception & Vision',
    icon: '👁️',
    description: 'Implement computer vision pipelines. Process camera and depth data for object detection, tracking, and scene understanding.',
    link: '#',
    chapters: 4,
    time: '10 hours',
    difficulty: 'Intermediate',
    available: false,
  },
  {
    title: 'Module 4: Vision-Language-Action Models',
    icon: '🤖',
    description: 'Integrate large language models with robotic control. Build embodied AI agents that understand and execute natural language commands.',
    link: '#',
    chapters: 5,
    time: '14 hours',
    difficulty: 'Advanced',
    available: false,
  },
];

export default function ModuleGrid(): JSX.Element {
  return (
    <section className={styles.modules}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Learning Modules</h2>
          <p className={styles.subtitle}>
            Four comprehensive modules that take you from ROS 2 basics to building intelligent humanoid robots
          </p>
        </div>
        <div className={styles.grid}>
          {modules.map((module, idx) => (
            module.available ? (
              <Link
                key={idx}
                to={module.link}
                className={styles.moduleCard}>
                <div className={styles.moduleIcon}>{module.icon}</div>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
                <div className={styles.moduleMetadata}>
                  <span className={styles.metadataItem}>
                    📚 {module.chapters} Chapters
                  </span>
                  <span className={styles.metadataItem}>
                    ⏱️ {module.time}
                  </span>
                  <span className={styles.metadataItem}>
                    📊 {module.difficulty}
                  </span>
                </div>
                <div className={styles.moduleArrow}>→</div>
              </Link>
            ) : (
              <div
                key={idx}
                className={`${styles.moduleCard} ${styles.comingSoon}`}>
                <div className={styles.moduleIcon}>{module.icon}</div>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
                <div className={styles.moduleMetadata}>
                  <span className={styles.metadataItem}>
                    📚 {module.chapters} Chapters
                  </span>
                  <span className={styles.metadataItem}>
                    ⏱️ {module.time}
                  </span>
                  <span className={styles.metadataItem}>
                    📊 {module.difficulty}
                  </span>
                </div>
                <div className={styles.comingSoonBadge}>🚧 Coming Soon</div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
