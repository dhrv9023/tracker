// ==========================================================================
// FINANCE OS — SECTION INTEL HEADER
// Standardized high-contrast, uncluttered header for each view.
// Delivers clear contextual orientation so the user knows what the section does.
// ==========================================================================

import React from 'react';

interface SectionHeaderProps {
  sectionIndex: string;
  tag: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionIndex,
  tag,
  title,
  description,
  actions,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--red-bright)',
              background: 'var(--red-badge-bg)',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-red-subtle)',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            {sectionIndex} // {tag}
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem',
            lineHeight: 1.25,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
