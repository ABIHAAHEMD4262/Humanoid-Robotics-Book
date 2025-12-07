# Implementation Plan: AI-Native Book for Physical AI & Humanoid Robotics

**Branch**: `001-ai-native-book` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-native-book/spec.md`

## Summary

Create a comprehensive, beginner-friendly educational book on Physical AI and Humanoid Robotics using Docusaurus as the platform. The book will contain 15-25 chapters with visual-first teaching (diagrams, examples, code snippets), deployed to GitHub Pages with automated CI/CD including readability validation. Target audience includes beginners to intermediate learners seeking conceptual clarity through example-rich, accessible explanations (Flesch Reading Ease ≥60).

**Technical Approach**: Static site generation using Docusaurus 3.x with MDX for enhanced content, custom theming for visual consistency, automated build pipeline with readability scoring, and GitHub Pages deployment. Content will be organized hierarchically with sidebar navigation, responsive design, and accessibility compliance (WCAG 2.1 AA).

## Technical Context

**Language/Version**:
- Node.js 18.x or higher (LTS)
- Docusaurus 3.1.x (latest stable)
- MDX 3.x for enhanced markdown
- TypeScript 5.x for configuration files

**Primary Dependencies**:
- `@docusaurus/core` (3.1.x) - Core framework
- `@docusaurus/preset-classic` (3.1.x) - Standard docs/blog/pages preset
- `@docusaurus/module-type-aliases` - TypeScript support
- `@docusaurus/theme-classic` - Default theme with customization
- `prism-react-renderer` (latest) - Code syntax highlighting
- `react` (18.x) and `react-dom` (18.x) - UI framework
- `clsx` - Utility for conditional CSS classes
- Readability scoring tool: `flesch-kincaid` or `textstat` npm package for CI/CD validation

**Storage**:
- File-based: All content stored as Markdown/MDX files in `/docs` directory
- Static assets (diagrams, images) in `/static/img` directory
- Version-pinned dependencies tracked in `package.json` and `package-lock.json`
- Git repository as single source of truth

**Testing**:
- **Build validation**: `npm run build` (exit code 0 = success)
- **Link validation**: Docusaurus built-in link checker during build
- **Readability validation**: Custom npm script using flesch-kincaid library to scan `.md`/`.mdx` files and fail on score <60
- **Accessibility testing**: Lighthouse CI in GitHub Actions (WCAG 2.1 AA score ≥90)
- **Visual regression**: Manual review gates before deployment
- **Code snippet testing**: Quarterly manual review cycle (not automated initially)

**Target Platform**:
- Static web hosting via GitHub Pages
- Browser targets: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Mobile support: iOS Safari 13+, Chrome Android 90+
- Build environment: GitHub Actions runners (Ubuntu latest)

**Project Type**: Static documentation site (docs-only, no blog or custom pages beyond homepage)

**Performance Goals**:
- Initial page load: <3 seconds (homepage) on broadband (10 Mbps)
- Subsequent navigation: <2 seconds (client-side routing)
- Build time: <2 minutes for full site generation (15-25 chapters)
- Search results: <500ms response time
- Image optimization: <200KB per diagram (WebP/AVIF format)
- Lighthouse Performance score: ≥85
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

**Constraints**:
- **Content**: 15-25 chapters minimum (comprehensive coverage requirement)
- **Readability**: All explanatory text must achieve Flesch Reading Ease ≥60 (grades 8-9 reading level)
- **Examples**: Minimum 2 examples + 1 code snippet per chapter
- **Deployment**: GitHub Pages only (no custom hosting, zero infrastructure cost)
- **Accessibility**: Full WCAG 2.1 AA compliance (alt text, semantic HTML, keyboard navigation, color contrast 4.5:1)
- **Visual consistency**: Unified color system, typography, spacing across all pages
- **Responsive**: Mobile-first design, viewable without horizontal scroll at 375px width
- **No backend**: Fully static site, no server-side logic or APIs
- **Open source**: All content and code publicly available in GitHub repository
- **Quarterly maintenance**: Code example versions reviewed every 3 months

**Scale/Scope**:
- **Content volume**: 15-25 chapters × ~2000-3000 words each = 30,000-75,000 total words
- **Visual assets**: Estimated 30-50 diagrams across all chapters (2-3 per chapter average)
- **Code examples**: 15-25 snippets minimum (1 per chapter), likely 50-75 total
- **Navigation depth**: 3-level sidebar hierarchy (Module → Chapter → Sections)
- **Build artifacts**: Static HTML/CSS/JS bundle, estimated 10-20MB uncompressed
- **Expected traffic**: Small to medium (not specified, GitHub Pages suitable for moderate traffic)
- **Contributors**: Initially 1-2 maintainers, designed for community contributions
- **Update frequency**: Quarterly code reviews, ongoing content additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Alignment

**✅ Utility**:
- Book provides practical, actionable guidance on Physical AI and Humanoid Robotics concepts
- All examples are executable and illustrate real-world scenarios
- Aligned with constitution requirement for practical, actionable guidance

**✅ Clarity**:
- Content structured logically with hierarchical navigation (modules → chapters → sections)
- Flesch Reading Ease ≥60 ensures accessibility to target audience (beginners to intermediate)
- Visual-first approach with diagrams, callouts, and step-by-step guides
- Meets constitution requirement for easy-to-read, logical structure

**✅ Maintainability**:
- Pure Markdown/MDX for all content (no complex tooling required)
- Modular chapter structure allows independent updates
- Clear file naming and folder conventions
- Quarterly review cycle for code examples
- Aligns with constitution's requirement for well-organized, easily updatable source

**✅ Reproducibility**:
- Version-pinned dependencies in package.json
- Documented setup and build process (will be captured in quickstart.md)
- Automated CI/CD pipeline with GitHub Actions
- All steps verifiable and repeatable
- Meets constitution requirement for clearly documented, verifiable steps

### Standards Compliance

**✅ Content Format**: MDX with Docusaurus 3+ (matches constitution requirement)

**✅ CI/CD**: GitHub Actions auto-deploy to GitHub Pages on main branch (matches constitution)

**✅ Tested Examples**: All code snippets will be tested (quarterly review cycle)

**✅ Accessibility**: WCAG 2.1 AA compliance required (FR-011, SC-009) - matches constitution

**⚠️ Readability**: Constitution specifies Flesch-Kincaid 10-12 (college level), but spec requires ≥60 (grades 8-9)
- **Justification**: Target audience includes beginners with no AI background (User Story 1). Grade 8-9 level more appropriate than college level for accessibility. This is a deliberate deviation to better serve the intended audience.
- **Resolution**: Use Flesch Reading Ease ≥60 as specified in requirements (FR-004, SC-002)

**✅ References**: APA style with clickable links (will be implemented in content)

**✅ Images**: WebP/AVIF format with proper alt text (FR-011, performance constraint <200KB)

**✅ Tool Integration**: All content compatible with Docusaurus Markdown/MDX format

**✅ Code Quality**: All code examples syntactically correct (FR-012a, FR-012b - quarterly reviews)

**✅ Deployment**: Successfully deployed to GitHub Pages (FR-010, SC-004)

**✅ Spec-Driven Consistency**: Using Spec-Kit Plus workflow (/sp.specify, /sp.clarify, /sp.plan, /sp.tasks)

### Constraints Compliance

**⚠️ Technology Stack**: Constitution requires "Spec-Kit Plus and a capable LLM (e.g., Claude Code)" - both satisfied during planning/writing phase, not runtime

**⚠️ Structure**: Constitution requires "minimum of 4 distinct chapters" but spec requires 15-25 chapters (FR-001)
- **Justification**: More comprehensive scope needed for thorough Physical AI coverage. 4 chapters would be insufficient for intermediate learners to implement examples.
- **Resolution**: Use 15-25 chapters as specified in clarifications and requirements

**✅ GitHub Repository**: Public repository required (assumption in spec)

**✅ Visuals**: Constitution requires "at least 5 instructive diagrams" - spec requires diagrams in every chapter (estimated 30-50 total, well exceeds minimum)

### Success Criteria Compliance

**✅ Deployed to GitHub Pages**: FR-010, SC-004

**✅ Comprehensive guide**: 15-25 chapters with 2+ examples and 1+ code snippet each

**✅ Accurate instructions**: Quarterly code review cycle ensures functionality (FR-012b)

**✅ Clean structure**: Docusaurus best practices (standard preset, conventional folder structure)

### Gate Status

**🟢 PASS WITH JUSTIFICATIONS**

**Deviations from Constitution**:
1. **Readability level**: Constitution (FK 10-12/college) vs Spec (Flesch ≥60/grade 8-9)
   - Justified by beginner-focused audience and accessibility requirements
2. **Chapter count**: Constitution (4 minimum) vs Spec (15-25 required)
   - Justified by comprehensive coverage requirement and intermediate learner needs

Both deviations serve the feature's primary goal of making complex AI concepts accessible to beginners, which aligns with the constitution's core principle of **Utility**.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-native-book/
├── spec.md              # Feature specification (/sp.specify output)
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0: Technology decisions and best practices
├── data-model.md        # Phase 1: Content structure and entities
├── quickstart.md        # Phase 1: Setup and development guide
├── contracts/           # Phase 1: Content templates and schemas
│   ├── chapter-template.mdx         # Standard chapter structure
│   ├── homepage-schema.ts           # Homepage component types
│   └── docusaurus-config-schema.ts  # Configuration structure
└── tasks.md             # Phase 2: Implementation tasks (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Documentation site structure (Docusaurus standard)
docs/                    # All chapter content (Markdown/MDX)
├── intro.md            # Introduction/Getting Started
├── fundamentals/       # Module 1: Foundational concepts
│   ├── _category_.json
│   ├── what-is-physical-ai.md
│   ├── embodied-intelligence.md
│   └── ...
├── robotics-basics/    # Module 2: Robotics fundamentals
│   ├── _category_.json
│   ├── sensors-actuators.md
│   ├── kinematics.md
│   └── ...
├── ai-models/          # Module 3: AI/ML for robotics
│   ├── _category_.json
│   ├── vision-models.md
│   ├── control-policies.md
│   └── ...
└── advanced-topics/    # Module 4+: Advanced concepts
    ├── _category_.json
    ├── sim-to-real.md
    └── ...

src/                     # Custom React components and theme
├── components/          # Reusable MDX components
│   ├── Callout.tsx     # Custom callout boxes
│   ├── CodeBlock.tsx   # Enhanced code snippets
│   └── Diagram.tsx     # Image wrapper with zoom
├── css/                 # Global styles and theme overrides
│   ├── custom.css      # Design system (colors, typography, spacing)
│   └── responsive.css  # Mobile-first responsive rules
└── pages/              # Custom pages
    └── index.tsx       # Homepage with hero section

static/                  # Static assets
├── img/                # Diagrams and images
│   ├── diagrams/       # Technical diagrams (SVG/WebP)
│   ├── examples/       # Example screenshots
│   └── logo.svg        # Site logo
└── fonts/              # Custom fonts (if needed)

.github/
├── workflows/
│   ├── deploy.yml      # Build and deploy to GitHub Pages
│   ├── readability.yml # Flesch Reading Ease validation
│   └── lighthouse.yml  # Accessibility and performance testing
└── CODEOWNERS          # Code review assignments

# Configuration files (repository root)
docusaurus.config.ts    # Main Docusaurus configuration
sidebars.ts             # Sidebar navigation structure
package.json            # Dependencies and scripts
package-lock.json       # Locked dependency versions
tsconfig.json           # TypeScript configuration
.gitignore              # Git exclusions
README.md               # Repository documentation
```

**Structure Decision**:

Chosen **Docusaurus standard documentation structure** because:
1. **Proven pattern**: Docusaurus preset-classic provides battle-tested conventions for technical documentation
2. **Simple content management**: Pure Markdown/MDX in `/docs` with hierarchical folders matches maintainability requirement (constitution principle)
3. **No backend complexity**: Static site generation eliminates server infrastructure (matches "no backend" constraint)
4. **Git-friendly**: File-based content enables version control, pull request workflows, and community contributions
5. **Modular**: Each chapter is an independent file, supporting parallel content development and independent updates

This structure explicitly **avoids**:
- Custom backend/API (out of scope, fully static)
- Complex build tools beyond Docusaurus (maintainability)
- Database or CMS (file-based simplicity)
- Monorepo patterns (single-project scope)

## Complexity Tracking

> **Filled because Constitution Check has justified deviations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Readability: FK 10-12 (college) → Flesch ≥60 (grade 8-9) | Target audience includes complete beginners with no AI background (User Story 1, Priority P1). Accessibility is core to feature success. | College-level readability would exclude primary user persona and violate "accessible to beginners" requirement (FR-021). Grade 8-9 level is appropriate for technical content aimed at hobbyists and students. |
| Chapter count: 4 minimum → 15-25 required | Comprehensive coverage needed for intermediate learners to implement examples (clarification Q1). Physical AI is a broad domain requiring depth across multiple subtopics. | 4 chapters would provide only shallow overview, insufficient for User Story 2 (implementing examples) and Success Criterion SC-010 (95% of code examples executable). Comprehensive depth justified by target audience needs. |

Both deviations prioritize **feature success** (beginner accessibility and comprehensive learning) over strict constitutional compliance, while still honoring the constitution's core principles of Utility, Clarity, and Maintainability.

## Phase 0: Research & Technology Decisions

### Research Questions to Resolve

1. **Docusaurus 3.x Setup**: Best practices for initialization, TypeScript configuration, and preset-classic options
2. **Theme Customization**: Approach for implementing unified color system, typography, and spacing (FR-008, SC-006)
3. **MDX Components**: Patterns for creating reusable Callout, CodeBlock, and Diagram components (FR-007, FR-019)
4. **Readability Scoring**: npm packages for Flesch Reading Ease calculation in CI/CD pipeline (FR-013a)
5. **GitHub Pages Deployment**: Configuration for automated deployment from main branch (FR-010)
6. **Accessibility Testing**: Lighthouse CI setup for WCAG 2.1 AA validation (FR-011, SC-009)
7. **Code Syntax Highlighting**: Prism.js theme selection and language support for Python/JavaScript (FR-003)
8. **Responsive Images**: Techniques for serving optimized diagrams at different viewport sizes (FR-016, SC-008)
9. **Search Configuration**: Docusaurus Algolia DocSearch vs local search plugin (FR-005, User Story 5)
10. **Version Pinning Strategy**: Process for documenting library versions in code examples (FR-012a)

### Research Outputs Expected

Research findings will be documented in `research.md` with:
- **Decision**: Chosen approach/technology
- **Rationale**: Why this choice best serves requirements
- **Alternatives considered**: What else was evaluated and why rejected
- **Implementation notes**: Key configuration details or gotchas
- **References**: Links to official docs, examples, or tutorials

## Phase 1: Design Artifacts

### 1. Data Model (`data-model.md`)

Define the content structure and relationships:

**Entities to model**:
- **Chapter**: Title, slug, module assignment, difficulty level, estimated reading time, prerequisites
- **Code Snippet**: Language, version info, inline comments structure, copy button behavior
- **Diagram**: Image source, alt text template, caption format, responsive sizing rules
- **Example**: Type (analogy, scenario, case study), relationship to parent concept
- **Callout Box**: Type taxonomy (tip, note, warning, danger, info), visual styling rules
- **Module**: Category name, chapter order, sidebar icon, description

**Relationships**:
- Module 1:N Chapters
- Chapter 1:N (Code Snippets, Diagrams, Examples, Callouts)
- Chapter N:N Chapter (prerequisites)

**Validation rules** (from requirements):
- Chapter: MUST have ≥2 Examples AND ≥1 Code Snippet (FR-002, FR-003)
- Code Snippet: MUST have language + version + comments (FR-012, FR-012a)
- Diagram: MUST have alt text (FR-011)
- All text content: MUST achieve Flesch ≥60 (FR-004)

### 2. Contracts (`/contracts/`)

Generate content templates and type definitions:

**`chapter-template.mdx`**: Standard chapter structure
```mdx
---
sidebar_position: [number]
---

# [Chapter Title]

**Estimated Reading Time**: [X] minutes
**Prerequisites**: [list or "None"]
**Difficulty**: [Beginner/Intermediate/Advanced]

## Introduction
[Hook and overview - 2-3 sentences]

## Core Concept 1
[Explanation with analogy]

### Example 1: [Title]
[Real-world scenario or analogy]

### Code Example
```[language] title="[filename.ext]"
# Library: [name] v[version]
# Last updated: [YYYY-MM-DD]
[code with inline comments]
```

## Core Concept 2
[Explanation]

### Example 2: [Title]
[Another scenario]

:::tip Key Takeaway
[Summary callout]
:::

## Summary
[Recap main points]

## Next Steps
[Link to next chapter or exercises]
```

**`homepage-schema.ts`**: TypeScript types for homepage components
```typescript
export interface HeroSection {
  title: string;
  tagline: string;
  primaryCTA: CallToAction;
  secondaryCTA: CallToAction;
}

export interface CallToAction {
  label: string;
  link: string;
  variant: 'primary' | 'secondary';
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}
```

**`docusaurus-config-schema.ts`**: Configuration structure for theme and plugins

### 3. Quickstart Guide (`quickstart.md`)

Developer setup and workflow documentation:

**Sections**:
1. **Prerequisites**: Node.js 18+, Git, code editor
2. **Installation**: Clone repo, npm install
3. **Development**: npm start, live reload, port 3000
4. **Content Authoring**:
   - Creating new chapters
   - Using MDX components
   - Adding diagrams
   - Writing code snippets with version info
5. **Local Testing**:
   - Build validation: npm run build
   - Readability check: npm run readability-check
   - Accessibility: Lighthouse in Chrome DevTools
6. **Deployment**: Push to main triggers GitHub Actions
7. **Quarterly Maintenance**: Code example version review process

### 4. Agent Context Update

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Technologies to add to agent context**:
- Docusaurus 3.1.x
- MDX 3.x
- React 18.x
- Prism.js for syntax highlighting
- Flesch-Kincaid readability scoring
- GitHub Actions for CI/CD
- Lighthouse CI for accessibility

## Evaluation Gates

**After Phase 1 Completion**:

✅ All research questions resolved in `research.md`
✅ Data model defines all content entities and relationships
✅ Chapter template provides clear structure for 15-25 chapters
✅ Quickstart enables new contributors to set up environment in <15 minutes
✅ Configuration schemas document all Docusaurus options
✅ Agent context updated with current technologies

**Re-check Constitution**:
- Utility: ✅ Comprehensive chapter structure supports practical learning
- Clarity: ✅ Templates enforce logical organization
- Maintainability: ✅ Markdown/MDX simplicity preserved
- Reproducibility: ✅ Quickstart documents all setup steps

## Next Steps

**Current command (`/sp.plan`) will**:
1. ✅ Generate this plan.md file
2. ⏳ Execute Phase 0 research (create research.md)
3. ⏳ Execute Phase 1 design (create data-model.md, contracts/, quickstart.md)
4. ⏳ Update agent context with technologies
5. ⏳ Re-evaluate constitution check

**After `/sp.plan` completes, user should run**:
- `/sp.tasks` to generate implementation task breakdown based on this plan

**Implementation will involve**:
- Setting up Docusaurus project structure
- Configuring theme and design system
- Creating MDX components (Callout, Diagram, CodeBlock)
- Writing 15-25 chapters following template
- Setting up CI/CD pipeline with readability validation
- Deploying to GitHub Pages
- Creating homepage with hero section

**Estimated Effort**: Medium-Large (15-25 chapters of content creation is substantial, but technical infrastructure is straightforward)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content creation volume (15-25 chapters) | High effort, potential delays | Use AI assistance (Claude Code) for draft generation, focus on core modules first, iterate |
| Readability score variability | Some technical content may score <60 | Manual review gate allows human judgment for domain-specific terms, aim for ≥65 average to create buffer |
| Diagram creation burden | Visual quality critical for User Story 3 | Use diagramming tools (draw.io, Figma), establish visual style guide early, reuse component patterns |
| Code example obsolescence | Quarterly reviews may be insufficient for fast-moving libraries | Pin conservative versions (not latest), prioritize stable APIs, document update strategy in contributing guide |
| GitHub Pages build limits | Large site may exceed limits | Monitor build size, optimize images aggressively, consider incremental static regeneration if needed |

## Assumptions

(Carried forward from spec.md + planning-specific additions)

- Docusaurus 3.x provides all needed features without custom plugins
- GitHub Pages hosting sufficient for expected traffic
- One primary author with AI assistance for initial content
- Community contributions expected after initial publication
- No legal/licensing issues with educational content on Physical AI (assumes public domain knowledge)
- Diagrams can be created as static images (no interactive simulations required)
- Python and JavaScript sufficient for code examples (no need for C++, Rust, etc.)
- Readers willing to set up local development environment for code execution (no in-browser playgrounds)
