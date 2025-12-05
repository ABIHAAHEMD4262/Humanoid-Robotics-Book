import React from 'react';

interface CitationProps {
  authors: string;
  year: number | string;
  title: string;
  source?: string;
  url?: string;
  doi?: string;
  accessed?: string;
}

/**
 * APA-style citation component for inline and reference list citations.
 *
 * Usage:
 * <Citation
 *   authors="Smith, J., & Johnson, K."
 *   year={2024}
 *   title="Physical AI: The Future of Robotics"
 *   source="Journal of Robotics Research, 45(3), 123-145"
 *   url="https://example.com/article"
 *   doi="10.1234/jrr.2024.123"
 * />
 */
export default function Citation({
  authors,
  year,
  title,
  source,
  url,
  doi,
  accessed
}: CitationProps): JSX.Element {
  const renderCitation = () => {
    let citation = `${authors} (${year}). ${title}.`;

    if (source) {
      citation += ` ${source}.`;
    }

    if (doi) {
      citation += ` https://doi.org/${doi}`;
    } else if (url) {
      citation += ` Retrieved from ${url}`;
      if (accessed) {
        citation += ` (accessed ${accessed})`;
      }
    }

    return citation;
  };

  return (
    <div style={{
      fontSize: '0.9em',
      paddingLeft: '2em',
      textIndent: '-2em',
      marginBottom: '0.5em'
    }}>
      {url && !doi ? (
        <>
          {authors} ({year}). <em>{title}</em>.{source && ` ${source}.`} Retrieved from{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          {accessed && ` (accessed ${accessed})`}
        </>
      ) : doi ? (
        <>
          {authors} ({year}). <em>{title}</em>.{source && ` ${source}.`}{' '}
          <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">
            https://doi.org/{doi}
          </a>
        </>
      ) : (
        renderCitation()
      )}
    </div>
  );
}
