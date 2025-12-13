import React, { useState } from 'react';
import { createAuthClient } from 'better-auth/react';
import '../../css/auth-forms.css';

interface FormData {
  email: string;
  password: string;
  name: string;
  softwareSkillLevel: string;
  hardwareType: string;
  preferredLanguage: string;
  roboticsExperience: string;
}

// Get auth client with production backend URL
const getAuthClient = () => {
  // Use production HF Spaces backend, fallback to localhost for development
  const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
    : 'http://localhost:4000/api/auth';

  return createAuthClient({ baseURL });
};

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    softwareSkillLevel: 'beginner',
    hardwareType: 'PC',
    preferredLanguage: 'English',
    roboticsExperience: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.name.trim()) {
      newFieldErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newFieldErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
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
      // Call the auth API with profile data
      console.log('Signup data:', formData);

      // Use Better-Auth sign up
      const authClient = getAuthClient();
      const result = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // Additional profile data can be sent as metadata
        data: {
          softwareSkillLevel: formData.softwareSkillLevel,
          hardwareType: formData.hardwareType,
          preferredLanguage: formData.preferredLanguage,
          roboticsExperience: formData.roboticsExperience,
        }
      });

      if (result?.error) {
        setError(result.error.message || 'An error occurred during signup');
      } else {
        setSuccess('Account created successfully! Redirecting to home...');
        setTimeout(() => {
          window.location.href = '/Humanoid-Robotics-Book/';
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred during signup. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define options for the profile fields with strict predefined choices
  const skillLevelOptions = ['beginner', 'intermediate', 'expert'];
  const hardwareTypeOptions = ['cloud', 'PC', 'Jetson', 'robot'];
  const languageOptions = ['English', 'Urdu', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const experienceOptions = ['none', 'hobbyist', 'professional'];

  return (
    <div className="auth-form-wrapper">
      <h2>Create Account</h2>
      <p className="auth-form-subtitle">Join us to personalize your learning experience</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={fieldErrors.name ? 'error' : ''}
            placeholder="Enter your full name"
          />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>

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
            placeholder="Minimum 6 characters"
          />
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="softwareSkillLevel">Software Skill Level</label>
            <select
              id="softwareSkillLevel"
              name="softwareSkillLevel"
              value={formData.softwareSkillLevel}
              onChange={handleChange}
            >
              {skillLevelOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hardwareType">Hardware Type</label>
            <select
              id="hardwareType"
              name="hardwareType"
              value={formData.hardwareType}
              onChange={handleChange}
            >
              {hardwareTypeOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preferredLanguage">Preferred Language</label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              {languageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roboticsExperience">Robotics Experience</label>
            <select
              id="roboticsExperience"
              name="roboticsExperience"
              value={formData.roboticsExperience}
              onChange={handleChange}
            >
              {experienceOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="auth-link">
          Already have an account? <a href="/Humanoid-Robotics-Book/signin">Sign in here</a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;