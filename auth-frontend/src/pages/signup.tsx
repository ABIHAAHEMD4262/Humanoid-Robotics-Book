import React from 'react';
import Layout from '@theme/Layout';
import AuthFormWrapper from '../components/AuthFormWrapper';

const SignupPage: React.FC = () => {
  return (
    <Layout title="Sign Up" description="Create your account for personalized content">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <h1>Sign Up for Personalized Content</h1>
            <p>
              Create an account to access personalized chapters based on your software/hardware background.
              We'll ask for a few details to customize your learning experience.
            </p>

            <AuthFormWrapper formType="signup" />

            <div className="margin-top--lg">
              <p>
                Already have an account? <a href="/signin">Sign in here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;