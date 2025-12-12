import React from 'react';
import Layout from '@theme/Layout';
import AuthFormWrapper from '../components/AuthFormWrapper';
import '../css/auth-forms.css';

const SigninPage: React.FC = () => {
  return (
    <Layout title="Sign In" description="Sign in to access personalized content" noFooter>
      <div className="auth-page-container">
        <AuthFormWrapper formType="signin" />
      </div>
    </Layout>
  );
};

export default SigninPage;