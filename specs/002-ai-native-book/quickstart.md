# Quickstart Guide: Development Setup & Workflow

**Feature**: AI-Native Book for Physical AI & Humanoid Robotics
**Date**: 2025-12-05
**Purpose**: Enable contributors to set up environment and author content

## Prerequisites

Before starting, ensure you have:

- **Node.js 18.x or higher** (LTS recommended)
  - Check: `node --version` (should show v18.x.x or higher)
  - Install from: https://nodejs.org/
- **npm 9.x or higher** (comes with Node.js)
  - Check: `npm --version`
- **Git** for version control
  - Check: `git --version`
  - Install from: https://git-scm.com/
- **Code editor** (VS Code recommended)
  - Suggested extensions: Prettier, MDX, ESLint
- **Web browser** (Chrome/Firefox/Safari/Edge latest version)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/[username]/Humanoid_Robotics_Book.git
cd Humanoid_Robotics_Book
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Docusaurus 3.1.x
- React 18.x
- Prism.js for syntax highlighting
- Local search plugin
- Development tools

**Time**: ~2-3 minutes depending on connection speed

### 3. Verify Installation

```bash
npm start
```

- Opens browser at http://localhost:3000
- Hot-reload enabled (changes appear instantly)
- Press `Ctrl+C` to stop server

If you see the Docusaurus homepage, setup is complete ✅

---

## Project Structure Overview

```
Humanoid_Robotics_Book/
├── docs/                   # 📝 All chapter content (YOU EDIT HERE)
│   ├── intro.md
│   ├── fundamentals/
│   │   ├── _category_.json
│   │   ├── what-is-physical-ai.md
│   │   └── ...
│   └── ...
│
├── static/img/diagrams/   # 🖼️ Images and diagrams
├── src/
│   ├── components/        # ⚛️ Custom React components
│   ├── css/custom.css     # 🎨 Design system (colors, fonts)
│   └── pages/index.tsx    # 🏠 Homepage
│
├── sidebars.ts            # 📑 Navigation structure
├── docusaurus.config.ts   # ⚙️ Site configuration
├── package.json           # 📦 Dependencies
└── README.md              # 📖 Repository docs
```

**Key Locations**:
- **Write content**: `docs/` directory
- **Add images**: `static/img/diagrams/`
- **Customize theme**: `src/css/custom.css`
- **Change navigation**: `sidebars.ts`

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start development server
npm start

# 2. Open browser at http://localhost:3000

# 3. Edit files in docs/ (changes auto-reload)

# 4. When done: Ctrl+C to stop server
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server with hot reload |
| `npm run build` | Build production site (tests for errors) |
| `npm run serve` | Preview built site locally |
| `npm run clear` | Clear cache (fixes weird errors) |
| `npm run readability-check` | Validate Flesch Reading Ease ≥60 |
| `npm run deploy` | Deploy to GitHub Pages (maintainers only) |

---

## Content Authoring Guide

### Creating a New Chapter

**Step 1**: Decide on module (category)
- Fundamentals, Robotics Basics, AI Models, Advanced Topics, etc.
- Check `docs/` for existing modules

**Step 2**: Create markdown file

```bash
# Example: Creating "sensors-actuators.md" in robotics-basics/
touch docs/robotics-basics/sensors-actuators.md
```

**Step 3**: Use chapter template

Copy structure from `specs/001-ai-native-book/contracts/chapter-template.mdx`

**Minimal example**:
```mdx
---
sidebar_position: 2
---

# Sensors and Actuators

**Estimated Reading Time**: 10 minutes
**Prerequisites**: None
**Difficulty**: Beginner

## Introduction

Robots interact with the world through sensors (input) and actuators (output).
In this chapter, we'll explore how these components work together.

## Sensors: Robot Perception

[Content here...]

### Example 1: Camera as Robot Eyes

**Type**: Analogy
**Context**: Just like human eyes capture light...
**Explanation**: Robot cameras work similarly by...
**Takeaway**: Cameras provide visual data for processing.

### Code Example: Reading Sensor Data

```python title="sensor_reader.py"
# Library: RPi.GPIO v0.7.1
# Last updated: 2025-12-05
# Tested on: Python 3.11

import RPi.GPIO as GPIO

def read_ultrasonic_sensor(trig_pin, echo_pin):
    """Read distance from ultrasonic sensor."""
    # Trigger pulse
    GPIO.output(trig_pin, True)
    time.sleep(0.00001)  # 10 microsecond pulse
    GPIO.output(trig_pin, False)

    # Measure echo time
    while GPIO.input(echo_pin) == 0:
        pulse_start = time.time()
    while GPIO.input(echo_pin) == 1:
        pulse_end = time.time()

    # Calculate distance (speed of sound: 343 m/s)
    pulse_duration = pulse_end - pulse_start
    distance_cm = (pulse_duration * 34300) / 2
    return distance_cm
```

:::tip Key Insight
Sensors convert physical phenomena (distance, light, temperature) into electrical signals that computers can process.
:::

## Actuators: Robot Action

[Content here...]

## Summary

- Sensors provide input from environment
- Actuators produce physical output
- Together they enable robot-world interaction

**Continue to**: [Next chapter](./kinematics.md)
```

**Step 4**: Add to sidebar

Edit `sidebars.ts`:
```typescript
{
  type: 'category',
  label: 'Robotics Basics',
  items: [
    'robotics-basics/sensors-actuators', // Add this line
    // ... other chapters
  ],
}
```

**Step 5**: Preview

- Save file
- Check http://localhost:3000
- Verify chapter appears in sidebar
- Read through for flow and clarity

---

### Adding Diagrams

**Step 1**: Create diagram
- Use tools: draw.io, Figma, Excalidraw
- Export as SVG (preferred) or PNG
- Optimize: <200KB file size

**Step 2**: Convert to WebP (if PNG)

```bash
# Using ImageMagick
convert input.png -quality 85 output.webp

# Or use online: squoosh.app
```

**Step 3**: Place in static directory

```bash
cp my-diagram.webp static/img/diagrams/
```

**Step 4**: Reference in MDX

```mdx
import Diagram from '@site/src/components/Diagram';

<Diagram
  src="/img/diagrams/my-diagram.webp"
  alt="Detailed description: Robot with sensors (camera, lidar) and actuators (wheel motors, arm servos) connected to central controller"
  caption="Figure 1: Robot system components"
  maxWidth="600px"
/>
```

**Alt Text Guidelines**:
- Describe **what** is shown, not how it looks
- Include key labels and relationships
- 20-250 characters
- Bad: "Image of robot"
- Good: "Robot with camera sensor feeding data to controller, which sends commands to motor actuators"

---

### Writing Code Examples

**Requirements** (from spec):
- Minimum 1 per chapter
- Include library name + version
- Include last updated date
- Add inline comments explaining logic
- Test code before committing

**Template**:
````mdx
```[language] title="[filename.ext]"
# Library: [name] v[version]
# Last updated: [YYYY-MM-DD]
# Tested on: [environment]

[code with comments]
```
````

**Languages Supported**:
- Python (most common for Physical AI)
- JavaScript/TypeScript
- Bash/Shell
- JSON, YAML (for configs)
- C++ (advanced topics)

**Version Pinning**:
- Use specific versions: `v2.15.0` not `latest`
- Document why if using older version
- Quarterly review: update versions every 3 months

---

### Using Callout Boxes

**Docusaurus Admonitions** (recommended):

```mdx
:::tip
Helpful advice or best practice
:::

:::note
Additional information or clarification
:::

:::warning
Important caution or potential issue
:::

:::danger
Critical warning or error to avoid
:::

:::info
Neutral supplementary information
:::
```

**Custom Callout Component** (for special cases):

```mdx
import Callout from '@site/src/components/Callout';

<Callout type="warning" title="Common Pitfall">
Don't confuse sensor calibration with sensor fusion!
</Callout>
```

**When to use**:
- **Tip**: Best practices, pro tips, efficiency gains
- **Note**: Side information, historical context
- **Warning**: Things that might cause issues
- **Danger**: Things that will break or fail
- **Info**: Supplementary details

---

## Local Testing

### Build Validation

Before committing, test that site builds without errors:

```bash
npm run build
```

**Success**: Exits with code 0, outputs to `build/` directory
**Failure**: Shows error with file and line number

**Common Errors**:
- Broken internal links: `Error: Broken link on source page...`
- Invalid frontmatter: `Error parsing Markdown front matter...`
- Missing alt text: Caught by Lighthouse, not build

### Readability Check

Validate Flesch Reading Ease ≥60:

```bash
npm run readability-check
```

**Success**: ✅ All files meet readability threshold
**Failure**: ❌ Lists files below threshold with scores

**If failing**:
- Simplify complex sentences
- Break long paragraphs into shorter ones
- Replace jargon with plain language
- Use active voice ("The robot detects objects" not "Objects are detected by the robot")
- Add transitions and examples

**Note**: Technical terms may lower scores - use manual review gate (FR-013b)

### Accessibility Check

Use Chrome Lighthouse:

1. Build site: `npm run build`
2. Serve locally: `npm run serve`
3. Open http://localhost:3000
4. Open Chrome DevTools (F12)
5. Go to Lighthouse tab
6. Run audit (select "Accessibility" only)
7. Ensure score ≥90

**Common Issues**:
- Missing alt text on images
- Low color contrast
- Missing heading hierarchy (skip from h2 to h4)
- No keyboard navigation on custom components

### Manual Testing Checklist

Before creating PR:

- [ ] Site builds without errors (`npm run build`)
- [ ] All chapters accessible from sidebar
- [ ] No broken internal links
- [ ] Images load correctly and are optimized (<200KB)
- [ ] Code snippets have syntax highlighting
- [ ] Copy button works on code blocks
- [ ] Responsive on mobile (test at 375px width)
- [ ] Readability check passes or justified
- [ ] Lighthouse accessibility score ≥90

---

## Git Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b add-chapter-kinematics

# Make changes, test locally

# Stage and commit
git add docs/robotics-basics/kinematics.md
git commit -m "docs: add kinematics chapter to robotics basics"

# Push to GitHub
git push origin add-chapter-kinematics
```

### Commit Message Format

```
<type>(<scope>): <subject>

Examples:
docs(fundamentals): add physical-ai introduction chapter
fix(sensors): correct ultrasonic sensor code example
chore: quarterly code example version review Q4 2025
style(theme): improve mobile responsive spacing
```

**Types**:
- `docs`: Content changes (chapters, examples, diagrams)
- `feat`: New features (components, functionality)
- `fix`: Bug fixes (broken links, errors)
- `chore`: Maintenance (dependencies, reviews)
- `style`: Visual/CSS changes

### Creating Pull Request

1. Push branch to GitHub
2. Go to repository on GitHub
3. Click "Compare & pull request"
4. Fill in template:
   - **What**: Brief description of changes
   - **Why**: Reason for changes
   - **Testing**: How you verified it works
   - **Screenshots**: If UI/visual changes
5. Request review from maintainer
6. Address feedback if needed
7. Merge once approved

---

## Quarterly Maintenance (For Maintainers)

Every 3 months, review code examples:

### Process

**Step 1**: Create tracking issue
```markdown
# Q[N] 2025 Code Example Review

**Due**: [Last day of quarter]

## Checklist
- [ ] List all code examples: `git grep "# Library:" docs/`
- [ ] Test each example against latest versions
- [ ] Update version comments
- [ ] Document breaking changes
- [ ] Update docs if syntax changed
- [ ] Run readability check
- [ ] Run build validation

## Results
[Table of updated examples with old/new versions]
```

**Step 2**: Find all examples
```bash
git grep "# Library:" docs/ > code-examples.txt
```

**Step 3**: Test and update
- Try each example with latest library version
- If works: Update version and date
- If breaks: Fix code or pin to last working version

**Step 4**: Commit
```bash
git commit -m "chore: quarterly code example review Q1 2025"
```

**Step 5**: Document
- Close tracking issue
- Note any major changes in changelog

---

## Deployment (Automated)

Deployment happens automatically via GitHub Actions:

**Trigger**: Push to `main` branch
**Process**:
1. GitHub Actions runner starts
2. Installs dependencies
3. Runs readability check
4. Builds site
5. Runs Lighthouse CI
6. Deploys to GitHub Pages (if all pass)
7. Site live at: https://[username].github.io/Humanoid_Robotics_Book/

**Time**: ~3-5 minutes from push to live

**Manual Override** (maintainers only):
```bash
npm run deploy
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (note PID, then Task Manager)

# Or use different port
npm start -- --port 3001
```

### Build Fails with Cache Issues

```bash
npm run clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Changes Not Appearing

- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Check file saved
- Restart dev server: `Ctrl+C` then `npm start`

### Readability Check False Positives

If technical terms cause low scores:
1. Add justification in PR: "Technical domain terms required: [list terms]"
2. Manual review: Reviewer checks if terms are explained
3. Acceptable if average across chapter is ≥60

### Lighthouse Score Below 90

- Check alt text on all images
- Verify color contrast (use browser DevTools)
- Ensure proper heading hierarchy (h1 → h2 → h3, no skips)
- Test keyboard navigation (Tab through interactive elements)

---

## Getting Help

- **Documentation Issues**: Open issue on GitHub
- **Technical Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues with reproduction steps
- **Feature Requests**: GitHub Discussions → Issues if approved

**Response Time**: Typically 1-3 business days

---

## Next Steps

Now that you're set up:

1. **Read a few existing chapters** to understand style and structure
2. **Review the chapter template** (`specs/001-ai-native-book/contracts/chapter-template.mdx`)
3. **Pick a chapter to write** from planned outline (see `plan.md`)
4. **Follow authoring guide** above
5. **Test locally** before committing
6. **Create PR** and request review

**Estimated Time**: 15 minutes to set up, 30 minutes to write first chapter

Welcome to the project! 🚀
