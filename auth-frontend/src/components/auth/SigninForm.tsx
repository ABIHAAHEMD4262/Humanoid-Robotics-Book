import React, { useState } from 'react';
import { signIn } from 'better-auth/react';

interface FormData {
  email: string;
  password: string;
}

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
      console.log('Signin data:', formData);

      // Use Better-Auth for signin
      const result = await signIn('email-password', {
        email: formData.email,
        password: formData.password,
        callbackURL: '/', // Redirect to home page after signin
      });

      if (result.error) {
        setError(result.error.message || 'An error occurred during sign in');
      } else {
        setSuccess('Sign in successful! Redirecting...');
        // In a real app, you would redirect the user after successful signin
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred during sign in. Please try again.';
      setError(errorMessage);
      console.error('Signin error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-form-container">
      <h2>Sign In</h2>
      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ffcccc', backgroundColor: '#ffe6e6', borderRadius: '4px'}}>{error}</div>}
      {success && <div className="success-message" style={{color: 'green', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccffcc', backgroundColor: '#e6ffe6', borderRadius: '4px'}}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="email" style={{display: 'block', marginBottom: '0.5rem'}}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: fieldErrors.email ? '1px solid #ff0000' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          {fieldErrors.email && <div style={{color: '#ff0000', fontSize: '0.875rem', marginTop: '0.25rem'}}>{fieldErrors.email}</div>}
        </div>

        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="password" style={{display: 'block', marginBottom: '0.5rem'}}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: fieldErrors.password ? '1px solid #ff0000' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          {fieldErrors.password && <div style={{color: '#ff0000', fontSize: '0.875rem', marginTop: '0.25rem'}}>{fieldErrors.password}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="margin-top--lg" style={{marginTop: '1rem'}}>
        <p>
          Don't have an account? <a href="/signup" style={{color: '#007cba'}}>Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default SigninForm;