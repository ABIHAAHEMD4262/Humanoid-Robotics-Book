# Personalization Feature Implementation

You are an expert at implementing personalization features for educational content. Your task is to complete the chapter personalization feature for the Humanoid Robotics Book hackathon project.

## Objective
Implement a fully functional personalization feature that allows logged-in users to personalize book chapter content based on their profile (skill level, hardware type, preferred language, robotics experience). This feature is worth 50 bonus points in the hackathon.

## Requirements
1. ✅ PersonalizeButton appears at the TOP of EVERY chapter
2. ✅ Button only visible to logged-in users
3. ✅ Personalization completes in <5 seconds
4. ✅ Content is properly personalized based on user profile
5. ✅ Error handling works gracefully
6. ✅ Loading states are visible
7. ✅ Can toggle back to original content
8. ✅ Subsequent requests use cache (instant)

## Implementation Steps

### Step 1: Audit Current Implementation
1. Check if `src/components/auth/PersonalizeButton.tsx` exists
2. Verify backend service: `auth-backend/services/personalization/`
3. Find all chapter files: `docs/**/*.{md,mdx}`
4. Count how many chapters already have PersonalizeButton
5. Test backend API: `POST /api/personalize`

### Step 2: Component Implementation
1. If PersonalizeButton doesn't exist, create it:
   - Import necessary hooks (useState, useEffect)
   - Add loading state
   - Add error state
   - Add toggle state (original/personalized)
   - Style to match design system (glassmorphism)
   - Add accessibility (ARIA labels)

2. Implement personalization logic:
   - Fetch user profile from auth context
   - Call backend API: `/api/personalize`
   - Cache response in state
   - Handle errors gracefully
   - Show loading spinner during API call

### Step 3: Add Button to All Chapters
1. Use the chapter-button-injector skill or do manually:
   - Find all chapter files
   - Add import statement
   - Add PersonalizeButton component
   - Extract chapter ID from path or frontmatter
   - Ensure consistent placement (after frontmatter)

2. Example integration:
```mdx
---
sidebar_position: 1
---

import PersonalizeButton from '@site/src/components/auth/PersonalizeButton';

<PersonalizeButton chapterId="intro" />

# Chapter Title
```

### Step 4: Backend Verification
1. Test API endpoint:
```bash
curl -X POST https://backend/api/personalize \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "intro",
    "profileData": {
      "softwareSkillLevel": "beginner",
      "hardwareType": "cloud",
      "preferredLanguage": "English",
      "roboticsExperience": "none"
    }
  }'
```

2. Verify response time (<5s)
3. Check caching works (subsequent calls instant)
4. Test error scenarios

### Step 5: Testing
1. Create test users with different profiles
2. Test personalization on multiple chapters
3. Verify content quality
4. Test toggle functionality
5. Test error handling (not logged in, API failure)
6. Test on mobile devices

### Step 6: Polish
1. Add smooth transitions
2. Improve error messages
3. Add "Restore Original" button
4. Verify responsive design
5. Check accessibility

## Success Criteria
- ✅ All chapters have PersonalizeButton
- ✅ Personalization works for all user profiles
- ✅ Performance: <5 seconds
- ✅ No console errors
- ✅ Works on mobile
- ✅ Accessible (WCAG 2.1 AA)

## Output
When complete, provide:
1. Number of chapters updated
2. Test results (pass/fail)
3. Performance metrics
4. Any issues found and fixed
5. Recommendation for submission

## Notes
- Focus on quality over speed
- Test thoroughly before marking complete
- Document any assumptions
- Create GitHub issues for bugs
- Ensure matches existing design system
