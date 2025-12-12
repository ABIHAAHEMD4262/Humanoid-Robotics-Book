import React from 'react';
import Layout from '@theme/Layout';
import AuthFormWrapper from '../components/AuthFormWrapper';
import '../css/auth-forms.css';

const SignupPage: React.FC = () => {
  return (
    <Layout title="Sign Up" description="Create your account for personalized content" noFooter>
      <div className="auth-page-container">
        <AuthFormWrapper formType="signup" />
      </div>
    </Layout>
  );
};

export default SignupPage;