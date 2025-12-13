# Chapter Button Injector Skill

Automatically add feature buttons (PersonalizeButton, TranslateButton) to all chapter files.

## When to use
- Need to add a button component to all chapters
- Bulk updating MDX imports
- Ensuring consistent button placement

## What it does
1. Finds all chapter files (docs/**/*.{md,mdx})
2. Checks which files already have the button
3. Adds import statement to files missing it
4. Adds button component at the top (after frontmatter)
5. Preserves existing frontmatter and formatting
6. Reports coverage (X/Y chapters updated)

## Example usage
User: "Add PersonalizeButton to all chapters"

Agent will:
- Find all .md and .mdx files in docs/
- Check for existing PersonalizeButton
- Add import: `import PersonalizeButton from '@site/src/components/auth/PersonalizeButton';`
- Add component: `<PersonalizeButton chapterId="chapter-id" />`
- Report: "Added PersonalizeButton to 45/50 chapters (5 already had it)"

## Button placement
```mdx
---
sidebar_position: 1
title: Chapter Title
---

import PersonalizeButton from '@site/src/components/auth/PersonalizeButton';
import TranslateButton from '@site/src/components/auth/TranslateButton';

<PersonalizeButton chapterId="intro" />
<TranslateButton chapterId="intro" />

# Chapter Title

Chapter content starts here...
```

## Chapter ID extraction
- Extracts from file path: `docs/module1-ros2/intro.md` → `module1-ros2-intro`
- Or from frontmatter: `id: custom-id`
- Handles special characters and spaces

## Safety
- Makes backup before modifying files
- Validates MDX syntax after changes
- Reports any files that couldn't be updated
- Doesn't duplicate buttons if already present

## Output
- Modified chapter files
- Coverage report
- List of any errors or skipped files
