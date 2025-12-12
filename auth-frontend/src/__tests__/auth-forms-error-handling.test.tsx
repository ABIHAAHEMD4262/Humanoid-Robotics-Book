import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupForm from '../components/auth/SignupForm';
import SigninForm from '../components/auth/SigninForm';

// Mock the better-auth/react module
jest.mock('better-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Auth Forms Error Handling', () => {
  const { signIn } = require('better-auth/react');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SignupForm', () => {
    test('displays field-specific errors on invalid input', () => {
      render(<SignupForm />);

      // Submit empty form
      fireEvent.click(screen.getByText('Sign Up'));

      // Check for field-specific errors
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('clears field errors when user starts typing', () => {
      render(<SignupForm />);

      // Submit empty form to trigger errors
      fireEvent.click(screen.getByText('Sign Up'));
      expect(screen.getByText('Name is required')).toBeInTheDocument();

      // Type in the name field
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });

      // Error should be cleared
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });

    test('validates email format', () => {
      render(<SignupForm />);

      // Enter invalid email
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign Up'));

      // Check for email validation error
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('validates password length', () => {
      render(<SignupForm />);

      // Enter short password
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123' } // Too short
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign Up'));

      // Check for password validation error
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    test('shows error message when API call fails', async () => {
      // Mock API failure
      (signIn as jest.Mock).mockResolvedValue({ error: { message: 'Signup failed' } });

      render(<SignupForm />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign Up'));

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Signup failed')).toBeInTheDocument();
      });
    });

    test('shows success message on successful signup', async () => {
      // Mock successful API call
      (signIn as jest.Mock).mockResolvedValue({ error: null });

      render(<SignupForm />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign Up'));

      // Wait for success message to appear
      await waitFor(() => {
        expect(screen.getByText('Account created successfully! Redirecting...')).toBeInTheDocument();
      });
    });
  });

  describe('SigninForm', () => {
    test('displays field-specific errors on invalid input', () => {
      render(<SigninForm />);

      // Submit empty form
      fireEvent.click(screen.getByText('Sign In'));

      // Check for field-specific errors
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('validates email format', () => {
      render(<SigninForm />);

      // Enter invalid email
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign In'));

      // Check for email validation error
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('shows error message when API call fails', async () => {
      // Mock API failure
      (signIn as jest.Mock).mockResolvedValue({ error: { message: 'Signin failed' } });

      render(<SigninForm />);

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Sign In'));

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Signin failed')).toBeInTheDocument();
      });
    });
  });
});