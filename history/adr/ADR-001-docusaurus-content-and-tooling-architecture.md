# ADR-001: Docusaurus Content and Tooling Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Proposed
- **Date:** 2025-12-04
- **Feature:** 001-physical-ai-book
- **Context:** The project requires a robust and maintainable publishing system for the "Physical AI & Humanoid Robotics" book. Docusaurus was chosen as the primary framework. This ADR documents the architectural decisions made regarding content structure, integration with Spec-Kit Plus, visual embedding, citation management, and deployment.

## Decision

- **Content Architecture:** Hierarchical content structure (modules > chapters > pages) within Docusaurus to align with the book's 4-module journey.
- **Versioning Strategy:** Single-version Docusaurus setup for the initial release to simplify development and maintenance.
- **Page Structure:** A balance of moderately long-form pages for core concepts and deeply nested sections for detailed sub-topics and mini-projects.
- **Spec-Kit Plus Integration:** Spec-Kit Plus artifacts (`specs/`, `history/`) will be kept separate from Docusaurus content, residing at the project root. References and summaries will be integrated into Docusaurus pages, primarily within an "About This Project" or "Contributing" section.
- **Authoring Workflow:** Aligned with Spec-Kit Plus lifecycle, with Claude Code automating writing and transformation.
- **Visuals Embedding:** Mermaid for simple diagrams directly in Markdown/MDX, and pre-generated SVGs for complex/static diagrams embedded as images.
- **Citation Approach:** APA style using Markdown links for URLs and manual formatting for in-text citations and reference lists. A custom Docusaurus component may be explored if needed.
- **Deployment:** GitHub Pages for zero-cost, fully reproducible deployment.

## Consequences

### Positive

- Clear, logical content organization that mirrors the book's pedagogical structure.
- Simplified initial development and maintenance due to single-version Docusaurus.
- Optimized readability and navigability with a balanced page structure.
- Clean separation of development artifacts from published content, reducing clutter for readers.
- Automated content generation and transformation via Claude Code, enhancing efficiency.
- Version control-friendly and scalable diagrams.
- Academic rigor and consistency in citations.
- Cost-effective and reproducible deployment via GitHub Pages.

### Negative

- Potential for increased complexity if multi-versioning is required in future editions.
- Manual effort required for APA citation formatting (unless custom component is developed).
- Initial setup and configuration of Docusaurus and Spec-Kit Plus integration.
- Reliance on external tools (Mermaid, Docusaurus components) for advanced features.

## Alternatives Considered

- **Content Architecture:** Flat content structure (rejected for complexity), excessively fragmented pages (rejected for navigation fatigue).
- **Versioning Strategy:** Multi-version Docusaurus (rejected for initial complexity).
- **Spec-Kit Plus Integration:** Embedding specs directly within Docusaurus content (rejected for cluttering reader experience and mixing concerns).
- **Visuals Embedding:** Raster images (PNG/JPG) (rejected for scalability and file size), complex interactive diagrams (rejected for maintenance/compatibility).
- **Citation Approach:** Full bibliography management system (rejected for over-complexity).
- **Deployment:** Other hosting providers (e.g., Netlify, Vercel) or self-hosting (rejected for not meeting zero-cost requirement or adding unnecessary complexity).

## References

- Feature Spec: G:\Humanoid_Robotics_Book\specs\001-physical-ai-book\spec.md
- Implementation Plan: G:\Humanoid_Robotics_Book\specs\001-physical-ai-book\plan.md
- Related ADRs: null
- Evaluator Evidence: history/prompts/001-physical-ai-book/20251204-001-book-project-docusaurus-planning.plan.prompt.md
