---
id: 0003
title: Generate spec for Physical AI Robotics Book
stage: spec
date: 2025-12-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-physical-ai-book
branch: 001-physical-ai-book
user: CLI_user
command: /sp.specify
labels: ["book-creation", "specification"]
links:
  spec: specs/001-physical-ai-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-physical-ai-book/spec.md (modified)
  - specs/001-physical-ai-book/checklists/requirements.md (created)
tests:

---

## Prompt

Book Title: Physical AI & Humanoid Robotics – Embodied Intelligence with ROS 2, Isaac Sim, and Vision-Language-Action Models
Subtitle: A Complete Hands-On Guide from Simulation to Real Humanoid Control (2025 Edition)

Project Type: Spec-driven technical book built with Docusaurus 3 + MDX
Target Length: 30,000 – 45,000 words (main content only)
License: CC-BY-4.0 (text) + MIT (code)
Deployment: GitHub Pages (zero-cost, fully reproducible)

Target Audience
- Senior AI/CS/Robotics students
- Developers and researchers entering Physical AI in 2025
- Makers who want to run the full stack on their own laptop/Jetson

Reader Success Criteria (must be achievable after reading)
- Can spin up a complete humanoid digital twin in <30 minutes
- Can control a simulated (and optionally real) humanoid using only voice/natural language
- Can explain and reproduce every piece of the modern Physical AI stack
- Has a fully working capstone project they can show in a portfolio or demo

Official Book Structure – Exactly 4 Core Modules (as defined by the course)

Module 0 – Foundations of Physical AI and Embodied Intelligence
Module 1 – The Robotic Nervous System (ROS 2)
Module 2 – The Digital Twin (Gazebo & Unity)
Module 3 – The AI-Robot Brain (NVIDIA Isaac™ Platform)
Module 4 – Vision-Language-Action (VLA) & Conversational Humanoids

Full Outline

01-Introduction.md
   ├ Why Physical AI Matters in 2025
   ├ From Digital AI → Embodied Intelligence
   ├ Overview of the 4-Module Journey
   ├ Required Hardware (2025 Buyer’s Guide – $700 to $20k paths)

Module 1 – The Robotic Nervous System (ROS 2)
   ├ ROS 2 Core Concepts, Nodes, Topics, Services, Actions
   ├ Python + rclpy Development Workflow
   ├ URDF/Xacro for Humanoid Robots
   ├ Building & Launching Complete ROS 2 Packages
   ├ Mini-Project: Walking Gait Publisher in Python

Module 2 – The Digital Twin (Gazebo & Unity)
   ├ Gazebo Ignition/Harmonic Setup & Physics Tuning
   ├ Full Humanoid URDF → SDF Conversion
   ├ Sensor Simulation (LiDAR, Depth Camera, IMU)
   ├ Unity for High-Fidelity Visualization & HRI
   ├ Mini-Project: Realistic Apartment Environment + Sensor Data Streaming

Module 3 – The AI-Robot Brain (NVIDIA Isaac™)
   ├ Isaac Sim (Omniverse) – Photorealistic Simulation & Synthetic Data
   ├ Isaac ROS – Hardware-Accelerated Perception (VSLAM, 3D Reconstruction)
   ├ Nav2 Stack for Bipedal Navigation
   ├ Domain Randomization & Sim-to-Real Techniques
   ├ Mini-Project: Autonomous Navigation in Cluttered Indoor Scene

Module 4 – Vision-Language-Action (VLA)
   ├ OpenAI Whisper → Speech-to-Text on Jetson
   ├ LLM (Local or API) → Task Planning → ROS 2 Action Sequence
   ├ End-to-End VLA Pipeline (Voice → Perception → Planning → Execution)
   ├ Full Capstone Project: “Talk to Your Humanoid” – Pick-and-place via natural language
   ├ Optional Real-Robot Deployment Guide (Jetson + Unitree G1/Go2)

Appendices
   A. 2025 Hardware Buyer’s Guide (Budget → Premium)
   B. Economy Jetson Kit BOM (~$700)
   C. Cloud-Only Path (AWS g5/g6 instances)
   D. Devcontainer + Docker Setup (100% reproducible environment)
   E. Troubleshooting FAQ (Ubuntu + RTX + ROS 2 + Isaac Sim) Constraints (Strict)
- 100% aligned with the official 4-module Panaversity curriculum
- Every code snippet tested on Ubuntu 22.04 + RTX 40-series (or documented cloud equivalent)
- Minimum 60 working code examples
- Minimum 50 diagrams/screenshots (all reproducible or properly licensed)
- All references APA + clickable link
- Zero dead links, zero “sudo apt install latest”, zero untested commands"

## Response snapshot

The specification for the "Physical AI & Humanoid Robotics Book" has been created at `specs/001-physical-ai-book/spec.md` and validated against the quality checklist.

All checklist items passed, indicating the specification is ready for the next phase, which is implementation planning (`/sp.plan`).

## Outcome

- ✅ Impact: Specification for the book created and validated.
- 🧪 Tests: N/A
- 📁 Files: Created `specs/001-physical-ai-book/spec.md` and `specs/001-physical-ai-book/checklists/requirements.md`.
- 🔁 Next prompts: `/sp.plan`
- 🧠 Reflection: Successfully created a detailed feature specification and validated it. Handled PowerShell script execution issues by manually creating files and filling the template.

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell script `create-new-feature.ps1` failed due to argument parsing for multi-line JSON string. Resolved by manual file creation and template filling.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Improve `create-new-feature.ps1` to handle multi-line string arguments more robustly or use a file-based input for the feature description.
