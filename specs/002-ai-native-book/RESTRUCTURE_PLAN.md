# Book Restructuring Plan: Module → Chapter → Subtopic Hierarchy

**Created**: 2025-12-05
**Purpose**: Transform flat module structure into hierarchical Module → Chapter → Subtopic organization
**Status**: Planning

## Current Structure (Flat)

```
Module 1: ROS 2 Fundamentals
├── index.mdx (module overview)
├── core-concepts.mdx
├── python-rclpy.mdx
├── ros2-packages.mdx
├── urdf-xacro.mdx
└── mini-project-gait-publisher.mdx
```

## Target Structure (Hierarchical)

```
Module 1: The Robotic Nervous System (ROS 2)
├── Chapter 1: Core Communication Patterns
│   ├── 1.1-nodes.mdx (What are nodes?)
│   ├── 1.2-topics.mdx (Publisher-Subscriber streaming)
│   ├── 1.3-services.mdx (Request-Response patterns)
│   └── 1.4-actions.mdx (Long-running tasks with feedback)
│
├── Chapter 2: Python Development with rclpy
│   ├── 2.1-rclpy-basics.mdx (Node lifecycle, initialization)
│   ├── 2.2-publishers.mdx (Creating and managing publishers)
│   ├── 2.3-subscribers.mdx (Callback patterns, data handling)
│   └── 2.4-timers-callbacks.mdx (Periodic execution, event handling)
│
├── Chapter 3: Building & Deploying ROS 2 Packages
│   ├── 3.1-package-structure.mdx (Anatomy of a ROS 2 package)
│   ├── 3.2-colcon-build.mdx (Build system and compilation)
│   ├── 3.3-launch-files.mdx (Orchestrating multiple nodes)
│   └── 3.4-parameters.mdx (Configuration management)
│
├── Chapter 4: Robot Modeling with URDF & Xacro
│   ├── 4.1-urdf-basics.mdx (Links, joints, and robot structure)
│   ├── 4.2-xacro-macros.mdx (Parametric robot models)
│   ├── 4.3-visualization.mdx (RViz and robot_state_publisher)
│   └── 4.4-collision-inertia.mdx (Physics properties for simulation)
│
└── Chapter 5: Mini-Project - Humanoid Gait Publisher
    ├── 5.1-project-setup.mdx (Package creation and dependencies)
    ├── 5.2-gait-generation.mdx (Walking trajectory algorithms)
    ├── 5.3-joint-state-publishing.mdx (Publishing robot joint states)
    └── 5.4-testing-visualization.mdx (Verifying output in RViz)
```

## File Migration Map (Module 1)

| Current File | New Location | Content Split |
|--------------|--------------|---------------|
| `core-concepts.mdx` | Chapter 1 (4 files) | Split into nodes, topics, services, actions |
| `python-rclpy.mdx` | Chapter 2 (4 files) | Split into rclpy basics, publishers, subscribers, timers |
| `ros2-packages.mdx` | Chapter 3 (4 files) | Split into structure, build, launch, parameters |
| `urdf-xacro.mdx` | Chapter 4 (4 files) | Split into URDF basics, Xacro macros, visualization, physics |
| `mini-project-gait-publisher.mdx` | Chapter 5 (4 files) | Split into setup, generation, publishing, testing |

## Folder Structure Implementation

```
docs/
└── module1-ros2/
    ├── index.mdx (Module 1 overview)
    ├── chapter1-core-concepts/
    │   ├── index.mdx (Chapter 1 overview)
    │   ├── 1.1-nodes.mdx
    │   ├── 1.2-topics.mdx
    │   ├── 1.3-services.mdx
    │   └── 1.4-actions.mdx
    ├── chapter2-python-rclpy/
    │   ├── index.mdx (Chapter 2 overview)
    │   ├── 2.1-rclpy-basics.mdx
    │   ├── 2.2-publishers.mdx
    │   ├── 2.3-subscribers.mdx
    │   └── 2.4-timers-callbacks.mdx
    ├── chapter3-packages/
    │   ├── index.mdx (Chapter 3 overview)
    │   ├── 3.1-package-structure.mdx
    │   ├── 3.2-colcon-build.mdx
    │   ├── 3.3-launch-files.mdx
    │   └── 3.4-parameters.mdx
    ├── chapter4-urdf-xacro/
    │   ├── index.mdx (Chapter 4 overview)
    │   ├── 4.1-urdf-basics.mdx
    │   ├── 4.2-xacro-macros.mdx
    │   ├── 4.3-visualization.mdx
    │   └── 4.4-collision-inertia.mdx
    └── chapter5-mini-project/
        ├── index.mdx (Chapter 5 overview)
        ├── 5.1-project-setup.mdx
        ├── 5.2-gait-generation.mdx
        ├── 5.3-joint-state-publishing.mdx
        └── 5.4-testing-visualization.mdx
```

## Sidebar Configuration Updates

```typescript
{
  type: 'category',
  label: 'Module 1 – The Robotic Nervous System (ROS 2)',
  link: {type: 'doc', id: 'module1-ros2/index'},
  items: [
    {
      type: 'category',
      label: 'Chapter 1: Core Communication Patterns',
      link: {type: 'doc', id: 'module1-ros2/chapter1-core-concepts/index'},
      items: [
        'module1-ros2/chapter1-core-concepts/1.1-nodes',
        'module1-ros2/chapter1-core-concepts/1.2-topics',
        'module1-ros2/chapter1-core-concepts/1.3-services',
        'module1-ros2/chapter1-core-concepts/1.4-actions',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 2: Python Development with rclpy',
      link: {type: 'doc', id: 'module1-ros2/chapter2-python-rclpy/index'},
      items: [
        'module1-ros2/chapter2-python-rclpy/2.1-rclpy-basics',
        'module1-ros2/chapter2-python-rclpy/2.2-publishers',
        'module1-ros2/chapter2-python-rclpy/2.3-subscribers',
        'module1-ros2/chapter2-python-rclpy/2.4-timers-callbacks',
      ],
    },
    // ... chapters 3, 4, 5
  ],
},
```

## Content Splitting Strategy

### Principle: Each subtopic is a focused, self-contained lesson

**Guidelines**:
1. **Subtopic Length**: 800-1500 words (5-10 minute read)
2. **Examples**: Minimum 1 example per subtopic (preferably 2)
3. **Code Snippets**: 1-2 per subtopic
4. **Sections**: 3-5 H2 sections per subtopic
5. **Metadata**: Each subtopic includes reading time, prerequisites, difficulty

### Chapter Overview Pages

Each chapter index.mdx provides:
- Chapter learning objectives
- Overview of subtopics
- Prerequisites
- Navigation links to all subtopics
- Estimated total time for chapter

## Migration Process

### Phase 1: Planning & Spec Update
- ✅ Create restructure plan (this document)
- Update spec.md with hierarchical requirements
- Design content split for each current file

### Phase 2: Module 1 Implementation
- Create folder structure for Module 1 chapters
- Split core-concepts.mdx → Chapter 1 (4 subtopics)
- Split python-rclpy.mdx → Chapter 2 (4 subtopics)
- Split ros2-packages.mdx → Chapter 3 (4 subtopics)
- Split urdf-xacro.mdx → Chapter 4 (4 subtopics)
- Split mini-project-gait-publisher.mdx → Chapter 5 (4 subtopics)
- Create chapter index.mdx files

### Phase 3: Configuration Updates
- Update sidebars.ts with new hierarchy
- Update internal links across all files
- Verify navigation paths

### Phase 4: Testing
- Test local build
- Verify all links work
- Check mobile responsiveness
- Validate readability scores for new files

### Phase 5: Apply to Remaining Modules
- Module 2 (Digital Twin)
- Module 3 (Isaac Platform)
- Module 4 (VLA)
- Module 0 (Foundations)
- Appendices (if needed)

## Readability Considerations

**Challenge**: Splitting content may affect readability scores

**Strategy**:
- Maintain short sentences during split
- Add transitional text between subtopics
- Ensure each subtopic has complete introduction
- Run readability check on ALL new files
- Target ≥60 for each subtopic

## Internal Link Updates

**All links must be updated** from:
```markdown
[Python Development](./python-rclpy.mdx)
```

To:
```markdown
[Python Development](./chapter2-python-rclpy/index.mdx)
[rclpy Basics](./chapter2-python-rclpy/2.1-rclpy-basics.mdx)
```

## Benefits of New Structure

1. **Granular Navigation**: Users can jump to specific concepts
2. **Better Discoverability**: Sidebar shows all available topics
3. **Flexible Learning Paths**: Can skip or revisit subtopics
4. **Easier Maintenance**: Smaller files are easier to update
5. **Clear Progress**: Users see their position in chapter hierarchy
6. **Scalability**: Easy to add new subtopics within chapters

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Readability scores drop on split files | Run validation after each split, optimize sentences |
| Internal links break | Comprehensive link audit, automated link checking |
| Build failures | Test after each major change |
| Content duplication | Careful planning of content boundaries |
| Navigation becomes too deep | Limit to 3 levels: Module → Chapter → Subtopic |

## Success Criteria

- ✅ All modules restructured to Module → Chapter → Subtopic
- ✅ All subtopic files score ≥60 readability
- ✅ Site builds without errors
- ✅ All internal links valid
- ✅ Navigation intuitive in sidebar
- ✅ Mobile responsive at all levels
- ✅ No placeholder content remaining

## Next Steps

1. Update spec.md with hierarchical structure requirements
2. Begin Module 1 content splitting starting with Chapter 1
3. Test iteratively after each chapter
4. Proceed to remaining modules once Module 1 validated
