# Urdu Translation Feature Implementation

You are an expert at implementing translation features for multilingual content. Your task is to implement Urdu translation for the Humanoid Robotics Book hackathon project.

## Objective
Implement a fully functional Urdu translation feature that allows logged-in users to translate book chapters to Urdu. This feature is worth 50 bonus points in the hackathon.

## Requirements
1. ✅ TranslateButton appears at the TOP of EVERY chapter
2. ✅ Button only visible to logged-in users
3. ✅ Translation completes in <5 seconds
4. ✅ Urdu text renders correctly (RTL support)
5. ✅ Error handling works gracefully
6. ✅ Loading states are visible
7. ✅ Can toggle between English and Urdu
8. ✅ Subsequent requests use cache (instant)
9. ✅ Proper Urdu font loading

## Implementation Steps

### Step 1: Choose Translation API
1. Research options:
   - **LibreTranslate** (Free, recommended for start)
     - API: https://libretranslate.com/translate
     - No API key needed
     - Good quality
   - **Google Cloud Translation**
     - Best quality
     - $20/month per 1M characters
     - Free $10/month credit
   - **Azure Translator**
     - Excellent quality
     - Free tier available

2. Test chosen API:
```bash
# LibreTranslate example
curl -X POST https://libretranslate.com/translate \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Hello, welcome to the robotics book",
    "source": "en",
    "target": "ur",
    "format": "text"
  }'
```

### Step 2: Backend Translation Service
1. Create `auth-backend/services/translation/translation-service.ts`:
   - API client with error handling
   - Retry logic (3 attempts)
   - Timeout handling (10s)
   - In-memory caching
   - Rate limiting

2. Create API endpoint `/api/translate`:
   - Accept: `{ chapterId, targetLang }`
   - Fetch chapter content
   - Translate to Urdu
   - Cache translation
   - Return translated content

3. Example service structure:
```typescript
class TranslationService {
  private cache: Map<string, string> = new Map();

  async translateChapter(
    chapterId: string,
    targetLang: string
  ): Promise<string> {
    const cacheKey = `${chapterId}:${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const content = await this.getChapterContent(chapterId);
    const translated = await this.translateText(content, targetLang);

    this.cache.set(cacheKey, translated);
    return translated;
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    // API call with retry logic
  }
}
```

### Step 3: Frontend TranslateButton Component
1. Create `src/components/auth/TranslateButton.tsx`:
   - State management (English/Urdu toggle)
   - Loading state
   - Error state
   - Call `/api/translate` endpoint
   - Store translated content in state
   - Apply RTL styling when Urdu active

2. Component structure:
```tsx
const TranslateButton: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const [isUrdu, setIsUrdu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (isUrdu) {
      setIsUrdu(false); // Toggle back to English
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ chapterId, targetLang: 'ur' })
      });
      const data = await response.json();
      setTranslatedContent(data.content);
      setIsUrdu(true);
    } catch (err) {
      setError('Translation failed');
    } finally {
      setLoading(false);
    }
  };

  // Render button with loading/error states
};
```

### Step 4: RTL Support
1. Add Urdu font to `docusaurus.config.ts`:
```typescript
stylesheets: [
  {
    href: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
    type: 'text/css',
  },
],
```

2. Add RTL CSS:
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Nastaliq Urdu', serif;
}

[dir="rtl"] .markdown {
  text-align: right;
}

[dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
  text-align: right;
}
```

3. Toggle direction when Urdu active:
```tsx
useEffect(() => {
  if (isUrdu) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
}, [isUrdu]);
```

### Step 5: Add Button to All Chapters
1. Use chapter-button-injector skill
2. Add to all MDX files:
```mdx
---
sidebar_position: 1
---

import TranslateButton from '@site/src/components/auth/TranslateButton';

<TranslateButton chapterId="intro" />

# Chapter Title
```

### Step 6: Testing
1. Test translation quality on technical content
2. Verify RTL rendering
3. Test toggle functionality
4. Verify performance (<5s)
5. Test caching (instant on second click)
6. Test error scenarios
7. Test on mobile devices
8. Verify Urdu font loads

### Step 7: Optimization
1. Chunk large chapters for API limits
2. Implement request deduplication
3. Add loading progress indicator
4. Cache translations in localStorage
5. Add retry on failure

## Success Criteria
- ✅ All chapters have TranslateButton
- ✅ Translation works and is accurate
- ✅ RTL text displays correctly
- ✅ Urdu font loads properly
- ✅ Performance: <5 seconds
- ✅ Toggle works smoothly
- ✅ No console errors
- ✅ Works on mobile

## Translation API Priority
1. **Start with LibreTranslate** (free, no setup)
2. **Upgrade to Google Translate** if quality issues
3. **Consider Azure Translator** as alternative

## Output
When complete, provide:
1. Translation API used
2. Number of chapters updated
3. Test results (translation quality, performance)
4. RTL rendering verification
5. Any issues and fixes
6. Recommendation for submission

## Notes
- Test translation quality on technical terms
- Ensure markdown formatting preserved
- Handle code blocks (don't translate)
- Consider chunking for large chapters
- Monitor API costs/limits
- Document API setup in README
