import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import SidebarBottom from '../../components/SidebarBottom';

type Props = WrapperProps<typeof DocSidebarType>;

/**
 * Custom DocSidebar wrapper that adds controls at the bottom
 * Preserves React context by rendering in the same tree
 */
export default function DocSidebarWrapper(props: Props): JSX.Element {
  return (
    <>
      <DocSidebar {...props} />
      <SidebarBottom />
    </>
  );
}
