# Data Model: Content Structure & Entities

**Feature**: AI-Native Book for Physical AI & Humanoid Robotics
**Date**: 2025-12-05
**Purpose**: Define content entities, relationships, and validation rules for Docusaurus book

## Overview

This data model describes the structure of book content as Markdown/MDX files and JSON metadata. All entities are file-based (no database) and managed through Git version control.

## Core Entities

### 1. Module

**Description**: Top-level content grouping representing a major topic area

**Attributes**:
- `label` (string, required): Display name in sidebar (e.g., "Fundamentals of Physical AI")
- `position` (integer, required): Order in sidebar (1-based)
- `link` (object, optional): Custom link behavior
  - `type`: "generated-index" | "doc"
  - `slug`: URL path segment
- `collapsed` (boolean, default: true): Whether module starts collapsed in sidebar
- `collapsible` (boolean, default: true): Whether module can be collapsed

**File Representation**: `docs/[module-slug]/_category_.json`

**Example**:
```json
{
  "label": "Fundamentals of Physical AI",
  "position": 1,
  "link": {
    "type": "generated-index",
    "slug": "/fundamentals"
  },
  "collapsed": false,
  "collapsible": true
}
```

**Relationships**:
- 1:N with Chapter (one module contains multiple chapters)

**Validation Rules**:
- Position must be unique across all modules
- Label must be 2-50 characters
- Slug must be URL-safe (lowercase, hyphens only)

---

### 2. Chapter

**Description**: Individual content page covering a specific topic

**Attributes**:
- `id` (string, auto-generated): Filename without extension (e.g., "what-is-physical-ai")
- `title` (string, required): H1 heading and page title (e.g., "What is Physical AI?")
- `sidebar_label` (string, optional): Shorter title for sidebar (defaults to title)
- `sidebar_position` (integer, required): Order within module (1-based)
- `description` (string, optional): Meta description for SEO (150-160 chars)
- `keywords` (array[string], optional): SEO keywords
- `slug` (string, optional): Custom URL path (defaults to id)
- `tags` (array[string], optional): Content tags for filtering/grouping
- `difficulty` (enum, required): "Beginner" | "Intermediate" | "Advanced"
- `estimated_reading_time` (integer, calculated): Minutes (auto-calculated by Docusaurus)
- `prerequisites` (array[string], optional): IDs of prerequisite chapters

**File Representation**:
- Path: `docs/[module-slug]/[chapter-id].md` or `.mdx`
- Frontmatter: YAML between `---` delimiters
- Content: Markdown/MDX body

**Example**:
```mdx
---
sidebar_position: 1
sidebar_label: What is Physical AI?
description: Introduction to Physical AI and embodied intelligence concepts
keywords: [physical ai, robotics, embodied intelligence]
tags: [fundamentals, introduction]
---

# What is Physical AI?

**Estimated Reading Time**: 8 minutes
**Prerequisites**: None
**Difficulty**: Beginner

[Content body...]
```

**Relationships**:
- N:1 with Module (chapter belongs to one module)
- 1:N with Code Snippet (chapter contains multiple code examples)
- 1:N with Diagram (chapter contains multiple images/diagrams)
- 1:N with Example (chapter contains multiple examples/analogies)
- 1:N with Callout Box (chapter contains multiple callouts)
- N:N with Chapter (prerequisite relationships)

**Validation Rules** (from FR-002, FR-003):
- **MUST** contain ≥2 Example entities
- **MUST** contain ≥1 Code Snippet entity
- **MUST** achieve Flesch Reading Ease ≥60 for main body text
- Title must be 5-80 characters
- Description must be 120-160 characters (if provided)
- Sidebar position must be unique within module
- Difficulty must be one of the three enum values

---

### 3. Code Snippet

**Description**: Executable code example within a chapter

**Attributes**:
- `language` (string, required): Programming language (e.g., "python", "javascript", "bash")
- `title` (string, optional): Filename or description shown above code block
- `library_name` (string, required): Primary library/framework used
- `library_version` (string, required): Semantic version (e.g., "2.15.0")
- `last_updated` (date, required): ISO 8601 date (YYYY-MM-DD)
- `tested_on` (string, optional): Runtime environment (e.g., "Python 3.11", "Node.js 18")
- `show_line_numbers` (boolean, default: true): Display line numbers
- `highlight_lines` (array[range], optional): Lines to highlight (e.g., [[1,3], [5]])
- `inline_comments` (boolean, required): Must have explanatory comments (FR-012)

**File Representation**: Embedded in chapter MDX file as fenced code block

**Example**:
````mdx
```python title="robot_controller.py" {2-4}
# Library: ROS 2 Humble v0.10.1
# Last updated: 2025-12-05
# Tested on: Python 3.11

import rclpy
from rclpy.node import Node

class RobotController(Node):
    """
    Basic robot controller node.
    Initializes ROS 2 node and logs startup message.
    """
    def __init__(self):
        super().__init__('robot_controller')  # Initialize with node name
        self.get_logger().info('Controller initialized')  # Log to console

def main(args=None):
    rclpy.init(args=args)
    controller = RobotController()
    rclpy.spin(controller)  # Keep node running
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```
````

**Relationships**:
- N:1 with Chapter (code snippet belongs to one chapter)

**Validation Rules** (from FR-012, FR-012a, FR-012b):
- **MUST** include library_name and library_version in comments
- **MUST** include last_updated date in comments
- **MUST** contain inline comments explaining purpose and key logic
- Language must be supported by Prism.js
- Version must follow semver format (X.Y.Z)
- Last updated must be ≤3 months old (triggers quarterly review)

---

### 4. Diagram

**Description**: Visual representation of concepts, architectures, or workflows

**Attributes**:
- `src` (string, required): Path to image file (e.g., "/img/diagrams/robot-arch.webp")
- `alt` (string, required): Descriptive alt text for accessibility (FR-011)
- `caption` (string, optional): Figure caption displayed below image
- `max_width` (string, optional): CSS max-width value (default: "100%")
- `format` (enum, required): "svg" | "webp" | "png"
- `file_size_kb` (integer, required): File size in kilobytes
- `loading` (enum, default: "lazy"): "lazy" | "eager"

**File Representation**:
- Image file: `static/img/diagrams/[filename].[format]`
- Reference: Custom `<Diagram>` component in MDX

**Example**:
```mdx
<Diagram
  src="/img/diagrams/robot-architecture.webp"
  alt="System architecture diagram showing three main components: Sensors (cameras, lidar, IMU) feeding data to Central Controller, which sends commands to Actuators (motors, servos). Bidirectional arrows indicate feedback loops."
  caption="Figure 1: Basic robot system architecture with sensor-controller-actuator loop"
  maxWidth="600px"
/>
```

**Relationships**:
- N:1 with Chapter (diagram belongs to one chapter)

**Validation Rules** (from FR-011, Performance constraints):
- **MUST** have descriptive alt text (not "image" or filename)
- Alt text must be 20-250 characters and describe content, not appearance
- File size **MUST** be ≤200KB (SC-004, performance constraint)
- Format must be WebP or SVG (PNG only for compatibility fallback)
- Max width should prevent overflow on mobile (≥375px viewport)

---

### 5. Example

**Description**: Real-world scenario, analogy, or case study illustrating a concept

**Attributes**:
- `type` (enum, required): "analogy" | "scenario" | "case-study"
- `title` (string, required): Short title (e.g., "Self-Driving Car Analogy")
- `context` (string, required): Setup or background (2-3 sentences)
- `explanation` (string, required): How it relates to the concept (2-5 sentences)
- `takeaway` (string, required): Key learning point (1-2 sentences)

**File Representation**: Embedded in chapter as Markdown section with header

**Example Structure**:
```mdx
### Example 1: Robot Vision as Human Vision

**Type**: Analogy

**Context**: Understanding how robots "see" can be challenging for beginners. We can compare robot vision systems to human eyes and brain.

**Explanation**: Just as human eyes capture light and send signals to the brain for processing, robot cameras capture images and send them to a computer vision system. The brain recognizes objects and patterns; similarly, the vision system uses machine learning models to detect and classify objects. Both systems adapt to different lighting conditions and can track moving objects.

**Takeaway**: Robot vision systems mimic human visual processing but use cameras and algorithms instead of eyes and neurons.
```

**Relationships**:
- N:1 with Chapter (example belongs to one chapter)

**Validation Rules** (from FR-002):
- Chapter **MUST** contain ≥2 Example entities
- Type must be one of the three enum values
- Title must be 5-50 characters
- Context must be ≥50 characters
- Explanation must be ≥100 characters
- Takeaway must be 20-150 characters

---

### 6. Callout Box

**Description**: Highlighted content block drawing attention to important information

**Attributes**:
- `type` (enum, required): "tip" | "note" | "warning" | "danger" | "info"
- `title` (string, optional): Custom heading (defaults to type label)
- `content` (string, required): Body text in Markdown format
- `icon` (string, auto): Emoji or icon based on type

**File Representation**: Docusaurus Admonition syntax or custom `<Callout>` component

**Example** (Docusaurus native):
```mdx
:::tip Key Insight
Physical AI combines robotics (embodied hardware) with artificial intelligence (decision-making software) to create systems that interact with the physical world.
:::
```

**Example** (Custom component):
```mdx
<Callout type="warning" title="Common Pitfall">
Don't confuse sensor calibration with sensor fusion. Calibration adjusts sensor accuracy; fusion combines multiple sensor data streams.
</Callout>
```

**Type Semantics**:
- **tip**: Helpful advice or best practice (green, lightbulb icon)
- **note**: Additional information or clarification (blue, info icon)
- **warning**: Important caution or potential issue (amber, warning icon)
- **danger**: Critical warning or error to avoid (red, danger icon)
- **info**: Neutral supplementary information (gray, document icon)

**Relationships**:
- N:1 with Chapter (callout belongs to one chapter)

**Validation Rules** (from FR-019):
- Type must be one of the five enum values
- Content must be ≥20 characters
- Color scheme must match design system (FR-020)
- Contrast ratio must be ≥4.5:1 (WCAG 2.1 AA)

---

### 7. Homepage

**Description**: Landing page with hero section and navigation

**Attributes**:
- `hero.title` (string, required): Main heading
- `hero.tagline` (string, required): Subtitle/description
- `hero.primary_cta` (object, required): Primary call-to-action button
  - `label`: Button text
  - `link`: URL or doc ID
- `hero.secondary_cta` (object, optional): Secondary button
- `features` (array[FeatureCard], optional): Feature highlights (3-6 cards)

**FeatureCard**:
- `icon` (string, required): SVG path or emoji
- `title` (string, required): Feature name
- `description` (string, required): Brief explanation (1-2 sentences)

**File Representation**: `src/pages/index.tsx` (React component)

**Example Data**:
```typescript
{
  hero: {
    title: "Master Physical AI & Humanoid Robotics",
    tagline: "A beginner-friendly guide to embodied intelligence, from foundational concepts to real-world applications",
    primaryCTA: { label: "Start Learning", link: "/docs/intro" },
    secondaryCTA: { label: "View on GitHub", link: "https://github.com/..." }
  },
  features: [
    {
      icon: "🤖",
      title: "Beginner-Friendly",
      description: "Clear explanations with analogies and examples for readers with no AI background"
    },
    {
      icon: "💻",
      title: "Hands-On Code",
      description: "Executable examples with version-pinned libraries you can run yourself"
    },
    {
      icon: "📊",
      title: "Visual Learning",
      description: "Diagram-rich content to understand complex systems at a glance"
    }
  ]
}
```

**Relationships**: None (top-level entity)

**Validation Rules** (from FR-006, FR-015):
- Hero title must be 5-60 characters
- Tagline must be 20-150 characters
- Primary CTA required, secondary optional
- Features array must have 3-6 items
- Must be responsive (≥375px viewport)

---

### 8. Sidebar Navigation

**Description**: Hierarchical menu structure for chapter navigation

**Attributes**:
- `type` (enum, required): "category" | "doc" | "link"
- `label` (string, required): Display text
- `items` (array[SidebarItem], for category): Nested children
- `link` (object, optional): Category link behavior
- `collapsed` (boolean, default: true): Initial collapse state

**File Representation**: `sidebars.ts` (TypeScript configuration)

**Example**:
```typescript
export default {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Fundamentals',
      collapsed: false,
      items: [
        'fundamentals/what-is-physical-ai',
        'fundamentals/embodied-intelligence',
        'fundamentals/key-challenges',
      ],
    },
    // ...
  ],
};
```

**Relationships**:
- 1:N with Module (sidebar contains multiple module categories)
- 1:N with Chapter (sidebar links to chapters)

**Validation Rules** (from FR-014):
- Depth must be ≤3 levels (Module → Chapter → Subsection)
- Labels must be 2-40 characters
- Chapter order must follow logical progression (beginner → advanced)
- All doc IDs must reference existing chapter files

---

## Entity Relationships Diagram

```
Homepage
(landing page)

Sidebar Navigation ──────┐
         │               │
         │ references    │ organizes
         │               │
         ↓               ↓
      Module (1) ──── (N) Chapter
  (_category_.json)       (.md/.mdx)
                           │
                           │ contains (1:N)
                           ├──→ Code Snippet
                           │    (fenced code block)
                           │
                           ├──→ Diagram
                           │    (<Diagram> component)
                           │
                           ├──→ Example
                           │    (markdown section)
                           │
                           └──→ Callout Box
                                (:::admonition or <Callout>)

Chapter (N) ──── (N) Chapter
(prerequisites)
```

---

## Content Workflow & States

### Chapter Lifecycle

1. **Draft**: Initial content creation
   - No validation required
   - May have placeholders
   - Not deployed

2. **Review**: Ready for quality checks
   - Readability score calculated
   - Examples and code snippets validated
   - Peer review requested

3. **Published**: Live on site
   - All validation rules pass
   - Deployed to GitHub Pages
   - Appears in sidebar navigation

4. **Archived**: Outdated or superseded
   - Removed from sidebar
   - Redirect to newer content
   - Kept for historical reference

### Code Snippet Lifecycle

1. **Current**: ≤3 months since last_updated
2. **Review Needed**: >3 months old, triggers quarterly review
3. **Updated**: Version bumped, tested, and re-validated

---

## Validation Summary

**Per-Chapter Requirements** (enforced in CI/CD):

| Rule | Source | Enforcement |
|------|--------|-------------|
| ≥2 Examples | FR-002 | Manual review checklist |
| ≥1 Code Snippet | FR-003 | Manual review checklist |
| Flesch ≥60 | FR-004, SC-002 | Automated (readability script) |
| All diagrams have alt text | FR-011, SC-009 | Automated (Lighthouse CI) |
| Code snippets have version info | FR-012a | Manual review checklist |
| Code snippets have comments | FR-012 | Manual code review |

**Site-Wide Requirements**:

| Rule | Source | Enforcement |
|------|--------|-------------|
| 15-25 chapters total | FR-001 | Manual count |
| WCAG 2.1 AA compliance | FR-011, SC-009 | Automated (Lighthouse ≥90) |
| <3s homepage load time | SC-004 | Automated (Lighthouse Performance) |
| Build succeeds | SC-003 | Automated (GitHub Actions) |
| No broken links | FR-017 | Automated (Docusaurus build) |
| Mobile responsive (≥375px) | FR-016, SC-008 | Manual testing + Lighthouse |

---

## File System Mapping

**Physical Structure**:

```
Humanoid_Robotics_Book/
├── docs/                           # Content (Chapter entities)
│   ├── intro.md
│   ├── fundamentals/               # Module
│   │   ├── _category_.json         # Module metadata
│   │   ├── what-is-physical-ai.md  # Chapter
│   │   ├── embodied-intelligence.mdx
│   │   └── ...
│   ├── robotics-basics/
│   │   ├── _category_.json
│   │   └── ...
│   └── ...
│
├── static/img/diagrams/            # Diagram entities
│   ├── robot-architecture.webp
│   ├── sensor-fusion.svg
│   └── ...
│
├── src/
│   ├── components/                 # Custom MDX components
│   │   ├── Callout.tsx            # Callout Box rendering
│   │   ├── Diagram.tsx            # Diagram rendering
│   │   └── ...
│   ├── css/
│   │   └── custom.css             # Design system (colors, typography)
│   └── pages/
│       └── index.tsx               # Homepage entity
│
├── sidebars.ts                     # Sidebar Navigation entity
├── docusaurus.config.ts            # Site configuration
└── package.json                    # Dependencies
```

---

## Design System Tokens

**Colors** (CSS Variables in `custom.css`):

```css
--primary: #2e8555;         /* Educational blue-green */
--success: #00a67e;          /* Tips, positive */
--warning: #ffcc00;          /* Cautions */
--danger: #d93025;           /* Errors, critical warnings */
--info: #5b9bd5;             /* Neutral information */
--text: #1c1e21;             /* Body text (4.8:1 contrast) */
--text-secondary: #5555;    /* Secondary text (4.5:1 contrast) */
```

**Typography**:

```css
--font-family: 'Inter', -apple-system, system-ui, sans-serif;
--font-size-base: 16px;
--line-height: 1.65;
--heading-font-weight: 600;
```

**Spacing Scale** (8px base):

```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 1.5rem;   /* 24px */
--space-lg: 2rem;     /* 32px */
--space-xl: 3rem;     /* 48px */
```

---

## Next Steps

This data model will inform:
1. **contracts/**: Content templates and TypeScript schemas
2. **quickstart.md**: Content authoring guidelines
3. **tasks.md**: Implementation tasks for creating each entity type

All entities are implemented as files (not database records), making the system simple, Git-friendly, and maintainable.
