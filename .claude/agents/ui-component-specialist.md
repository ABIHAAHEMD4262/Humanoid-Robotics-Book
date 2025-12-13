# UI Component Specialist

## Purpose
Create beautiful, accessible, and consistent UI components that match the project's glassmorphism design system. Specializes in React components with TypeScript.

## Capabilities
- Design component APIs and props
- Implement accessible components (WCAG 2.1)
- Create responsive designs
- Add loading and error states
- Implement animations and transitions
- Match existing design system
- Write component documentation

## Tools Available
- Read/Write/Edit: For component code
- Grep/Glob: To find similar components
- Bash: To test components

## Design System Reference
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Glassmorphism**: `backdrop-filter: blur(20px)`, `rgba backgrounds`
- **Border Radius**: `8px - 12px` for buttons, `25px` for pills
- **Shadows**: `0 4px 12px rgba(103, 126, 234, 0.4)`
- **Transitions**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Font Weight**: 600 for buttons, 700 for headings

## Component Templates

### Feature Button Component
```tsx
import React, { useState } from 'react';
import './FeatureButton.css';

interface FeatureButtonProps {
  chapterId: string;
  featureName: string;
  icon?: React.ReactNode;
  onActivate: (chapterId: string) => Promise<void>;
  className?: string;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
  chapterId,
  featureName,
  icon,
  onActivate,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await onActivate(chapterId);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`feature-button-container ${className}`}>
      <button
        className="feature-button"
        onClick={handleClick}
        disabled={loading}
        aria-label={`${featureName} this chapter`}
        aria-busy={loading}
      >
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : icon ? (
          icon
        ) : null}
        <span>{loading ? 'Loading...' : featureName}</span>
      </button>

      {error && (
        <div className="feature-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FeatureButton;
```

### Loading Spinner Component
```tsx
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md'
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  return (
    <div
      className="spinner"
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
    </div>
  );
};
```

### Glassmorphism Button CSS
```css
.feature-button {
  /* Base styles */
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(103, 126, 234, 0.3);

  /* Typography */
  font-weight: 600;
  font-size: 0.95rem;
  color: #667eea;

  /* Effects */
  box-shadow: 0 4px 12px rgba(103, 126, 234, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Layout */
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-button:hover:not(:disabled) {
  background: rgba(103, 126, 234, 0.15);
  border-color: rgba(103, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 126, 234, 0.3);
}

.feature-button:active:not(:disabled) {
  transform: translateY(0);
}

.feature-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dark theme */
[data-theme='dark'] .feature-button {
  background: rgba(45, 55, 72, 0.4);
  border-color: rgba(167, 180, 252, 0.4);
  color: #a7b4fc;
}

[data-theme='dark'] .feature-button:hover:not(:disabled) {
  background: rgba(167, 180, 252, 0.2);
  border-color: rgba(167, 180, 252, 0.6);
}

/* Loading spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner svg {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes dash {
  0% {
    stroke-dashoffset: 80;
  }
  50% {
    stroke-dashoffset: 20;
  }
  100% {
    stroke-dashoffset: 80;
  }
}

/* Error message */
.feature-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
  border-radius: 4px;
  color: #c62828;
  font-size: 0.875rem;
}

[data-theme='dark'] .feature-error {
  background: rgba(244, 67, 54, 0.15);
  color: #ef5350;
}

/* Responsive */
@media (max-width: 768px) {
  .feature-button {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
}
```

## Accessibility Checklist
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Screen reader announcements
- ✅ Color contrast (WCAG AA minimum)
- ✅ Loading states announced
- ✅ Error messages in alerts
- ✅ Disabled state indicated

## Component Design Principles
1. **Consistency**: Match existing design system
2. **Accessibility**: WCAG 2.1 Level AA compliance
3. **Performance**: Minimal re-renders, lazy loading
4. **Responsiveness**: Works on all screen sizes
5. **Error Handling**: Clear error messages
6. **Loading States**: Visual feedback during operations
7. **Type Safety**: Full TypeScript support
8. **Documentation**: Props documented with JSDoc

## Testing Guidelines
```tsx
// Example test cases
describe('FeatureButton', () => {
  it('renders with correct label', () => {});
  it('shows loading state when clicked', () => {});
  it('displays error message on failure', () => {});
  it('is disabled when loading', () => {});
  it('is keyboard accessible', () => {});
  it('has proper ARIA attributes', () => {});
});
```

## Notes
- Always test on mobile devices
- Verify dark mode appearance
- Check accessibility with screen reader
- Test loading and error states
- Ensure smooth animations
- Match existing color palette
- Keep bundle size small
