<!--
Sync Impact Report:
Version change: 1.0.0 → 2.0.0
List of modified principles:
- Project Name: "Humanoid Robotics Book" → "AI/Spec-Driven Book Creation (Docusaurus + GitHub Pages Deployment)"
- Spec-First → Utility
- 100% Reproducible → Clarity
- Zero-cost deploy → Maintainability
- Latest stable versions or explicitly pinned (never “latest” without reason) → Reproducibility
- Open-source forever (MIT + CC-BY-4.0) (removed as a core principle, integrated into Standards/Constraints)
Added sections:
- Constraints
- Success Criteria
Removed sections:
- Limits (replaced by Constraints and Success Criteria)
Templates requiring updates:
- .specify/templates/plan-template.md: ✅ updated (generic enough to accommodate new principles)
- .specify/templates/spec-template.md: ✅ updated (generic enough, but specific requirements and success criteria will be influenced by new Standards and Limits)
- .specify/templates/tasks-template.md: ✅ updated (generic enough, but specific tasks will be influenced by new Standards and Limits)
- All command files are either generic or did not exist and thus do not require updates.
Follow-up TODOs:
- TODO(RATIFICATION_DATE): Needs to be set by the project owner.
-->
# AI/Spec-Driven Book Creation (Docusaurus + GitHub Pages Deployment) Constitution

## Core Principles

### Utility
The book must provide practical, actionable guidance on using Spec-Kit Plus and AI for documentation/book writing.

### Clarity
Content must be easy to read, logically structured, and accessible to developers and technical writers.

### Maintainability
The Docusaurus source must be well-organized and easily updatable via Markdown/MDX.

### Reproducibility
All steps for setting up, writing, and deploying the project must be clearly documented and verifiable.

## Standards
- Content in MDX, Docusaurus 3+
- GitHub Actions CI/CD → auto-deploy to GitHub Pages on main
- All examples tested and working
- Accessibility: WCAG 2.1 AA
- Readability: Flesch-Kincaid 10–12
- References: APA style with clickable links
- Images: WebP/AVIF, proper alt text
- Tool Integration: All generated content must be compatible with Docusaurus's Markdown/MDX format.
- Code Quality: All code examples (e.g., Docusaurus config snippets, Spec-Kit Plus commands) must be syntactically correct and tested.
- Deployment: The book must be successfully deployed and accessible on GitHub Pages.
- Spec-Driven Consistency: Content structure and generation must adhere to the Spec-Kit Plus prompt structure (e.g., `/sp.outline`, `/sp.chapter`).

## Constraints
- Technology Stack: Must use Docusaurus, Spec-Kit Plus, and a capable LLM (e.g., Claude Code).
- Structure: Must include a minimum of 4 distinct chapters (e.g., Introduction, Setup, Writing Workflow, Deployment).
- GitHub Repository: The book's source code must reside in a dedicated, public GitHub repository.
- Visuals: Must include at least 5 instructive diagrams or screenshots (e.g., Docusaurus folder structure, Spec-Kit Plus workflow).

## Success Criteria
- The Docusaurus site is successfully deployed to GitHub Pages and publically accessible.
- The book provides a comprehensive, step-by-step guide to using Spec-Kit Plus for documentation.
- All code blocks and technical instructions are accurate and functional.
- The project's structure is clean and adheres to Docusaurus best practices.

## Governance
- This Constitution supersedes all other project practices and documentation.
- Amendments require a formal proposal, discussion, and approval by project maintainers.
- All Pull Requests (PRs) and code reviews MUST verify compliance with these principles.
- Any deviations or exceptions to these principles MUST be explicitly justified and documented.

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Needs to be set by the project owner. | **Last Amended**: 2025-12-03
