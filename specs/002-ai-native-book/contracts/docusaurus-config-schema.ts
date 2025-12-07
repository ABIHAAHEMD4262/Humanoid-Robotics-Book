/**
 * Docusaurus configuration schema with type definitions
 * Feature: AI-Native Book for Physical AI & Humanoid Robotics
 *
 * Based on: @docusaurus/types Config interface
 */

import type {Config} from '@docusaurus/types';
import type {Options as PresetClassicOptions} from '@docusaurus/preset-classic';

/**
 * Main Docusaurus configuration structure
 */
export interface DocusaurusConfig extends Config {
  /** Site metadata */
  title: string;
  tagline: string;
  favicon: string;
  url: string;
  baseUrl: string;

  /** GitHub deployment config */
  organizationName: string;
  projectName: string;
  deploymentBranch?: string;
  trailingSlash?: boolean;

  /** Build behavior */
  onBrokenLinks: 'throw' | 'warn' | 'ignore';
  onBrokenMarkdownLinks: 'throw' | 'warn' | 'ignore';

  /** Internationalization (i18n) */
  i18n: I18nConfig;

  /** Presets and plugins */
  presets: Array<[string, PresetClassicOptions]>;
  themes?: Array<string | [string, any]>;
  plugins?: Array<string | [string, any]>;

  /** Theme configuration */
  themeConfig: ThemeConfig;
}

export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
}

export interface ThemeConfig {
  /** Color mode (light/dark) */
  colorMode: ColorModeConfig;

  /** Navigation bar */
  navbar: NavbarConfig;

  /** Footer */
  footer: FooterConfig;

  /** Syntax highlighting (Prism.js) */
  prism: PrismConfig;

  /** Metadata */
  metadata?: Array<{name: string; content: string}>;

  /** Docs sidebar behavior */
  docs?: {
    sidebar: {
      hideable: boolean;
      autoCollapseCategories: boolean;
    };
  };
}

export interface ColorModeConfig {
  defaultMode: 'light' | 'dark';
  disableSwitch: boolean;
  respectPrefersColorScheme: boolean;
}

export interface NavbarConfig {
  title: string;
  logo?: {
    alt: string;
    src: string;
    srcDark?: string;
  };
  items: NavbarItem[];
  hideOnScroll?: boolean;
}

export interface NavbarItem {
  type?: 'default' | 'doc' | 'dropdown' | 'docsVersion';
  label?: string;
  to?: string;
  href?: string;
  position: 'left' | 'right';
  items?: NavbarItem[]; // For dropdown
}

export interface FooterConfig {
  style: 'dark' | 'light';
  links: FooterLinkGroup[];
  copyright: string;
}

export interface FooterLinkGroup {
  title: string;
  items: FooterLink[];
}

export interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

export interface PrismConfig {
  theme: any; // PrismTheme type
  darkTheme: any;
  additionalLanguages: string[];
  defaultLanguage?: string;
}

/**
 * Example configuration for Physical AI & Humanoid Robotics book
 */
export const exampleConfig: Partial<DocusaurusConfig> = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A beginner-friendly guide to embodied intelligence',
  favicon: 'img/favicon.ico',

  url: 'https://username.github.io',
  baseUrl: '/Humanoid_Robotics_Book/',

  organizationName: 'username',
  projectName: 'Humanoid_Robotics_Book',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw', // Fail build on broken links (FR-017)
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Physical AI & Robotics',
      logo: {
        alt: 'Robot Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Book',
        },
        {
          href: 'https://github.com/username/Humanoid_Robotics_Book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Fundamentals',
              to: '/docs/fundamentals/what-is-physical-ai',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/username/Humanoid_Robotics_Book/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/username/Humanoid_Robotics_Book/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/username/Humanoid_Robotics_Book',
            },
            {
              label: 'License: CC-BY-4.0',
              href: 'https://creativecommons.org/licenses/by/4.0/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Book. Built with Docusaurus.`,
    },

    prism: {
      theme: 'prism-themes/themes/prism-github', // Light mode
      darkTheme: 'prism-themes/themes/prism-dracula', // Dark mode
      additionalLanguages: ['python', 'javascript', 'typescript', 'bash', 'json', 'yaml'],
      defaultLanguage: 'python',
    },

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false, // Keep all categories expanded for easier navigation
      },
    },

    metadata: [
      {name: 'keywords', content: 'physical ai, robotics, humanoid, embodied intelligence, machine learning'},
      {name: 'description', content: 'A comprehensive, beginner-friendly guide to Physical AI and Humanoid Robotics'},
    ],
  },
};

/**
 * Plugin configurations
 */
export interface SearchPluginConfig {
  hashed: boolean;
  language: string[];
  highlightSearchTermsOnTargetPage: boolean;
  explicitSearchResultPath: boolean;
}

export const searchPluginConfig: SearchPluginConfig = {
  hashed: true,
  language: ['en'],
  highlightSearchTermsOnTargetPage: true,
  explicitSearchResultPath: true,
};
