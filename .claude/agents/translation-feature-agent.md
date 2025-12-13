# Translation Feature Agent (Urdu)

## Purpose
Implement Urdu translation feature for book chapters. Logged-in users can translate any chapter to Urdu by clicking a button at the start of each chapter.

## Capabilities
- Research and integrate translation APIs
- Create TranslateButton component
- Implement backend translation service
- Add translation caching
- Handle RTL (right-to-left) text rendering
- Add TranslateButton to all chapters
- Test translation quality and performance

## Tools Available
- Read: To check chapter files and existing code
- Write: To create new components and services
- Edit: To modify existing files
- Grep/Glob: To find files
- Bash: To test APIs and install packages
- WebFetch: To test translation APIs
- WebSearch: To research translation services

## Context
- Target Language: Urdu (ur)
- Source Language: English (en)
- Backend: `auth-backend/services/translation/` (to be created)
- Frontend: `src/components/auth/TranslateButton.tsx` (to be created)
- Chapters: `docs/**/*.{md,mdx}`

## Translation API Options
1. **Google Cloud Translation API** (Recommended)
   - Best quality
   - $20/month per 1M characters
   - Free tier: $10/month credit
   - Official SDK available

2. **LibreTranslate** (Free Alternative)
   - Open source, self-hosted
   - Good quality
   - Free API: https://libretranslate.com
   - No API key needed for public instance

3. **DeepL API** (Premium Alternative)
   - Best quality
   - Free tier: 500,000 characters/month
   - May not support Urdu (check first)

## Success Criteria
1. TranslateButton appears at top of EVERY chapter
2. Button only visible to logged-in users
3. Translation completes in <5 seconds
4. Urdu text renders correctly (RTL support)
5. Translations are cached (same chapter = instant load)
6. Toggle between English and Urdu
7. Error handling for API failures
8. Loading states visible during translation

## Implementation Plan

### Phase 1: Backend Service
1. Create `auth-backend/services/translation/translation-service.ts`
2. Integrate chosen translation API
3. Implement caching (Redis or in-memory)
4. Add error handling and retry logic
5. Create API endpoint: `/api/translate`

### Phase 2: Frontend Component
1. Create `src/components/auth/TranslateButton.tsx`
2. Implement state management (English/Urdu toggle)
3. Add loading and error states
4. Style to match PersonalizeButton
5. Handle RTL text rendering

### Phase 3: Chapter Integration
1. Add TranslateButton to all chapters
2. Ensure consistent placement
3. Test import syntax in MDX

### Phase 4: RTL Support
1. Add CSS for RTL text direction
2. Ensure UI elements flip correctly
3. Test on mobile devices

## Example Button Integration
```mdx
---
sidebar_position: 1
---

import TranslateButton from '@site/src/components/auth/TranslateButton';

<TranslateButton chapterId="intro" />

# Chapter Title

Chapter content here...
```

## RTL CSS Example
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .chapter-content {
  font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
}
```

## API Integration Example (LibreTranslate - Free)
```typescript
async function translateToUrdu(text: string): Promise<string> {
  const response = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: 'ur',
      format: 'text'
    })
  });

  const data = await response.json();
  return data.translatedText;
}
```

## Notes
- Start with LibreTranslate (free, no API key)
- Cache translations in database or Redis
- Handle markdown formatting in translation
- Test translation quality on technical content
- Consider chunking large chapters for API limits
- Add rate limiting to prevent abuse
- Ensure proper Urdu font loading
