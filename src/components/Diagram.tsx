import React, { useState } from 'react';
import styles from './Diagram.module.css';

/**
 * Diagram Component for AI-Native Book
 *
 * A reusable component for displaying diagrams with lazy loading,
 * accessibility features, and responsive design.
 *
 * @param src - Path to the diagram image (e.g., "/img/diagrams/my-diagram.webp")
 * @param alt - Detailed description of the diagram content (required for accessibility)
 * @param caption - Brief caption displayed below the diagram
 * @param maxWidth - Maximum width of the diagram (default: "800px")
 */

interface DiagramProps {
  /** Path to the diagram image */
  src: string;
  /** Detailed alt text describing the diagram content */
  alt: string;
  /** Optional caption displayed below the diagram */
  caption?: string;
  /** Maximum width of the diagram container (default: "800px") */
  maxWidth?: string;
}

export default function Diagram({
  src,
  alt,
  caption,
  maxWidth = '800px',
}: DiagramProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.error(`Failed to load diagram: ${src}`);
  };

  return (
    <figure
      className={styles.diagramContainer}
      style={{ maxWidth }}
      role="figure"
      aria-label={caption || alt}
    >
      <div className={styles.imageWrapper}>
        {!isLoaded && !hasError && (
          <div className={styles.skeleton} aria-label="Loading diagram">
            <div className={styles.skeletonShimmer} />
          </div>
        )}

        {hasError ? (
          <div className={styles.errorState} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorMessage}>
              Failed to load diagram: {src}
            </p>
            <p className={styles.errorAlt}>{alt}</p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            className={`${styles.diagramImage} ${isLoaded ? styles.loaded : ''}`}
            decoding="async"
          />
        )}
      </div>

      {caption && !hasError && (
        <figcaption className={styles.caption}>{caption}</figcaption>
      )}
    </figure>
  );
}
