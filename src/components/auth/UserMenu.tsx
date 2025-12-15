import React, { useState, useEffect, useRef } from 'react';
import { createAuthClient } from 'better-auth/react';
import './UserMenu.css';

// Get auth client
const getAuthClient = () => {
  const baseURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://abihacodes-humanoid-robotics-book-auth.hf.space/api/auth'
    : 'http://localhost:4000/api/auth';

  return createAuthClient({ baseURL });
};

const UserMenu: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, check localStorage for session data
        const storedSession = localStorage.getItem('better-auth.session');
        const storedUser = localStorage.getItem('better-auth.user');

        console.log('[UserMenu] localStorage session:', storedSession);
        console.log('[UserMenu] localStorage user:', storedUser);

        // Try to get session from Better Auth client
        const authClient = getAuthClient();
        const session = await authClient.getSession();
        console.log('[UserMenu] Better Auth session response:', session);

        // Check if we have user data from either source
        let userData = null;

        if (session?.data?.user) {
          userData = session.data.user;
          console.log('[UserMenu] User from Better Auth:', userData.email);
        } else if (storedUser) {
          // Parse stored user data
          try {
            userData = JSON.parse(storedUser);
            console.log('[UserMenu] User from localStorage:', userData.email);
          } catch (e) {
            console.error('[UserMenu] Failed to parse stored user:', e);
          }
        }

        if (userData) {
          console.log('[UserMenu] User authenticated:', userData.email);
          setUser(userData);
          // Add class to body to hide auth links when authenticated
          document.body.classList.add('user-authenticated');
        } else {
          console.log('[UserMenu] No user found in session or localStorage');
          setUser(null);
          // Remove class when not authenticated
          document.body.classList.remove('user-authenticated');
        }
      } catch (err) {
        console.error('[UserMenu] Error checking auth:', err);
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('[UserMenu] Signing out...');
      const authClient = getAuthClient();
      await authClient.signOut();

      // Clear localStorage to remove session data
      localStorage.removeItem('better-auth.session');
      localStorage.removeItem('better-auth.user');
      console.log('[UserMenu] Cleared localStorage');

      // Remove authenticated class from body
      document.body.classList.remove('user-authenticated');

      // Redirect to homepage after logout
      console.log('[UserMenu] Redirecting to homepage...');
      window.location.href = '/Humanoid-Robotics-Book/';
    } catch (err) {
      console.error('[UserMenu] Logout error:', err);

      // Still clear localStorage even if sign out fails
      localStorage.removeItem('better-auth.session');
      localStorage.removeItem('better-auth.user');
      document.body.classList.remove('user-authenticated');

      // Force reload to clear any cached state
      window.location.href = '/Humanoid-Robotics-Book/';
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Show loading state or empty for unauthenticated users
  if (loading) {
    console.log('[UserMenu] Still loading...');
    return null;
  }

  if (!user) {
    console.log('[UserMenu] No user, not rendering');
    return null;
  }

  console.log('[UserMenu] Rendering for user:', user.email);

  // Get user display name (email or name)
  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-button"
        onClick={toggleMenu}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="user-name">{displayName}</span>
        <svg
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-info">
              <div className="user-name-large">{displayName}</div>
              <div className="user-email">{userEmail}</div>
            </div>
          </div>

          <div className="user-menu-divider" />

          <div className="user-menu-items">
            <button
              className="user-menu-item"
              onClick={handleLogout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
