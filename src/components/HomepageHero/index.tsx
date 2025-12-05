import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function HomepageHero(): JSX.Element {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroImage}>
          <img
            src="img/hero-image2.png"
            alt="Humanoid Robot Illustration"
            className={styles.robotImage}
          />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Master Physical AI & Humanoid Robotics
          </h1>
          <p className={styles.heroSubtitle}>
            A comprehensive, hands-on guide to building intelligent robots that interact with the physical world.
            Learn ROS 2, digital twin simulation, and vision-language-action models through practical projects.
          </p>
          <div className={styles.heroDescription}>
            <p>
              This book takes you from fundamentals to advanced implementations, covering:
            </p>
            <ul>
              <li>🤖 <strong>ROS 2 Development</strong> - Master the robotic nervous system</li>
              <li>🎮 <strong>Digital Twin Simulation</strong> - Build virtual replicas with Isaac Sim & Gazebo</li>
              <li>🧠 <strong>Vision-Language-Action Models</strong> - Integrate AI with physical control</li>
              <li>🚶 <strong>Real-World Projects</strong> - Walking gaits, manipulation, and embodied AI</li>
            </ul>
          </div>
          <div className={styles.buttonGroup}>
            <Link
              className="button button--primary button--lg"
              to="/docs/intro">
              📖 Start Reading
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/module1-ros2/">
              🚀 Jump to Module 1
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
