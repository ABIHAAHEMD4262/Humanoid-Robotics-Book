import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PersonalizeButtonProps {
  chapterId: string;
  onPersonalizeSuccess?: (personalizedContent: string) => void;
  onPersonalizeError?: (error: string) => void;
}

const PersonalizeButton: React.FC<PersonalizeButtonProps> = ({
  chapterId,
  onPersonalizeSuccess,
  onPersonalizeError
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonalize = async () => {
    if (!isAuthenticated) {
      onPersonalizeError?.('Please sign in to personalize content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the personalization API
      const response = await fetch('/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapterId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to personalize content');
      }

      const data = await response.json();

      // Call the success callback with the personalized content
      onPersonalizeSuccess?.(data.content);
    } catch (err: any) {
      console.error('Personalization error:', err);
      setError(err.message);
      onPersonalizeError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <button disabled style={{ padding: '0.5rem 1rem', opacity: 0.6 }}>Checking auth...</button>;
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => window.location.href = '/signin'}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign In to Personalize
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handlePersonalize}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: loading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          margin: '0 0.5rem 0 0'
        }}
      >
        {loading ? 'Personalizing...' : 'Personalize Content'}
      </button>

      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PersonalizeButton;