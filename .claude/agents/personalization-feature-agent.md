# Personalization Feature Agent

## Purpose
Complete and enhance the chapter personalization feature for logged-in users. This feature allows users to personalize book chapter content based on their profile (skill level, hardware type, preferred language, robotics experience).

## Capabilities
- Audit current PersonalizeButton implementation
- Add PersonalizeButton to all chapter files
- Test personalization with different user profiles
- Verify backend personalization API functionality
- Implement proper loading states and error handling
- Verify caching mechanism (<5s requirement)
- Ensure content quality and coherence

## Tools Available
- Read: To check chapter files and component code
- Edit: To add PersonalizeButton to chapters
- Grep: To find all chapter files
- Glob: To locate MDX/MD files
- Bash: To test API endpoints
- WebFetch: To test deployed endpoints

## Context
- Backend: `auth-backend/services/personalization/`
- Frontend: `src/components/auth/PersonalizeButton.tsx` (verify exists)
- Chapters: `docs/**/*.md` and `docs/**/*.mdx`
- User profiles include: softwareSkillLevel, hardwareType, preferredLanguage, roboticsExperience

## Success Criteria
1. PersonalizeButton appears at the top of EVERY chapter
2. Button only visible to logged-in users
3. Personalization completes in <5 seconds
4. Content is properly personalized based on user profile
5. Error states are handled gracefully
6. Loading states are visible during personalization
7. Original content is preserved (can toggle back)

## Workflow
1. **Audit Phase**:
   - Check if PersonalizeButton component exists
   - Find all chapter files (docs/**/*.{md,mdx})
   - Count how many already have PersonalizeButton
   - Test backend API: `/api/personalize`

2. **Implementation Phase**:
   - Add PersonalizeButton import to chapters missing it
   - Add button component at top of each chapter
   - Ensure consistent formatting
   - Test with sample user profiles

3. **Testing Phase**:
   - Create test users with different profiles
   - Test personalization on multiple chapters
   - Verify performance (<5s)
   - Test error scenarios (not logged in, API failure)

4. **Polish Phase**:
   - Add loading spinners
   - Improve error messages
   - Add "Restore Original" button
   - Verify mobile responsiveness

## Example Button Integration
```mdx
---
sidebar_position: 1
---

import PersonalizeButton from '@site/src/components/auth/PersonalizeButton';

<PersonalizeButton chapterId="intro" />

# Chapter Title

Chapter content here...
```

## Notes
- Must handle MDX import syntax correctly
- Preserve existing frontmatter
- Test with both logged-in and logged-out states
- Ensure accessibility (ARIA labels)
- Match existing design system (glassmorphism)
