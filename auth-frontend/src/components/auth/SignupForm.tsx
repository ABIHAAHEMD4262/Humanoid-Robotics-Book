import React, { useState } from 'react';
import { signIn } from 'better-auth/react';

interface FormData {
  email: string;
  password: string;
  name: string;
  softwareSkillLevel: string;
  hardwareType: string;
  preferredLanguage: string;
  roboticsExperience: string;
}

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
      // In a real implementation, we would call the auth API with profile data
      // For now, we'll simulate the signup process
      console.log('Signup data:', formData);

      // This is a simplified example - in reality, Better-Auth would handle the signup
      // and we would add the custom profile fields during the process
      const result = await signIn('email-password', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // Custom profile fields would be added here
        profileData: {
          softwareSkillLevel: formData.softwareSkillLevel,
          hardwareType: formData.hardwareType,
          preferredLanguage: formData.preferredLanguage,
          roboticsExperience: formData.roboticsExperience,
        },
        callbackURL: '/profile', // Redirect to profile page after signup
      });

      if (result.error) {
        setError(result.error.message || 'An error occurred during signup');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        // In a real app, you would redirect the user after successful signup
        setTimeout(() => {
          window.location.href = '/profile';
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
    <div className="signup-form-container">
      <h2>Create Account</h2>
      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ffcccc', backgroundColor: '#ffe6e6', borderRadius: '4px'}}>{error}</div>}
      {success && <div className="success-message" style={{color: 'green', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccffcc', backgroundColor: '#e6ffe6', borderRadius: '4px'}}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="name" style={{display: 'block', marginBottom: '0.5rem'}}>Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: fieldErrors.name ? '1px solid #ff0000' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          {fieldErrors.name && <div style={{color: '#ff0000', fontSize: '0.875rem', marginTop: '0.25rem'}}>{fieldErrors.name}</div>}
        </div>

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

        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="softwareSkillLevel" style={{display: 'block', marginBottom: '0.5rem'}}>Software Skill Level</label>
          <select
            id="softwareSkillLevel"
            name="softwareSkillLevel"
            value={formData.softwareSkillLevel}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            {skillLevelOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="hardwareType" style={{display: 'block', marginBottom: '0.5rem'}}>Hardware Type</label>
          <select
            id="hardwareType"
            name="hardwareType"
            value={formData.hardwareType}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            {hardwareTypeOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="preferredLanguage" style={{display: 'block', marginBottom: '0.5rem'}}>Preferred Language</label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            {languageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{marginBottom: '1rem'}}>
          <label htmlFor="roboticsExperience" style={{display: 'block', marginBottom: '0.5rem'}}>Experience with Robotics</label>
          <select
            id="roboticsExperience"
            name="roboticsExperience"
            value={formData.roboticsExperience}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            {experienceOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;