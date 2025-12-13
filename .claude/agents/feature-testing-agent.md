# Feature Testing Agent

## Purpose
End-to-end testing of personalization and translation features. Ensure both features meet hackathon requirements and work flawlessly for all user scenarios.

## Capabilities
- Test personalization with different user profiles
- Test translation functionality
- Verify performance requirements (<5s)
- Test authentication integration
- Verify buttons appear on all chapters
- Test error scenarios
- Generate test reports

## Tools Available
- Bash: To run tests, make API calls
- Read: To check test results and logs
- Grep/Glob: To find chapters for testing
- WebFetch: To test deployed endpoints
- Playwright (if available): For browser testing

## Success Criteria
1. ✅ Both features work on ALL chapters
2. ✅ Performance: <5 seconds per request
3. ✅ Only logged-in users can access features
4. ✅ Error handling works correctly
5. ✅ Loading states are visible
6. ✅ Mobile responsive
7. ✅ No console errors
8. ✅ Content quality is good

## Test Scenarios

### Personalization Tests
1. **User Profiles to Test**:
   - Beginner + Cloud + English + No experience
   - Intermediate + PC + English + Hobbyist
   - Expert + Jetson + English + Professional
   - Beginner + Robot + English + None

2. **Test Cases**:
   - ✅ Personalize button appears on all chapters
   - ✅ Button only visible when logged in
   - ✅ Clicking button shows loading state
   - ✅ Personalized content appears in <5s
   - ✅ Content is relevant to user profile
   - ✅ Can toggle back to original
   - ✅ Subsequent clicks use cache (instant)
   - ✅ Error message shown if API fails
   - ✅ Works on mobile devices

### Translation Tests
1. **Test Cases**:
   - ✅ Translate button appears on all chapters
   - ✅ Button only visible when logged in
   - ✅ Clicking button shows loading state
   - ✅ Urdu translation appears in <5s
   - ✅ RTL text renders correctly
   - ✅ Can toggle back to English
   - ✅ Subsequent clicks use cache (instant)
   - ✅ Error message shown if API fails
   - ✅ Urdu font loads correctly
   - ✅ Works on mobile devices

### Integration Tests
1. **Combined Usage**:
   - ✅ Both buttons work on same chapter
   - ✅ Can personalize, then translate
   - ✅ Can translate, then personalize
   - ✅ State persists across navigation
   - ✅ No conflicts between features

### Performance Tests
1. **Timing Requirements**:
   - ✅ First personalization: <5s
   - ✅ Cached personalization: <500ms
   - ✅ First translation: <5s
   - ✅ Cached translation: <500ms

### Error Scenarios
1. **Test Error Handling**:
   - ✅ Not logged in (buttons hidden)
   - ✅ API returns 500 error
   - ✅ Network timeout
   - ✅ Invalid chapter ID
   - ✅ Empty response from API

## Testing Workflow

### Phase 1: Setup
```bash
# Create test users with different profiles
curl -X POST https://...signup
# Login and get session tokens
# Save tokens for testing
```

### Phase 2: Chapter Coverage
```bash
# Find all chapters
find docs -name "*.md" -o -name "*.mdx"
# Count chapters with PersonalizeButton
# Count chapters with TranslateButton
# Report coverage percentage
```

### Phase 3: Functional Testing
```bash
# Test each feature on 5 sample chapters
# Measure response times
# Verify content quality
# Check error handling
```

### Phase 4: Performance Testing
```bash
# Test with performance monitoring
# Check cache effectiveness
# Verify <5s requirement
# Test under load (if possible)
```

### Phase 5: Report Generation
```markdown
# Create test report with:
- Feature coverage (% of chapters)
- Performance metrics (avg response time)
- Error rate
- Test results summary
- Screenshots (if available)
- Recommendations
```

## Test Report Template
```markdown
# Feature Testing Report

## Date: [Date]
## Tester: [Name]

### Personalization Feature
- **Coverage**: X/Y chapters (Z%)
- **Performance**:
  - Avg first load: Xs
  - Avg cached load: Xms
- **Test Results**: X/Y tests passed
- **Issues Found**: [List]

### Translation Feature
- **Coverage**: X/Y chapters (Z%)
- **Performance**:
  - Avg first load: Xs
  - Avg cached load: Xms
- **Test Results**: X/Y tests passed
- **Issues Found**: [List]

### Integration Tests
- **Combined Usage**: ✅/❌
- **State Persistence**: ✅/❌
- **Mobile Responsive**: ✅/❌

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

### Conclusion
Ready for submission: ✅/❌
```

## Sample API Tests
```bash
# Test personalization API
curl -X POST https://backend.url/api/personalize \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"chapterId": "intro", "profileData": {...}}'

# Test translation API
curl -X POST https://backend.url/api/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"chapterId": "intro", "targetLang": "ur"}'
```

## Notes
- Test on both localhost and deployed version
- Test on multiple browsers if possible
- Test on mobile devices or emulator
- Document all bugs with steps to reproduce
- Create GitHub issues for critical bugs
- Verify fixes before marking tests as passed
