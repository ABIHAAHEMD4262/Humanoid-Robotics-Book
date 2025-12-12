---
name: docs-formatter
description: Format and improve documentation for the humanoid robotics book. Use when creating or editing book chapters, fixing formatting issues, or improving documentation quality.
allowed-tools: Read, Edit, Glob
---

# Documentation Formatter

Ensure consistent, high-quality formatting for book chapters and documentation.

## Documentation Standards

### Frontmatter (for book chapters)

All chapter MDX files should include frontmatter:

```yaml
---
sidebar_position: 1
title: Chapter Title
description: Brief description of the chapter
---
```

### Headers

- **H1** (`#`) - Chapter title (only one per file)
- **H2** (`##`) - Major sections
- **H3** (`###`) - Subsections
- **H4** (`####`) - Minor topics (use sparingly)

### Code Blocks

Always specify the language for syntax highlighting:

````markdown
```python
# Python code example
import rospy
```

```bash
# Bash commands
npm install
```

```typescript
// TypeScript code
const example: string = "Hello";
```
````

### Admonitions

Use Docusaurus admonitions for important information:

```markdown
:::tip
Helpful tip for readers
:::

:::note
Important note to remember
:::

:::warning
Warning about potential issues
:::

:::danger
Critical warning about breaking changes
:::

:::info
Additional information
:::
```

### Links

- **Internal links**: Use relative paths
  ```markdown
  [ROS 2 Introduction](/docs/module1-ros2/)
  ```

- **External links**: Use full URLs
  ```markdown
  [ROS 2 Documentation](https://docs.ros.org/en/humble/)
  ```

### Images

```markdown
![Alt text for accessibility](/img/diagram.png)
```

Always include descriptive alt text for accessibility.

### Lists

**Unordered lists:**
```markdown
- First item
- Second item
  - Nested item
  - Another nested item
```

**Ordered lists:**
```markdown
1. First step
2. Second step
3. Third step
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

## Content Quality Checklist

When formatting or reviewing documentation:

- [ ] Frontmatter is complete and accurate
- [ ] Headers follow hierarchy (no skipping levels)
- [ ] Code blocks have language specified
- [ ] Links are working and properly formatted
- [ ] Images have alt text
- [ ] Technical terms are consistent
- [ ] Examples are clear and tested
- [ ] Admonitions are used appropriately
- [ ] Grammar and spelling are correct
- [ ] Content is accessible to target audience

## Book-Specific Guidelines

### Module Structure

Each module should have:
```
book-docs/moduleN-name/
├── index.mdx (module overview)
├── chapter1-topic/
│   ├── index.mdx (chapter overview)
│   ├── 1.1-subtopic.mdx
│   └── 1.2-subtopic.mdx
└── chapter2-topic/
    └── ...
```

### Terminology

Use consistent terminology:
- **ROS 2** (not ROS2 or ros2)
- **Isaac Sim** (not isaac-sim)
- **Gazebo** (not gazebo)
- **URDF** (all caps)
- **Neon** (for database)
- **Better-Auth** (not better auth)

### Code Examples

- Provide complete, runnable examples
- Include comments explaining key concepts
- Test all code before including
- Show expected output when helpful

### Learning Objectives

Each chapter should start with:
```markdown
## Learning Objectives

By the end of this chapter, you will:
- Objective 1
- Objective 2
- Objective 3
```

### Summary

Each chapter should end with:
```markdown
## Summary

In this chapter, you learned:
- Key point 1
- Key point 2
- Key point 3

## Next Steps

Continue to [Next Chapter](/docs/path/to/next)
```

## Process

When asked to format documentation:

1. Read the file using the Read tool
2. Check against standards above
3. Identify formatting issues
4. Apply corrections using Edit tool
5. Verify improvements
6. Summarize changes made

## Example Improvements

### Before:
```markdown
# introduction

This is about ros2

\`\`\`
import rospy
\`\`\`
```

### After:
```markdown
---
sidebar_position: 1
title: Introduction to ROS 2
description: Learn the fundamentals of ROS 2 for robotics development
---

# Introduction to ROS 2

This chapter introduces ROS 2 (Robot Operating System 2), a powerful framework for building robot applications.

## Learning Objectives

By the end of this chapter, you will:
- Understand what ROS 2 is and its key concepts
- Know when to use ROS 2 for robotics projects

```python
# Example: Basic ROS 2 import
import rospy
```

:::tip
ROS 2 provides improved performance and security over ROS 1.
:::
```

## Output

After formatting, provide:
1. List of changes made
2. Formatting improvements applied
3. Suggestions for content enhancement
4. Any issues that need manual review
