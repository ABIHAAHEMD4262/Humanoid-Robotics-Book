import React from 'react';
import Layout from '@theme/Layout';
import AuthFormWrapper from '../components/AuthFormWrapper';

const SigninPage: React.FC = () => {
  return (
    <Layout title="Sign In" description="Sign in to access personalized content">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <h1>Sign In to Your Account</h1>
            <p>
              Access your personalized chapters based on your software/hardware background.
            </p>

            <AuthFormWrapper formType="signin" />

            <div className="margin-top--lg">
              <p>
                Don't have an account? <a href="/signup">Sign up here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SigninPage;