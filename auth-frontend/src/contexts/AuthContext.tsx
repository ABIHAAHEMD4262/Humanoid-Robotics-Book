import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'better-auth/react';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { session, signIn: authSignIn, signOut: authSignOut } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once session info is available
    setIsLoading(false);
  }, [session]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authSignIn({
        email,
        password,
        callbackURL: '/',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authSignOut();
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user: session?.user || null,
    isLoading,
    isAuthenticated: !!session?.user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};