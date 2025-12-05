import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import HomepageHero from '@site/src/components/HomepageHero';
import ModuleGrid from '@site/src/components/ModuleGrid';
import BookFeatures from '@site/src/components/BookFeatures';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="A comprehensive guide to Physical AI & Humanoid Robotics with ROS 2, Isaac Sim, and Vision-Language-Action Models.">
      <HomepageHero />
      <main>
        <ModuleGrid />
        <BookFeatures />
      </main>
    </Layout>
  );
}
