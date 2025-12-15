import React, { useEffect } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import { createRoot } from 'react-dom/client';
import SidebarBottom from '../../components/SidebarBottom';

type Props = WrapperProps<typeof DocSidebarType>;

/**
 * Custom DocSidebar wrapper that adds controls at the bottom
 * Uses a portal approach to avoid breaking sidebar layout
 */
export default function DocSidebarWrapper(props: Props): JSX.Element {
  useEffect(() => {
    // Wait for sidebar to be rendered, then inject bottom controls
    const injectBottomControls = () => {
      const sidebar = document.querySelector('.theme-doc-sidebar-container');
      if (sidebar && !document.getElementById('sidebar-bottom-portal')) {
        // Create portal container
        const portalDiv = document.createElement('div');
        portalDiv.id = 'sidebar-bottom-portal';
        portalDiv.className = 'sidebar-bottom-portal';
        sidebar.appendChild(portalDiv);

        // Render SidebarBottom into portal
        const root = createRoot(portalDiv);
        root.render(<SidebarBottom />);
      }
    };

    // Inject immediately and after a short delay to ensure DOM is ready
    injectBottomControls();
    const timer = setTimeout(injectBottomControls, 100);

    return () => clearTimeout(timer);
  }, []);

  return <DocSidebar {...props} />;
}
