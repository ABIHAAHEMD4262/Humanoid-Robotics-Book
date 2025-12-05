import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics Book',
  tagline: 'Embodied Intelligence with ROS 2, Isaac Sim, and Vision-Language-Action Models',
  favicon: 'img/favicon.ic',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ABIHAAHEMD4262.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Humanoid-Robotics-Book/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ABIHAAHEMD4262', // Usually your GitHub org/user name.
  projectName: 'Humanoid-Robotics-Book', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
            // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: "/docs",
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: 'Book',
        },
        // {to: '/blog', label: 'Blog', position: 'left'}, // Removed as per plan
        {
          href: 'https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Content',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Module 1: ROS 2',
              to: '/docs/module1-ros2/',
            },
            {
              label: 'Module 2: Digital Twin',
              to: '/docs/module2-digital-twin/',
            },
            {
              label: 'Appendices',
              to: '/docs/appendices/',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Hardware Guide',
              to: '/docs/appendices/hardware-guide',
            },
            {
              label: 'DevContainer Setup',
              to: '/docs/appendices/devcontainer-docker-setup',
            },
            {
              label: 'Cloud Path',
              to: '/docs/appendices/cloud-path',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book/discussions',
            },
            {
              label: 'Report Issues',
              href: 'https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book/issues',
            },
            {
              label: 'Contribute',
              href: 'https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book',
            },
          ],
        },
        {
          title: 'External',
          items: [
            {
              label: 'ROS 2 Documentation',
              href: 'https://docs.ros.org/en/humble/',
            },
            {
              label: 'NVIDIA Isaac',
              href: 'https://developer.nvidia.com/isaac-sim',
            },
            {
              label: 'Gazebo',
              href: 'https://gazebosim.org/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Book. Built with ❤️ and Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
