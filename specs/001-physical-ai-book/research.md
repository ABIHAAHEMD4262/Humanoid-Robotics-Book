# Research Findings

## Content Architecture in Docusaurus
- **Decision**: The book will adopt a hierarchical content architecture within Docusaurus, mapping modules to top-level sections, chapters to sub-sections, and individual pages within chapters.
- **Rationale**: This structure aligns with the "Official Book Structure – Exactly 4 Core Modules" defined in the `spec.md` and leverages Docusaurus's inherent sidebar and routing capabilities for clear navigation.
- **Alternatives Considered**: A flat structure (rejected due to complexity for a book-length project) and a highly fragmented structure (rejected due to potential navigation overhead).

## Docusaurus Versioning Strategy
- **Decision**: Initially, the book will use a single-version Docusaurus setup.
- **Rationale**: Given that this is the first edition, a single version simplifies development, deployment, and maintenance. If future editions or major revisions are planned, a multi-version setup can be considered.
- **Alternatives Considered**: Multi-versioning (rejected for initial release complexity).

## Mapping Spec-Kit Plus Specifications to Docusaurus Navigation and Routing
- **Decision**: Spec-Kit Plus specifications (e.g., `spec.md`, `plan.md`, `tasks.md`) will reside in the `specs/` directory outside the Docusaurus content folder. References and summaries will be integrated into Docusaurus pages as needed, primarily within an "About This Project" or "Contributing" section. Docusaurus sidebar navigation will focus solely on book content.
- **Rationale**: This maintains a clean separation between development artifacts and published book content, preventing "implementation detail leakage" into the reader's experience while still making the underlying project structure transparent for contributors.
- **Alternatives Considered**: Embedding specs directly within Docusaurus content (rejected for cluttering reader experience and mixing concerns).

## Trade-offs between Long-Form Pages vs. Deeply Nested Sections
- **Decision**: The book will primarily utilize a balance of moderately long-form pages for core concepts and deeply nested sections for detailed sub-topics or mini-projects. Each module and chapter will have a landing page, with individual concepts broken into sub-pages.
- **Rationale**: This approach optimizes readability and navigability. Long-form pages are suitable for introductory overviews, while deeply nested sections allow for detailed explanations without overwhelming a single page. This aligns with the "Each section supports measurable learning outcomes defined in the spec" testing strategy.
- **Alternatives Considered**: Exclusively long-form pages (rejected for potential information overload and difficulty in linking to specific sub-topics) and excessively fragmented pages (rejected for navigation fatigue).

## Scope Boundaries to Avoid Implementation Detail Leakage
- **Decision**: Book content will remain technology-agnostic where appropriate for conceptual understanding. Specific hardware (e.g., Unitree G1/Go2), APIs (e.g., specific ROS 2 messages), ROS code, and Isaac SDK specifics will be covered in dedicated "implementation" or "hands-on" sections within modules, clearly demarcated from conceptual explanations. The appendices will host specific buyer's guides and setup instructions.
- **Rationale**: This ensures the book's core principles and theoretical foundations are accessible and durable, regardless of rapid technological changes. Practical implementation details are provided in context for hands-on application. This aligns with the testing strategy "Is the outline fully technology-agnostic for book content while still planning the technical publishing system?"
- **Alternatives Considered**: Deeply embedding all implementation details throughout conceptual explanations (rejected for rapid obsolescence and reduced clarity).

## Strategy for Embedding Diagrams (Mermaid, Simple SVGs) without Technical Depth
- **Decision**: Diagrams will primarily use Mermaid for simple flowcharts, sequence diagrams, and state diagrams directly within Markdown, leveraging Docusaurus's MDX capabilities. More complex or static diagrams will be pre-generated as simple SVGs and embedded as images.
- **Rationale**: Mermaid offers version control-friendly, text-based diagramming that integrates well with Markdown/MDX and allows for easy updates. SVGs provide high-quality, scalable visuals without relying on specific rendering engines in the browser beyond basic SVG support.
- **Alternatives Considered**: Raster images (PNG/JPG) (rejected for scalability issues and larger file sizes) and complex interactive diagrams (rejected for added maintenance and potential compatibility issues).

## Citation Approach (APA) Implemented within Markdown Constraints
- **Decision**: APA citation style will be implemented using a combination of Markdown links for direct URLs and manual formatting for in-text citations and reference lists. A custom Docusaurus component or MDX shortcode may be explored for more automated citation management if basic Markdown proves insufficient for APA style.
- **Rationale**: Adhering to APA style ensures academic rigor and consistency. Markdown's linking capabilities will cover clickable references, while manual formatting will ensure adherence to APA in-text citation and reference list structure.
- **Alternatives Considered**: Using a full-fledged bibliography management system (rejected for over-complexity and potential integration challenges with Docusaurus's static site generation).
