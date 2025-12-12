import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import SignupForm from './auth/SignupForm';
import SigninForm from './auth/SigninForm';

interface AuthFormWrapperProps {
  formType: 'signup' | 'signin';
}

const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({ formType }) => {
  const renderForm = () => {
    switch (formType) {
      case 'signup':
        return <SignupForm />;
      case 'signin':
        return <SigninForm />;
      default:
        return <SignupForm />;
    }
  };

  const errorFallback = (
    <div style={{
      padding: '2rem',
      backgroundColor: '#ffe6e6',
      border: '1px solid #ffcccc',
      borderRadius: '4px',
      color: '#d00',
      margin: '1rem 0'
    }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Authentication form failed to load</h3>
      <p>There was an error loading the authentication form. Please try refreshing the page.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#007cba',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh Page
      </button>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      {renderForm()}
    </ErrorBoundary>
  );
};

export default AuthFormWrapper;