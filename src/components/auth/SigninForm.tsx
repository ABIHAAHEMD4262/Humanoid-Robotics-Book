import React, { useState } from 'react';
import { createAuthClient } from 'better-auth/react';
import '../../css/auth-forms.css';

interface FormData {
  email: string;
  password: string;
}

// Get auth client with production backend URL
const getAuthClient = () => {
  // Use production HF Spaces backend, fallback to localhost for development
  const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
    : 'http://localhost:4000/api/auth';

  return createAuthClient({ baseURL });
};

const SigninForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newFieldErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newFieldErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting sign in with email:', formData.email);

      // Use Better-Auth for signin
      const authClient = getAuthClient();
      console.log('Auth client configured with baseURL:',
        typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
          : 'http://localhost:4000/api/auth'
      );

      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        const errorMsg = result.error.message || 'An error occurred during sign in';
        console.error('Sign in error from server:', errorMsg);
        setError(errorMsg);
      } else if (result?.data) {
        console.log('Sign in successful, storing session data:', result.data);

        // Store session data in localStorage for persistence across page reloads
        if (result.data.session) {
          localStorage.setItem('better-auth.session', JSON.stringify(result.data.session));
          console.log('Stored session in localStorage');
        }

        if (result.data.user) {
          localStorage.setItem('better-auth.user', JSON.stringify(result.data.user));
          console.log('Stored user in localStorage:', result.data.user.email);
        }

        setSuccess('Sign in successful! Redirecting...');

        // Get the redirect URL from query params or default to homepage
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/Humanoid-Robotics-Book/';

        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      } else {
        setError('Sign in failed. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('Sign in exception:', err);

      // Provide more helpful error messages
      let errorMessage = 'An error occurred during sign in.';

      if (err?.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to authentication server. Please ensure the backend is running.';
      } else if (err?.message?.includes('CORS')) {
        errorMessage = 'Authentication server connection blocked. Please check CORS configuration.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <h2>Welcome Back</h2>
      <p className="auth-form-subtitle">Sign in to continue your learning journey</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={fieldErrors.email ? 'error' : ''}
            placeholder="you@example.com"
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={fieldErrors.password ? 'error' : ''}
            placeholder="Enter your password"
          />
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="auth-link">
          Don't have an account? <a href="/Humanoid-Robotics-Book/signup">Sign up here</a>
        </div>
      </form>
    </div>
  );
};

export default SigninForm;