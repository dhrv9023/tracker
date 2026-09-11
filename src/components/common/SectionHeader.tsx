// ==========================================================================
// FINANCE OS — SECTION INTEL HEADER
// Standardized high-contrast, uncluttered header for each view.
// Delivers clear contextual orientation, quick navigation & Back button.
// ==========================================================================

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SectionHeaderProps {
  sectionIndex: string;
  tag: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  hideBackButton?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionIndex,
  tag,
  title,
  description,
  actions,
  hideBackButton = false,
}) => {
  const { goBack, canGoBack, previousTab } = useFinance();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Back Navigation Bar (visible on all pages if history exists or not on dashboard) */}
      {!hideBackButton && canGoBack && (
        <div>
          <button
            type="button"
            onClick={goBack}
            className="btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.74rem',
              padding: '0.35rem 0.7rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
            title={previousTab ? `Back to ${previousTab.toUpperCase()}` : 'Return to previous screen'}
          >
            <ArrowLeft size={13} style={{ color: 'var(--red-bright)' }} />
            <span style={{ fontWeight: 600 }}>Back</span>
            {previousTab && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                // {previousTab.toUpperCase()}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '750px' }}>
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
              fontSize: '1.65rem',
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
              fontSize: '0.86rem',
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
    </div>
  );
};
