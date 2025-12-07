# Research: Technology Decisions & Best Practices

**Feature**: AI-Native Book for Physical AI & Humanoid Robotics
**Date**: 2025-12-05
**Purpose**: Resolve technical unknowns before design phase

## 1. Docusaurus 3.x Setup

**Decision**: Use `npx create-docusaurus@latest` with TypeScript template and preset-classic configuration

**Rationale**:
- Official scaffolding tool ensures correct project structure and dependency versions
- TypeScript support provides type safety for configuration files (docusaurus.config.ts, sidebars.ts)
- Preset-classic includes docs plugin, theme-classic, and essential plugins out of the box
- Battle-tested starting point reduces configuration errors

**Alternatives Considered**:
- Manual setup from scratch: Rejected due to complexity and potential version mismatch issues
- Using Docusaurus 2.x: Rejected because 3.x has better performance, improved TypeScript support, and is the current stable release

**Implementation Notes**:
```bash
npx create-docusaurus@latest humanoid-robotics-book classic --typescript
cd humanoid-robotics-book
npm install
npm start # Verify setup at localhost:3000
```

**Key Configuration**:
- Set `organizationName` and `projectName` for GitHub Pages deployment
- Configure `baseUrl` as `/Humanoid_Robotics_Book/` (or repo name)
- Enable `onBrokenLinks: 'throw'` to catch broken internal links during build

**References**:
- https://docusaurus.io/docs/installation
- https://docusaurus.io/docs/typescript-support

---

## 2. Theme Customization

**Decision**: Use CSS custom properties (CSS variables) in `src/css/custom.css` for unified design system

**Rationale**:
- Docusaurus theme-classic exposes extensive CSS variables for colors, typography, spacing
- No need for complex theme swizzling or custom React components
- Maintains upgrade path for future Docusaurus versions
- Design tokens can be defined once and reused across light/dark modes

**Alternatives Considered**:
- Swizzling theme components: Rejected as too invasive and hard to maintain during Docusaurus upgrades
- CSS-in-JS (styled-components): Rejected as unnecessary complexity for static site
- Tailwind CSS: Rejected due to additional build configuration and deviation from Docusaurus conventions

**Implementation Notes**:
Define design system in `src/css/custom.css`:

```css
:root {
  /* Brand colors */
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  /* ... rest of primary shades */

  /* Typography */
  --ifm-font-family-base: 'Inter', -apple-system, system-ui, sans-serif;
  --ifm-font-size-base: 16px;
  --ifm-line-height-base: 1.65;

  /* Spacing scale */
  --ifm-spacing-horizontal: 1.5rem;
  --ifm-spacing-vertical: 1.5rem;

  /* Code blocks */
  --ifm-code-font-size: 95%;
  --ifm-code-background: #f6f8fa;

  /* Contrast ratios (WCAG 2.1 AA) */
  --ifm-color-emphasis-300: #555; /* 4.5:1 on white */
}

[data-theme='dark'] {
  --ifm-color-primary: #25c2a0;
  /* ... dark mode overrides */
}
```

**Color Palette Strategy**:
- Primary: Educational blue-green (trust, learning)
- Success/Tip: Green (#00a67e)
- Warning: Amber (#ffcc00)
- Danger/Error: Red (#d93025)
- Code: Soft gray backgrounds with high contrast text

**References**:
- https://docusaurus.io/docs/styling-layout
- https://infima.dev/ (Docusaurus CSS framework)

---

## 3. MDX Components

**Decision**: Create custom React components in `src/components/` and import them in MDX files

**Rationale**:
- MDX 3.x allows seamless mixing of Markdown and JSX
- Custom components provide consistent styling for callouts, diagrams, code blocks
- Reusable across all chapters without duplication
- Can be enhanced with interactivity (zoom, copy buttons) while maintaining accessibility

**Alternatives Considered**:
- Plain Markdown only: Rejected as insufficient for visual richness requirements (FR-007, FR-019)
- Docusaurus built-in Admonitions: Will use these for basic callouts, but custom components needed for specialized use cases

**Implementation Notes**:

**Component 1: Enhanced Callout (`src/components/Callout.tsx`)**
```typescript
interface CalloutProps {
  type: 'tip' | 'note' | 'warning' | 'danger' | 'info';
  title?: string;
  children: React.ReactNode;
}

export default function Callout({ type, title, children }: CalloutProps) {
  return (
    <div className={`callout callout--${type}`} role="note">
      {title && <div className="callout__title">{title}</div>}
      <div className="callout__content">{children}</div>
    </div>
  );
}
```

**Component 2: Diagram with Alt Text (`src/components/Diagram.tsx`)**
```typescript
interface DiagramProps {
  src: string;
  alt: string; // Required for accessibility (FR-011)
  caption?: string;
  maxWidth?: string;
}

export default function Diagram({ src, alt, caption, maxWidth = '100%' }: DiagramProps) {
  return (
    <figure className="diagram" style={{ maxWidth }}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
```

**Component 3: Versioned Code Block (metadata wrapper)**
- Use standard Docusaurus code blocks with metadata
- Add version info in comments (no custom component needed)

**Usage in MDX**:
```mdx
import Callout from '@site/src/components/Callout';
import Diagram from '@site/src/components/Diagram';

<Callout type="tip" title="Key Insight">
This is a helpful tip for readers.
</Callout>

<Diagram
  src="/img/diagrams/robot-architecture.svg"
  alt="Diagram showing robot system architecture with sensors, controller, and actuators"
  caption="Figure 1: Basic robot system architecture"
/>
```

**References**:
- https://docusaurus.io/docs/markdown-features/react
- https://mdxjs.com/docs/what-is-mdx/

---

## 4. Readability Scoring

**Decision**: Use `textstat` npm package with custom Node.js script for CI/CD validation

**Rationale**:
- `textstat` is a port of the popular Python library with Flesch Reading Ease scoring
- Provides programmatic API for scanning files and calculating scores
- Lightweight, no external service dependencies
- Can be integrated into npm scripts and GitHub Actions

**Alternatives Considered**:
- `flesch-kincaid` package: Rejected due to poor maintenance and limited features
- Online APIs (Readable.com): Rejected due to cost and CI/CD integration complexity
- Manual checking: Rejected as not scalable for 15-25 chapters

**Implementation Notes**:

Install dependency:
```bash
npm install --save-dev textstat
npm install --save-dev glob
```

Create script: `scripts/check-readability.js`
```javascript
const fs = require('fs');
const glob = require('glob');
const textstat = require('textstat');

const THRESHOLD = 60; // Flesch Reading Ease ≥60
let failedFiles = [];

// Scan all .md and .mdx files in docs/
glob.sync('docs/**/*.{md,mdx}').forEach(filepath => {
  const content = fs.readFileSync(filepath, 'utf8');

  // Strip frontmatter and code blocks for accurate scoring
  const cleanContent = content
    .replace(/^---[\s\S]*?---/, '') // Remove YAML frontmatter
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]*>/g, ''); // Remove JSX/HTML tags

  const score = textstat.fleschReadingEase(cleanContent);

  if (score < THRESHOLD) {
    failedFiles.push({ filepath, score: score.toFixed(1) });
  }
});

if (failedFiles.length > 0) {
  console.error(`\n❌ ${failedFiles.length} file(s) below readability threshold (${THRESHOLD}):\n`);
  failedFiles.forEach(({ filepath, score }) => {
    console.error(`   ${filepath}: ${score} (target: ≥${THRESHOLD})`);
  });
  process.exit(1);
} else {
  console.log(`✅ All files meet readability threshold (Flesch ≥${THRESHOLD})`);
}
```

Add npm script to `package.json`:
```json
{
  "scripts": {
    "readability-check": "node scripts/check-readability.js"
  }
}
```

**Manual Review Gate**: If technical terms cause low scores, reviewers can approve with justification (FR-013b)

**References**:
- https://www.npmjs.com/package/textstat
- https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests

---

## 5. GitHub Pages Deployment

**Decision**: Use `@docusaurus/plugin-gh-pages` with GitHub Actions workflow for automated deployment

**Rationale**:
- Official Docusaurus plugin handles deployment details (gh-pages branch, CNAME, etc.)
- GitHub Actions provides free CI/CD for public repositories
- Automatic deployment on push to main branch (FR-010)
- Can integrate readability and accessibility checks in same workflow

**Alternatives Considered**:
- Manual deployment with `npm run deploy`: Rejected as not automated (violates FR-013a requirement for CI/CD checks)
- Netlify/Vercel: Rejected due to "GitHub Pages only" constraint
- GitHub Actions with manual gh-pages setup: Rejected because plugin handles it better

**Implementation Notes**:

Configure `docusaurus.config.ts`:
```typescript
export default {
  url: 'https://[username].github.io',
  baseUrl: '/Humanoid_Robotics_Book/',
  organizationName: '[username]',
  projectName: 'Humanoid_Robotics_Book',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',
  // ...
};
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run readability checks
        run: npm run readability-check

      - name: Build website
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Repository Settings**:
- Enable Pages in repo settings
- Set source to "GitHub Actions" (not gh-pages branch)
- Deployment will be at: `https://[username].github.io/Humanoid_Robotics_Book/`

**References**:
- https://docusaurus.io/docs/deployment#deploying-to-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages

---

## 6. Accessibility Testing

**Decision**: Use Lighthouse CI in GitHub Actions with WCAG 2.1 AA thresholds

**Rationale**:
- Lighthouse is industry-standard for accessibility auditing
- Lighthouse CI provides automated checks in PR workflow
- Can set budget thresholds for accessibility score (≥90 for AA compliance)
- Free and well-maintained by Google Chrome team

**Alternatives Considered**:
- axe-core: Rejected as requires more setup; Lighthouse includes axe checks
- Pa11y: Rejected as Lighthouse more comprehensive and better documented
- Manual testing only: Rejected as not scalable (FR-013a requires automation)

**Implementation Notes**:

Install Lighthouse CI:
```bash
npm install --save-dev @lhci/cli
```

Create `lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./build",
      "numberOfRuns": 1
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:performance": ["warn", {"minScore": 0.85}],
        "categories:best-practices": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

Add to GitHub Actions (`.github/workflows/lighthouse.yml`):
```yaml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli autorun
```

**Manual Checklist** (beyond automation):
- Keyboard navigation through all interactive elements
- Screen reader testing (NVDA/JAWS) on sample chapters
- Color contrast verification with browser dev tools
- Alt text quality review (automation only checks presence, not quality)

**References**:
- https://github.com/GoogleChrome/lighthouse-ci
- https://www.w3.org/WAI/WCAG21/quickref/

---

## 7. Code Syntax Highlighting

**Decision**: Use Docusaurus default Prism.js with Dracula theme and extended language support

**Rationale**:
- Prism.js is bundled with Docusaurus by default (no additional setup)
- Supports 100+ languages including Python, JavaScript, TypeScript, Bash, JSON
- Dracula theme provides high contrast (accessibility) with pleasant colors
- Line numbers and highlighting work out of the box

**Alternatives Considered**:
- Highlight.js: Rejected because Prism is Docusaurus default
- Shiki: Rejected as overkill for static site (server-side rendering benefit not needed)

**Implementation Notes**:

Configure in `docusaurus.config.ts`:
```typescript
export default {
  themeConfig: {
    prism: {
      theme: prismThemes.github, // Light mode
      darkTheme: prismThemes.dracula, // Dark mode
      additionalLanguages: ['python', 'javascript', 'typescript', 'bash', 'json', 'yaml'],
    },
  },
};
```

**Usage in MDX**:
````mdx
```python title="robot_controller.py"
# Library: ROS 2 Humble v0.10.1
# Last updated: 2025-12-05

import rclpy
from rclpy.node import Node

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.get_logger().info('Controller initialized')
```
````

**Copy Button**: Enabled by default in Docusaurus 3.x (FR-003 requirement)

**References**:
- https://docusaurus.io/docs/markdown-features/code-blocks
- https://prismjs.com/

---

## 8. Responsive Images

**Decision**: Use standard HTML `<img>` with `srcset` for responsive serving + WebP format with PNG fallback

**Rationale**:
- Modern browsers support WebP (smaller file size, faster load)
- `srcset` attribute allows browser to choose appropriate resolution
- Docusaurus automatically copies static assets during build
- Simple implementation without additional build tools

**Alternatives Considered**:
- Image optimization plugins: Rejected as unnecessary complexity (manual optimization sufficient)
- Next.js Image component: Not applicable (different framework)
- AVIF format: Rejected due to limited browser support compared to WebP

**Implementation Notes**:

**Image Processing Workflow**:
1. Create diagrams in vector format (SVG preferred) or high-res PNG
2. Export to WebP using imagemagick or online tools
3. Optimize with target <200KB (use 85% quality for WebP)
4. Store in `/static/img/diagrams/`

**Usage with custom Diagram component**:
```tsx
<Diagram
  src="/img/diagrams/robot-architecture.webp"
  alt="Detailed description of robot system architecture showing sensors, processing units, and actuators with labeled connections"
  caption="Figure 1: Robot system architecture"
/>
```

**Mobile Optimization**:
- Use CSS `max-width: 100%` and `height: auto` for fluid sizing
- Test at 375px viewport width (SC-008)
- Provide high-contrast diagrams for small screens

**Command for batch WebP conversion**:
```bash
# ImageMagick
mogrify -format webp -quality 85 *.png

# Or use online tools: squoosh.app, compressor.io
```

**References**:
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
- https://web.dev/uses-webp-images/

---

## 9. Search Configuration

**Decision**: Use Docusaurus local search plugin (`@easyops-cn/docusaurus-search-local`) initially; consider Algolia DocSearch after launch

**Rationale**:
- Local search requires no external service or API keys
- Good performance for small-medium sites (15-25 chapters)
- Zero cost and no data sent to third parties
- Algolia DocSearch requires site to be public and indexed (not available pre-launch)

**Alternatives Considered**:
- Algolia DocSearch: Best-in-class but requires public site; migration path for future
- Lunr.js directly: Rejected as local search plugin wraps it better
- No search: Rejected as violates User Story 5 requirements

**Implementation Notes**:

Install plugin:
```bash
npm install --save @easyops-cn/docusaurus-search-local
```

Configure in `docusaurus.config.ts`:
```typescript
export default {
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],
};
```

**Migration Path to Algolia** (post-launch):
1. Apply for Algolia DocSearch program (free for open source docs)
2. Update config to use `@docusaurus/plugin-algolia`
3. Better relevance and performance for larger content volume

**Performance Target**: <500ms search response time (SC-004) - local search meets this

**References**:
- https://github.com/easyops-cn/docusaurus-search-local
- https://docusaurus.io/docs/search#using-algolia-docsearch

---

## 10. Version Pinning Strategy

**Decision**: Document library versions in code block comments with format: `# Library: [name] v[version]` and `# Last updated: [YYYY-MM-DD]`

**Rationale**:
- Simple and visible to readers without cluttering code
- Git tracks changes automatically
- Quarterly review process can use git grep to find outdated versions
- No need for separate metadata files or databases

**Alternatives Considered**:
- Separate YAML file mapping snippets to versions: Rejected as too complex to maintain
- Package.json style dependencies file: Rejected as not standard for documentation
- No version tracking: Rejected due to FR-012a requirement

**Implementation Notes**:

**Code Snippet Template**:
````python
```python title="example.py"
# Library: tensorflow v2.15.0
# Last updated: 2025-12-05
# Tested on: Python 3.11

import tensorflow as tf

def create_model():
    """Simple neural network model."""
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    return model
```
````

**Quarterly Review Process** (FR-012b):
1. Create GitHub issue: "Q[1-4] 2025 Code Review"
2. Run: `git grep "# Last updated" docs/` to list all snippets
3. Test each example against latest library versions
4. Update version comments and last-updated dates
5. Document breaking changes in issue
6. Commit with message: "chore: quarterly code example review Q[1-4] 2025"

**Version Selection Strategy**:
- Use stable releases, not pre-release or beta
- Prefer LTS versions where available (e.g., Node.js 18 LTS)
- Pin to minor version (e.g., 2.15.x) for stability
- Document reason if using older version (e.g., "2.10.0 for ROS compatibility")

**References**:
- No external references needed (custom convention)

---

## Summary: Technology Stack

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Docusaurus | 3.1.x | Industry standard for technical docs, excellent DX |
| **Content** | Markdown + MDX | 3.x | Simple authoring with React component flexibility |
| **Language** | TypeScript | 5.x | Type safety for configuration and components |
| **Styling** | CSS Variables | - | Docusaurus native, maintainable design system |
| **Components** | React | 18.x | Docusaurus requirement, reusable UI elements |
| **Code Highlighting** | Prism.js | Built-in | Excellent syntax support, accessible themes |
| **Readability** | textstat | Latest | Automated Flesch scoring in CI/CD |
| **Deployment** | GitHub Actions + Pages | - | Free, automated, integrated with repo |
| **Accessibility** | Lighthouse CI | Latest | WCAG 2.1 AA compliance validation |
| **Search** | Local search plugin | Latest | Zero-cost, good performance for 15-25 chapters |
| **Images** | WebP + SVG | - | Optimal size/quality balance, modern format |

**All research questions resolved ✅** - Ready for Phase 1 design artifacts.
