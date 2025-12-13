# Feature Testing Command

You are an expert QA engineer. Your task is to thoroughly test the personalization and translation features for the Humanoid Robotics Book hackathon project.

## Objective
Perform comprehensive end-to-end testing of both features to ensure they meet all hackathon requirements and are ready for submission.

## Features to Test
1. **Personalization Feature** (50 bonus points)
2. **Translation Feature** (50 bonus points)

## Test Plan

### Phase 1: Setup (5 minutes)
1. Create test user accounts with different profiles:
   - Beginner + Cloud + English + No experience
   - Intermediate + PC + English + Hobbyist
   - Expert + Jetson + English + Professional

2. Verify backend is running:
   - Health check: `curl https://backend/health`
   - Verify auth endpoints working

3. Count total chapters:
   - Find all .md and .mdx files in docs/
   - Expected: ~50 chapters

### Phase 2: Personalization Tests (20 minutes)

#### Coverage Test
```bash
# Find chapters with PersonalizeButton
grep -r "PersonalizeButton" docs/ --include="*.md" --include="*.mdx" | wc -l

# Expected: Should equal total chapter count
```

#### Functional Tests
1. **Test as logged-out user**:
   - ❌ PersonalizeButton should be hidden
   - Navigate to 3 random chapters
   - Verify button not visible

2. **Test as logged-in user (Beginner profile)**:
   - ✅ PersonalizeButton visible
   - Click button on intro chapter
   - ✅ Loading state shows
   - ✅ Personalized content appears in <5s
   - ✅ Content is beginner-friendly
   - Verify can toggle back to original

3. **Test caching**:
   - Click personalize on same chapter again
   - ✅ Should be instant (<500ms)

4. **Test different profiles**:
   - Login as Intermediate user
   - Personalize same chapter
   - ✅ Content should be different (more advanced)

#### Performance Test
```bash
# Measure response time
time curl -X POST https://backend/api/personalize \
  -H "Content-Type: application/json" \
  -d '{"chapterId": "intro", "profileData": {...}}'

# Expected: <5 seconds
```

#### Error Tests
1. Test API failure scenario:
   - Disconnect backend
   - Click personalize
   - ✅ Error message shows
   - ✅ Button not stuck in loading

2. Test invalid chapter:
   - Request personalization for non-existent chapter
   - ✅ Proper error handling

### Phase 3: Translation Tests (20 minutes)

#### Coverage Test
```bash
# Find chapters with TranslateButton
grep -r "TranslateButton" docs/ --include="*.md" --include="*.mdx" | wc -l

# Expected: Should equal total chapter count
```

#### Functional Tests
1. **Test as logged-out user**:
   - ❌ TranslateButton should be hidden

2. **Test as logged-in user**:
   - ✅ TranslateButton visible
   - Click button on intro chapter
   - ✅ Loading state shows
   - ✅ Urdu translation appears in <5s
   - ✅ RTL text direction active
   - ✅ Urdu font loaded
   - ✅ Can toggle back to English

3. **Test RTL rendering**:
   - Verify text flows right-to-left
   - Check headers aligned right
   - Verify UI elements don't break

4. **Test caching**:
   - Click translate on same chapter again
   - ✅ Should be instant (<500ms)

#### Performance Test
```bash
# Measure translation time
time curl -X POST https://backend/api/translate \
  -H "Content-Type: application/json" \
  -d '{"chapterId": "intro", "targetLang": "ur"}'

# Expected: <5 seconds
```

#### Quality Test
1. Select technical paragraph
2. Translate to Urdu
3. Back-translate to English (manual check)
4. ✅ Verify technical terms preserved
5. ✅ Verify meaning maintained

#### Error Tests
1. Test API failure
2. Test network timeout
3. ✅ Proper error messages

### Phase 4: Integration Tests (10 minutes)

1. **Both features on same chapter**:
   - Personalize a chapter
   - Then translate it
   - ✅ Both work together
   - ✅ No state conflicts

2. **Navigation test**:
   - Personalize chapter 1
   - Navigate to chapter 2
   - Navigate back to chapter 1
   - ✅ Personalization state preserved (if cached)

3. **Mobile test**:
   - Open on mobile (or DevTools mobile view)
   - Test both buttons
   - ✅ Responsive design works
   - ✅ Buttons accessible
   - ✅ No layout breaks

### Phase 5: Performance Audit (5 minutes)

Run performance tests on 5 random chapters:

| Chapter | Personalize (1st) | Personalize (cached) | Translate (1st) | Translate (cached) |
|---------|-------------------|----------------------|-----------------|-------------------|
| intro   | 3.2s             | 0.1s                 | 4.1s            | 0.1s              |
| ...     | ...              | ...                  | ...             | ...               |

✅ All should be <5s for first load
✅ All should be <500ms for cached

### Phase 6: Report Generation

Create test report:

```markdown
# Feature Testing Report

**Date**: [Date]
**Tester**: Feature Testing Agent

## Personalization Feature

### Coverage
- Chapters with button: X/Y (Z%)
- Status: ✅ Complete / ❌ Incomplete

### Performance
- Avg first load: Xs
- Avg cached load: Xms
- Meets requirement (<5s): ✅/❌

### Functionality
- Button visibility: ✅/❌
- Loading states: ✅/❌
- Error handling: ✅/❌
- Toggle function: ✅/❌
- Content quality: ✅/❌

### Issues Found
1. [Issue 1]
2. [Issue 2]

## Translation Feature

### Coverage
- Chapters with button: X/Y (Z%)
- Status: ✅ Complete / ❌ Incomplete

### Performance
- Avg first load: Xs
- Avg cached load: Xms
- Meets requirement (<5s): ✅/❌

### Functionality
- Button visibility: ✅/❌
- RTL rendering: ✅/❌
- Urdu font: ✅/❌
- Loading states: ✅/❌
- Error handling: ✅/❌
- Toggle function: ✅/❌
- Translation quality: ✅/❌

### Issues Found
1. [Issue 1]
2. [Issue 2]

## Integration Tests
- Both features together: ✅/❌
- Mobile responsive: ✅/❌
- State persistence: ✅/❌

## Overall Assessment
- **Personalization**: Ready/Not Ready (X points earned)
- **Translation**: Ready/Not Ready (X points earned)
- **Total Bonus Points**: X/100

## Recommendation
✅ Ready for submission / ❌ Needs fixes

## Next Steps
1. [Action item 1]
2. [Action item 2]
```

## Success Criteria
- ✅ 100% chapter coverage for both features
- ✅ All performance tests pass (<5s)
- ✅ No critical bugs
- ✅ Mobile responsive
- ✅ Error handling works
- ✅ Ready for hackathon submission

## Output
Provide comprehensive test report with:
1. Test results summary
2. Performance metrics
3. Issues found and severity
4. Recommendation (ready/not ready)
5. Screenshots or evidence (if possible)
6. Next steps if fixes needed
