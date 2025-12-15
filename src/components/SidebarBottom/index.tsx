import React, { useState, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import UserMenu from '../auth/UserMenu';
import './styles.css';

/**
 * SidebarBottom Component
 * Displays GitHub link, theme toggle, and user menu at the bottom of the sidebar
 * Only visible on doc pages with sidebar
 */
const SidebarBottom: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Import Better Auth dynamically
        const { createAuthClient } = await import('better-auth/react');

        const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
          : 'http://localhost:4000/api/auth';

        const authClient = createAuthClient({ baseURL });
        const session = await authClient.getSession();

        if (session?.data?.user) {
          setUser(session.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();

      // Re-check auth every 2 seconds to detect sign-in changes
      const interval = setInterval(checkAuth, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const { createAuthClient } = await import('better-auth/react');
      const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
        : 'http://localhost:4000/api/auth';

      const authClient = createAuthClient({ baseURL });
      await authClient.signOut();

      // Redirect to homepage after logout
      window.location.href = '/Humanoid-Robotics-Book/';
    } catch (err) {
      console.error('Logout error:', err);
      // Force reload to clear any cached state
      window.location.href = '/Humanoid-Robotics-Book/';
    }
  };

  const toggleTheme = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="sidebar-bottom">
      <div className="sidebar-bottom-divider" />

      <div className="sidebar-bottom-controls">
        {/* GitHub Link */}
        <a
          href="https://github.com/ABIHAAHEMD4262/Humanoid-Robotics-Book"
          className="sidebar-bottom-button"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          title="View on GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          <span>GitHub</span>
        </a>

        {/* Theme Toggle */}
        <button
          className="sidebar-bottom-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {colorMode === 'dark' ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>

        {/* User Menu - only show if authenticated */}
        {!loading && user && (
          <button
            className="sidebar-bottom-button sidebar-user-button"
            onClick={handleLogout}
            aria-label="Sign out"
            title={`Sign out (${user.email || user.name})`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarBottom;
