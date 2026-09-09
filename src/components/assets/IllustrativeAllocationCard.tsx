// ==========================================================================
// FINANCE OS — ILLUSTRATIVE ASSET ALLOCATION CARD (PHASE 5)
// Deterministic asset allocation model displaying category buckets,
// monthly capital splits, and clear deterministic explanations for "WHY".
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { PieChart, Info, HelpCircle } from 'lucide-react';

export const IllustrativeAllocationCard: React.FC = () => {
  const { assetAllocationPlan, investmentProfile, investmentCapacity } = useFinance();

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
              PORTFOLIO ARCHITECTURE // STAGE 03
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
            ILLUSTRATIVE ASSET ALLOCATION
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Calibrated to your {investmentProfile.riskProfile.toUpperCase()} risk profile and {investmentProfile.horizon.replace('_', ' ').toUpperCase()} horizon.
          </p>
        </div>

        {/* Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '12px',
            color: 'var(--accent-gold, #d4af37)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <PieChart size={14} />
          {investmentProfile.riskProfile} Model
        </div>
      </div>

      {/* Segmented Proportional Progress Bar */}
      <div
        style={{
          display: 'flex',
          height: '14px',
          borderRadius: '7px',
          overflow: 'hidden',
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {assetAllocationPlan.items.map((item) => (
          <div
            key={item.categoryKey}
            title={`${item.label}: ${item.percentage}%`}
            style={{
              width: `${item.percentage}%`,
              background: item.color,
              transition: 'width 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* 4 Core Category Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {assetAllocationPlan.items.map((item) => (
          <div
            key={item.categoryKey}
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(10, 12, 18, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderTop: `3px solid ${item.color}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: item.color,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {item.percentage}%
                </span>
              </div>

              {/* Monthly Amount */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>MONTHLY ALLOCATION</div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--text-main, #f0f4f8)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {formatINR(item.monthlyAmount)}
                  <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted, #717d96)' }}>/mo</span>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4', marginBottom: '8px' }}>
                {item.description}
              </div>
            </div>

            {/* Subcategories tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {item.subCategories.map((sub) => (
                <span
                  key={sub}
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted, #717d96)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deterministic "WHY" Explanation Box */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(212, 175, 55, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <HelpCircle size={18} color="var(--accent-gold, #d4af37)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold, #d4af37)', marginBottom: '4px' }}>
            ALLOCATION RATIONALE // WHY THIS STRUCTURE?
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.5' }}>
            {assetAllocationPlan.explanation}
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--text-muted, #717d96)',
        }}
      >
        <Info size={13} />
        <span>
          Illustrative planning allocation. Does not represent individual stock or security recommendations.
        </span>
      </div>
    </div>
  );
};
export default IllustrativeAllocationCard;
