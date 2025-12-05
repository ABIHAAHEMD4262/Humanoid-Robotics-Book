import React, { ReactNode } from 'react';
import styles from './Callout.module.css';

/**
 * Callout Component for AI-Native Book
 *
 * A custom callout/admonition component for highlighting important information.
 * Complements Docusaurus built-in admonitions (:::tip, :::note, etc.) for special cases.
 *
 * @param type - Visual style of the callout (tip, note, warning, danger, info)
 * @param title - Optional title displayed at the top of the callout
 * @param children - Content to display inside the callout
 */

type CalloutType = 'tip' | 'note' | 'warning' | 'danger' | 'info';

interface CalloutProps {
  /** Type of callout determining color and icon */
  type: CalloutType;
  /** Optional title for the callout */
  title?: string;
  /** Content to display */
  children: ReactNode;
}

const calloutConfig = {
  tip: {
    icon: '💡',
    defaultTitle: 'Tip',
    ariaLabel: 'Helpful tip',
  },
  note: {
    icon: '📝',
    defaultTitle: 'Note',
    ariaLabel: 'Additional note',
  },
  warning: {
    icon: '⚠️',
    defaultTitle: 'Warning',
    ariaLabel: 'Important warning',
  },
  danger: {
    icon: '🚨',
    defaultTitle: 'Danger',
    ariaLabel: 'Critical warning',
  },
  info: {
    icon: 'ℹ️',
    defaultTitle: 'Info',
    ariaLabel: 'Information',
  },
};

export default function Callout({
  type,
  title,
  children,
}: CalloutProps): JSX.Element {
  const config = calloutConfig[type];
  const displayTitle = title || config.defaultTitle;

  return (
    <aside
      className={`${styles.callout} ${styles[type]}`}
      role="note"
      aria-label={config.ariaLabel}
    >
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {config.icon}
        </span>
        <strong className={styles.title}>{displayTitle}</strong>
      </div>
      <div className={styles.content}>{children}</div>
    </aside>
  );
}
