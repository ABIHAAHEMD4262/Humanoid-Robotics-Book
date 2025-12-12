---
name: git-commit-helper
description: Generate clear, conventional commit messages from git changes. Use when creating commits, writing commit messages, or reviewing staged changes.
allowed-tools: Bash, Read
---

# Git Commit Message Generator

Generate professional commit messages following conventional commits format.

## Instructions

1. Run `git diff --staged` to see staged changes
2. If nothing staged, run `git diff` to see working directory changes
3. Analyze the changes to understand the scope and impact
4. Generate a commit message following the format below

## Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes that don't modify src or test files

### Scope (optional)

The area of the codebase affected:
- `auth` - Authentication related
- `ui` - User interface
- `api` - Backend API
- `docs` - Documentation
- `config` - Configuration files
- `navbar` - Navigation bar
- `forms` - Form components

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Max 50 characters

### Body (optional but recommended)

- Explain WHAT and WHY (not HOW)
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (optional)

- Reference issues: `Fixes #123` or `Closes #456`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Feature Addition
```
feat(auth): add user signup with personalization fields

- Add SignupForm component with profile fields
- Integrate Better-Auth for user creation
- Include software skill level, hardware type, language preference
- Store user preferences in database for content personalization

Closes #1
```

### Bug Fix
```
fix(navbar): resolve search bar overlap on mobile screens

The search bar was overlapping with Sign In button and icons on
screens smaller than 576px. Hidden search bar on very small screens
to prevent layout issues while keeping essential navigation visible.

Fixes #15
```

### Documentation
```
docs(readme): update installation instructions

Add Better-Auth setup steps and database migration instructions
for new contributors.
```

### UI Improvement
```
style(auth): apply glassmorphism design to signin/signup forms

- Add gradient backgrounds and frosted glass effect
- Implement smooth animations and transitions
- Improve responsive design for mobile devices
```

### Refactoring
```
refactor(api): simplify Better-Auth request handler

Convert Express req/res to Web API Request/Response format
for cleaner Better-Auth integration.
```

## Project-Specific Guidelines

For this Humanoid Robotics Book project:

- Use `feat(docs)` for new book chapters or sections
- Use `feat(auth)` for authentication features
- Use `fix(ui)` or `style(ui)` for styling fixes
- Use `feat(chatbot)` for RAG chatbot features
- Always include the scope when possible
- Reference issue numbers when applicable

## Process

1. Read the git diff
2. Identify the type and scope
3. Write concise subject line
4. Add body explaining the changes
5. Add footer if closing issues
6. Present the commit message in a code block for easy copying

## Output Format

Present the commit message like this:

```
<Generated commit message here>
```

Then ask: "Would you like me to create this commit, or would you like to modify the message?"
