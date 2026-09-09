// ==========================================================================
// FINANCE OS — CURRENT VS TARGET ALLOCATION COMPARISON (PHASE 5)
// Informational comparison contrasting actual tracked holdings against the
// model allocation plan.
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { ArrowLeftRight, Info, AlertTriangle } from 'lucide-react';

export const CurrentVsTargetComparison: React.FC = () => {
  const { allocationComparison, portfolioSummary } = useFinance();

  const hasHoldings = portfolioSummary.holdingsCount > 0;

  if (!hasHoldings) {
    return null; // Only show comparison when user has tracked holdings
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface, #141824)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--text-muted, #717d96)',
                letterSpacing: '0.1em',
              }}
            >
              PORTFOLIO AUDIT // DELTA
            </span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main, #f0f4f8)',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            CURRENT VS ILLUSTRATIVE TARGET ALLOCATION
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Compare where your current wealth is deployed versus your suggested risk model.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted, #717d96)',
            fontSize: '11px',
          }}
        >
          <ArrowLeftRight size={14} />
          <span>Informational Comparison Only</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allocationComparison.map((row) => {
          const isOver = row.variancePct > 5;
          const isUnder = row.variancePct < -5;

          return (
            <div
              key={row.category}
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(10, 12, 18, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                    {row.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted, #717d96)',
                      marginLeft: '8px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    Actual: {formatINR(row.currentAmount)}
                  </span>
                </div>

                {/* Delta Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #717d96)' }}>
                    Actual: <strong>{row.currentPct}%</strong> | Model: <strong>{row.targetPct}%</strong>
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: isOver
                        ? 'rgba(58, 134, 255, 0.15)'
                        : isUnder
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                      color: isOver
                        ? '#3a86ff'
                        : isUnder
                        ? '#f59e0b'
                        : '#10b981',
                    }}
                  >
                    {row.variancePct > 0 ? `+${row.variancePct}% Over` : row.variancePct < 0 ? `${row.variancePct}% Under` : 'Aligned ✓'}
                  </span>
                </div>
              </div>

              {/* Comparative Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Current Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '48px', fontSize: '10px', color: 'var(--text-muted, #717d96)' }}>Current</span>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, row.currentPct)}%`,
                        background: '#3a86ff',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Target Model Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '48px', fontSize: '10px', color: 'var(--accent-gold, #d4af37)' }}>Target</span>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, row.targetPct)}%`,
                        background: 'var(--accent-gold, #d4af37)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted, #717d96)',
        }}
      >
        <Info size={14} />
        <span>
          Differences between current and model allocations are informational. This tool does not issue automated trade execution or rebalancing orders.
        </span>
      </div>
    </div>
  );
};
export default CurrentVsTargetComparison;
