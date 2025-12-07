# Implementation Tasks: AI-Native Book for Physical AI & Humanoid Robotics

**Branch**: `001-ai-native-book` | **Date**: 2025-12-05 (Updated after repo analysis)
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Current Implementation Status

**Repository Analysis** (2025-12-05):
- ✅ Docusaurus 3.9.2 fully installed and configured
- ✅ 41 content files created across 5 modules + appendices
- ✅ Homepage with hero section implemented
- ✅ Sidebar navigation configured with 5 modules
- ✅ GitHub Actions deployment pipeline active
- ✅ Custom Citation component created
- ✅ Design system in custom.css
- ❌ Missing: Readability scoring, custom components (Diagram, Callout), search plugin, Lighthouse CI, template compliance

**Task Completion Summary**:
- Phase 1 (Setup): **12/12 tasks completed** ✅
- Phase 2 (Foundational): **5/8 tasks completed** (missing: Callout, Diagram components, readability checks)
- Phase 3-7: Content exists but needs quality improvements

---

## Overview

This document breaks down **remaining implementation** into actionable tasks organized by priority. The basic Docusaurus structure is complete; focus is on quality, compliance with spec requirements, and missing infrastructure.

**Remaining Task Count**: 38 tasks
- Phase 2 (Foundational - Remaining): 3 tasks
- Phase 3 (Content Quality & Compliance): 15 tasks
- Phase 4 (Search & Accessibility): 8 tasks
- Phase 5 (Content Enhancement): 12 tasks

**Parallel Opportunities**: 24 parallelizable tasks marked with [P]

---

## Phase 2: Foundational Infrastructure (Remaining)

**Status**: 5/8 tasks complete, 3 remaining

**Goal**: Complete missing components and validation infrastructure

### Remaining Tasks

- [ ] T013 [P] Create src/components/Callout.tsx component with props (type: tip|note|warning|danger|info, title, children) and corresponding CSS
  - **Current**: Using Docusaurus admonitions (:::tip, :::note) in existing content
  - **Action**: Create custom component per contract spec or standardize on Docusaurus admonitions

- [ ] T014 [P] Create src/components/Diagram.tsx component with props (src, alt, caption, maxWidth) and lazy loading
  - **Current**: No custom Diagram component exists
  - **Action**: Implement component per specs/001-ai-native-book/contracts/chapter-template.mdx:263

- [ ] T015 Create readability check script at scripts/check-readability.js to scan docs/*.{md,mdx} and validate Flesch ≥60 (FR-004)
  - **Current**: No readability validation exists
  - **Action**: Install textstat npm, create validation script, add npm script "readability-check"
  - **File**: scripts/check-readability.js (new)

**Acceptance**:
- ✅ Callout/Diagram components render correctly in MDX
- ✅ `npm run readability-check` scans all docs and reports Flesch scores
- ✅ Components follow TypeScript interfaces in contracts/

---

## Phase 3: Content Quality & Template Compliance

**Goal**: Update existing 41 content files to meet spec requirements (FR-002, FR-003, FR-004, FR-010)

**Dependencies**: Phase 2 remaining tasks

**Priority**: HIGH - Core requirement violations

### Tasks

#### Documentation & Templates

- [ ] T016 Update docs/intro.md to follow chapter template structure from specs/001-ai-native-book/contracts/chapter-template.mdx
  - **Current**: Generic Docusaurus tutorial content
  - **Action**: Replace with Physical AI introduction per spec
  - **File**: docs/intro.md:1

- [ ] T017 [P] Create AUTHORING_GUIDE.md in repository root based on specs/001-ai-native-book/quickstart.md sections 123-360
  - **File**: AUTHORING_GUIDE.md (new)

#### Code Snippet Compliance (FR-003, FR-010)

- [ ] T018 [P] Audit all code snippets in docs/ for version pinning compliance
  - **Action**: Run `git grep -n "```" docs/ | grep -v "# Library:"` to find non-compliant snippets
  - **Acceptance**: All code snippets have `# Library: [name] v[version]` and `# Last updated: YYYY-MM-DD`

- [ ] T019 [P] Add version pinning comments to code snippets in module1-ros2/ (6 files)
  - **Template**:
    ```python
    # Library: rclpy v3.3.7
    # Last updated: 2025-12-05
    # Tested on: ROS 2 Humble, Python 3.10
    ```

- [ ] T020 [P] Add version pinning comments to code snippets in module2-digital-twin/ (6 files)

- [ ] T021 [P] Add version pinning comments to code snippets in module3-isaac-platform/ (6 files)

- [ ] T022 [P] Add version pinning comments to code snippets in module4-vla/ (2 files currently)

#### Example Structure Compliance (FR-002)

- [ ] T023 Audit all chapters for ≥2 examples per chapter (FR-002 requirement)
  - **Action**: Review each of 41 files and count Example sections
  - **Output**: Create examples-audit.md report

- [ ] T024 Update examples in module0-foundations/index.mdx to follow template format (Type/Context/Explanation/Takeaway)
  - **Template**: See specs/001-ai-native-book/contracts/chapter-template.mdx:165

- [ ] T025 [P] Update examples in module1-ros2/ files (6 files) to follow template format

- [ ] T026 [P] Update examples in module2-digital-twin/ files (6 files) to follow template format

- [ ] T027 [P] Update examples in module3-isaac-platform/ files (6 files) to follow template format

- [ ] T028 [P] Update examples in module4-vla/ files to follow template format

#### Readability Validation (FR-004)

- [ ] T029 Run `npm run readability-check` on all existing content and generate baseline report
  - **Dependency**: T015 (readability script creation)
  - **Output**: readability-report.md with scores for all 41 files

- [ ] T030 Fix readability issues in files scoring <60 Flesch Reading Ease
  - **Action**: Simplify sentences, add transitions, use active voice
  - **Manual Review Gate**: FR-013b allows technical term exceptions

**Acceptance**:
- ✅ All 41 files follow chapter template structure
- ✅ All code snippets have version pinning (FR-003, FR-010)
- ✅ All chapters have ≥2 examples in standard format (FR-002)
- ✅ Readability check passes or has documented justifications (FR-004)

---

## Phase 4: Search, Accessibility & CI/CD

**Goal**: Implement missing infrastructure for search, accessibility, and automated quality checks

**Dependencies**: Phase 2, Phase 3

**Priority**: MEDIUM - Required for production deployment

### Tasks

#### Search Implementation (FR-007, US5)

- [ ] T031 Install @easyops-cn/docusaurus-search-local plugin
  - **Command**: `npm install --save @easyops-cn/docusaurus-search-local`
  - **File**: package.json:17

- [ ] T032 Configure local search plugin in docusaurus.config.ts themes array
  - **Config**:
    ```typescript
    themes: [
      [
        require.resolve("@easyops-cn/docusaurus-search-local"),
        {
          hashed: true,
          language: ["en"],
          highlightSearchTermsOnTargetPage: true,
          explicitSearchResultPath: true,
        },
      ],
    ],
    ```
  - **File**: docusaurus.config.ts:38

- [ ] T033 Test search functionality with 10 test queries (e.g., "ROS 2", "Isaac Sim", "VLA")
  - **Acceptance**: All queries return relevant results from docs/

#### Accessibility & Quality Checks (FR-005, FR-006)

- [ ] T034 Install Lighthouse CI dependencies
  - **Command**: `npm install --save-dev @lhci/cli`
  - **File**: package.json:26

- [ ] T035 Create lighthouserc.json with accessibility threshold ≥0.9 and performance ≥0.85
  - **File**: lighthouserc.json (new)
  - **Config**: Per specs/001-ai-native-book/plan.md:159

- [ ] T036 Create GitHub Actions workflow .github/workflows/readability.yml to run readability check on PRs
  - **Trigger**: pull_request on docs/**
  - **File**: .github/workflows/readability.yml (new)

- [ ] T037 Create GitHub Actions workflow .github/workflows/lighthouse.yml to run Lighthouse CI
  - **Trigger**: pull_request and push to main
  - **File**: .github/workflows/lighthouse.yml (new)

- [ ] T038 Update existing .github/workflows/deploy.yml to include readability check before deployment
  - **File**: .github/workflows/deploy.yml:1

**Acceptance**:
- ✅ Search bar visible in navbar and returns results
- ✅ Lighthouse CI runs automatically on PRs
- ✅ Accessibility score ≥90 on homepage and 3 sample chapter pages
- ✅ Readability check runs in CI/CD pipeline

---

## Phase 5: Content Enhancement & Missing Chapters

**Goal**: Complete missing module content and enhance existing chapters with diagrams

**Dependencies**: Phases 2-4

**Priority**: LOW-MEDIUM - Content completeness for comprehensive coverage

### Tasks

#### Missing Module 4 Content (Per generate_content.py:11)

- [ ] T039 [P] Create docs/module4-vla/whisper-stt.mdx following chapter template
  - **Scaffold**: Available in generate_content.py:12
  - **Requirements**: 2 examples, 1 code snippet with version pinning, Flesch ≥60

- [ ] T040 [P] Create docs/module4-vla/llm-task-planning.mdx following chapter template

- [ ] T041 [P] Create docs/module4-vla/e2e-vla-pipeline.mdx following chapter template

- [ ] T042 [P] Create docs/module4-vla/capstone-project.mdx following chapter template

- [ ] T043 [P] Create docs/module4-vla/real-robot-deployment.mdx following chapter template

#### Diagram Creation (FR-008, US3)

- [ ] T044 Create system architecture diagram for Module 0 (Physical AI components)
  - **Format**: SVG or WebP <200KB
  - **Location**: static/img/diagrams/module0-physical-ai-architecture.svg
  - **Alt Text**: Required per FR-006

- [ ] T045 [P] Create ROS 2 communication diagram for Module 1 (nodes, topics, services)
  - **Location**: static/img/diagrams/module1-ros2-communication.svg

- [ ] T046 [P] Create digital twin workflow diagram for Module 2 (sim2real pipeline)
  - **Location**: static/img/diagrams/module2-digital-twin-workflow.svg

- [ ] T047 [P] Create Isaac Platform ecosystem diagram for Module 3
  - **Location**: static/img/diagrams/module3-isaac-ecosystem.svg

- [ ] T048 [P] Create VLA pipeline diagram for Module 4 (voice → perception → action)
  - **Location**: static/img/diagrams/module4-vla-pipeline.svg

- [ ] T049 Integrate diagrams into chapter files using Diagram component
  - **Dependency**: T014 (Diagram component creation)
  - **Action**: Add `<Diagram src="/img/diagrams/..." alt="..." caption="..." />` to relevant chapters

- [ ] T050 Optimize all diagrams for web (<200KB target per FR-008)
  - **Tool**: ImageMagick or Squoosh.app
  - **Command**: `convert input.png -quality 85 output.webp`

**Acceptance**:
- ✅ Module 4 has all 5 planned chapters (total 7 chapters)
- ✅ 5 key diagrams created and optimized
- ✅ Diagrams integrated into chapters with proper alt text
- ✅ All diagrams <200KB file size

---

## Phase 6: Configuration & Deployment Fixes

**Goal**: Update configuration to match project-specific details

**Priority**: LOW - Nice to have, not blocking

### Remaining Configuration Updates

- [ ] T051 Update docusaurus.config.ts footer links to remove generic Docusaurus community links
  - **Current**: References Stack Overflow, Discord, X (Twitter) for Docusaurus
  - **Action**: Replace with project-specific GitHub Discussions, Issues links
  - **File**: docusaurus.config.ts:109

- [ ] T052 Update docusaurus.config.ts navbar GitHub link to point to ABIHAAHEMD4262/Humanoid-Robotics-Book
  - **Current**: Points to facebook/docusaurus
  - **File**: docusaurus.config.ts:91

**Acceptance**:
- ✅ All footer/navbar links point to project repository
- ✅ No references to generic Docusaurus community resources

---

## Dependency Graph

```
Phase 2 (Remaining: T013-T015)
  → Phase 3 (Content Quality: T016-T030)
    → Phase 4 (Infrastructure: T031-T038) [PARALLEL with Phase 5]
    → Phase 5 (Content Enhancement: T039-T050)
      → Phase 6 (Config Fixes: T051-T052)
```

**Critical Path**: T015 (readability script) → T029 (baseline report) → T030 (fixes)

**Parallelizable**: T018-T022, T025-T028, T039-T043, T045-T048 (24 tasks total)

---

## Independent Test Criteria (Per User Story)

### US1 - Beginner Learning (Already Implemented, Needs Quality Fixes)

**Test**:
1. ✅ `npm run build` succeeds
2. ✅ Homepage hero section visible at /
3. ✅ Navigate to /docs/intro
4. ❌ Verify ≥2 examples per chapter (T023 audit required)
5. ❌ Verify 1 code snippet per chapter with version pinning (T018 audit required)
6. ❌ `npm run readability-check` passes (T015 script needed)
7. Manual comprehension test with non-technical user

**Current Status**: Infrastructure complete, content quality compliance needed

### US2 - Implement Examples (Content Exists, Format Compliance Needed)

**Test**:
1. Count examples across all chapters (should be ≥10 total)
2. ❌ Verify each example has Type/Context/Explanation/Takeaway structure (T024-T028)
3. User survey: "Did examples help understanding?" → target 80%+ yes

**Current Status**: Examples exist but don't follow template format

### US3 - Visual Learning (Partial, Diagrams Needed)

**Test**:
1. ❌ Count diagrams across chapters (target ≥5) - Currently 0 custom diagrams
2. ❌ Verify all diagrams <200KB (T050)
3. ❌ Verify all diagrams have alt text (T044-T048)
4. ✅ Test responsive at 375px width (homepage already responsive)

**Current Status**: Diagram infrastructure missing (T014, T044-T050)

### US4 - Deployment (Implemented)

**Test**:
1. ✅ Site deployed at https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/
2. ✅ GitHub Actions pipeline runs on push to main
3. ✅ Homepage loads (verified in existing deployment)
4. ✅ All navigation links work

**Current Status**: Complete ✅

### US5 - Search & Reference (Partial, Search Missing)

**Test**:
1. ❌ Search returns results for test queries (T031-T033 needed)
2. ✅ Sidebar navigation shows all chapters
3. ✅ Dark/light mode toggle works
4. Task completion time test: Find "ROS 2 installation" in <1 minute

**Current Status**: Search plugin not installed (T031-T033)

---

## MVP Recommendation (Updated)

**Current State**: MVP infrastructure exists (Phases 1-2 mostly complete, Phase 3 US1 content exists)

**To Reach Production Quality**:
1. **Immediate Priority** (Phase 3, T016-T030): Fix content compliance issues
   - Update intro.md to match spec (T016)
   - Add version pinning to code snippets (T018-T022)
   - Standardize example format (T024-T028)
   - Implement readability validation (T015, T029-T030)

2. **Pre-Launch Priority** (Phase 4, T031-T038): Add missing infrastructure
   - Search functionality (T031-T033)
   - Lighthouse CI (T034-T035)
   - Automated quality checks (T036-T038)

3. **Post-Launch Enhancements** (Phase 5-6): Content completeness
   - Module 4 missing chapters (T039-T043)
   - Diagram creation (T044-T050)
   - Configuration cleanup (T051-T052)

**Estimated Effort**:
- Phase 3: 12-16 hours (content quality fixes)
- Phase 4: 4-6 hours (infrastructure)
- Phase 5: 20-30 hours (new content + diagrams)
- Phase 6: 1 hour (config updates)

**Total Remaining**: ~40-50 hours

---

## Next Steps

**Recommended Execution Order**:

1. **Start with T015** (readability script) to enable quality validation
2. **Run T018 and T023 audits** in parallel to understand current state
3. **Fix high-priority compliance issues** (T016, T019-T022, T024-T028)
4. **Add infrastructure** (T031-T038) for automated validation
5. **Enhance content** (T039-T050) for completeness
6. **Polish configuration** (T051-T052)

**First Command**: Start with T015 to create readability validation infrastructure.

```bash
# Next action
npm install textstat glob
mkdir -p scripts
# Then create scripts/check-readability.js per spec
```
