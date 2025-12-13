import React, { useState, useEffect } from 'react';
import { createAuthClient } from 'better-auth/react';
import '../../css/feature-button.css';

interface PersonalizeButtonProps {
  chapterId: string;
}

// Get auth client with production backend URL
const getAuthClient = () => {
  // Use production HF Spaces backend, fallback to localhost for development
  const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
    : 'http://localhost:4000/api/auth';

  return createAuthClient({ baseURL });
};

const PersonalizeButton: React.FC<PersonalizeButtonProps> = ({ chapterId }) => {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = getAuthClient();
        const session = await authClient.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);

  // Store original content on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const contentElement = document.querySelector('.markdown');
      if (contentElement && !originalContent) {
        setOriginalContent(contentElement.innerHTML);
      }
    }
  }, [originalContent]);

  const handlePersonalize = async () => {
    if (isPersonalized) {
      // Toggle back to original content
      const contentElement = document.querySelector('.markdown');
      if (contentElement && originalContent) {
        contentElement.innerHTML = originalContent;
        setIsPersonalized(false);
        setError(null);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the backend URL
      const backendURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space'
        : 'http://localhost:4000';

      // Call personalization API
      const response = await fetch(`${backendURL}/api/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ chapterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to personalize content');
      }

      const result = await response.json();

      // Update the page content with personalized content
      const contentElement = document.querySelector('.markdown');
      if (contentElement) {
        setPersonalizedContent(result.content);
        contentElement.innerHTML = result.content;
        setIsPersonalized(true);
      }
    } catch (err: any) {
      console.error('Personalization error:', err);
      setError(err.message || 'Failed to personalize content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="feature-button-container">
      <button
        className={`feature-button personalize-button ${isPersonalized ? 'active' : ''}`}
        onClick={handlePersonalize}
        disabled={loading}
        aria-label={isPersonalized ? 'Restore original content' : 'Personalize this chapter'}
      >
        {loading ? (
          <>
            <span className="spinner" />
            <span>Personalizing...</span>
          </>
        ) : isPersonalized ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7 5h2v4H7V5zm0 5h2v2H7v-2z"
                fill="currentColor"
              />
            </svg>
            <span>Restore Original</span>
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 1a5 5 0 1 0 0 10A5 5 0 0 0 8 3zm.5 2.5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1H9v2a.5.5 0 0 1-1 0V9H6a.5.5 0 0 1 0-1h2V6a.5.5 0 0 1 .5-.5z"
                fill="currentColor"
              />
            </svg>
            <span>Personalize</span>
          </>
        )}
      </button>
      {error && (
        <div className="feature-button-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default PersonalizeButton;
