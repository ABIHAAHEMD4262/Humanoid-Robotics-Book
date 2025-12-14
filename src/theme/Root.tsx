import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import UserMenu from '../components/auth/UserMenu';

export default function Root({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Wait for navbar to be rendered
    const injectUserMenu = () => {
      const navbar = document.querySelector('.navbar__items--right');

      if (navbar && !document.getElementById('user-menu-root')) {
        // Create a container for the UserMenu
        const userMenuContainer = document.createElement('div');
        userMenuContainer.id = 'user-menu-root';
        userMenuContainer.style.display = 'flex';
        userMenuContainer.style.alignItems = 'center';
        userMenuContainer.style.marginLeft = '1rem';

        // Insert before the GitHub link (last item)
        const githubLink = navbar.querySelector('a[href*="github"]')?.parentElement;
        if (githubLink) {
          navbar.insertBefore(userMenuContainer, githubLink);
        } else {
          navbar.appendChild(userMenuContainer);
        }

        // Render UserMenu into the container
        const root = createRoot(userMenuContainer);
        root.render(<UserMenu />);
      }
    };

    // Try to inject immediately
    injectUserMenu();

    // Also try after a short delay to ensure navbar is ready
    const timeoutId = setTimeout(injectUserMenu, 100);

    // Observe DOM changes to inject on route changes
    const observer = new MutationObserver(injectUserMenu);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
