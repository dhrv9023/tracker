// ==========================================================================
// FINANCE OS — SCENARIO & CONTRIBUTION COMPARISON (PHASE 5)
// Multi-scenario matrix comparing Conservative (8%), Balanced (11%), and
// Growth (14%) illustrative returns, plus monthly contribution scaling steps.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  generateProjectionScenarios,
  generateContributionComparisons,
  formatINR,
} from '../../utils/finance';
import { Layers, Sliders, Info, TrendingUp, BarChart2 } from 'lucide-react';

export const ScenarioComparisonTable: React.FC = () => {
  const { investmentCapacity } = useFinance();

  const baseMonthly = investmentCapacity.potentialMonthlyCapacity > 0
    ? investmentCapacity.potentialMonthlyCapacity
    : 15000;

  const [monthlyAmount, setMonthlyAmount] = useState<number>(baseMonthly);
  const [durationYears, setDurationYears] = useState<number>(10);
  const [activeView, setActiveView] = useState<'scenarios' | 'contributions'>('scenarios');

  // Generate 3 scenarios
  const scenarios = generateProjectionScenarios(monthlyAmount, durationYears);

  // Generate contribution comparisons at 11% balanced return
  const contributionSteps = generateContributionComparisons(durationYears, 11);

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
      {/* Header with View Toggle */}
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
              SIMULATION MATRIX // STAGE 05
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
            SCENARIO & CONTRIBUTION COMPARISON
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Compare varying market return assumptions or see the wealth effect of scaling monthly contributions.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveView('scenarios')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeView === 'scenarios' ? 'var(--accent-gold, #d4af37)' : 'transparent',
              color: activeView === 'scenarios' ? '#0a0c12' : 'var(--text-secondary, #94a3b8)',
              fontWeight: activeView === 'scenarios' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sliders size={13} />
            <span>Return Scenarios</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('contributions')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeView === 'contributions' ? 'var(--accent-gold, #d4af37)' : 'transparent',
              color: activeView === 'contributions' ? '#0a0c12' : 'var(--text-secondary, #94a3b8)',
              fontWeight: activeView === 'contributions' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart2 size={13} />
            <span>Contribution Scale</span>
          </button>
        </div>
      </div>

      {/* Shared Duration Quick Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          background: 'rgba(10, 12, 18, 0.4)',
          padding: '10px 16px',
          borderRadius: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-muted, #717d96)' }}>Horizon:</span>
        {[5, 10, 15, 20, 25].map((y) => (
          <button
            key={y}
            onClick={() => setDurationYears(y)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: durationYears === y ? '1px solid var(--accent-gold, #d4af37)' : '1px solid transparent',
              background: durationYears === y ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: durationYears === y ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
              fontSize: '12px',
              fontWeight: durationYears === y ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {y} Years
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #717d96)' }}>Monthly:</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4f8', fontFamily: 'var(--font-mono, monospace)' }}>
            {formatINR(monthlyAmount)}/mo
          </span>
        </div>
      </div>

      {/* VIEW 1: 3 RETURN SCENARIOS */}
      {activeView === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {scenarios.map((sc) => {
            const isGrowth = sc.id === 'growth';
            const isBal = sc.id === 'balanced';
            const themeColor = isGrowth ? '#10b981' : isBal ? 'var(--accent-gold, #d4af37)' : '#3a86ff';

            return (
              <div
                key={sc.id}
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  background: 'rgba(10, 12, 18, 0.6)',
                  border: `1px solid rgba(255, 255, 255, 0.06)`,
                  borderTop: `3px solid ${themeColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4f8' }}>
                    {sc.label.toUpperCase()}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: themeColor,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {sc.annualRatePct}% p.a.
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
                    ILLUSTRATIVE VALUE ({durationYears}Y)
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: themeColor,
                      fontFamily: 'var(--font-mono, monospace)',
                      marginTop: '2px',
                    }}
                  >
                    {formatINR(sc.projectedValue)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)' }}>INVESTED</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)' }}>
                      {formatINR(sc.totalInvested)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)' }}>EST. GROWTH</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                      +{formatINR(sc.projectedGain)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CONTRIBUTION SCALE COMPARISON */}
      {activeView === 'contributions' && (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '540px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600 }}>
                    MONTHLY CONTRIBUTION
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                    TOTAL INVESTED ({durationYears}Y)
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                    ESTIMATED GROWTH (11%)
                  </th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                    ILLUSTRATIVE VALUE
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributionSteps.map((step) => {
                  const isUserAmount = step.monthlyAmount === monthlyAmount;

                  return (
                    <tr
                      key={step.monthlyAmount}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isUserAmount ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 700, color: isUserAmount ? 'var(--accent-gold, #d4af37)' : '#f0f4f8', fontFamily: 'var(--font-mono, monospace)' }}>
                        {formatINR(step.monthlyAmount)}/mo
                        {isUserAmount && (
                          <span style={{ fontSize: '10px', marginLeft: '8px', color: 'var(--accent-gold, #d4af37)', background: 'rgba(212, 175, 55, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                            Your Plan
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#cbd5e1', fontFamily: 'var(--font-mono, monospace)' }}>
                        {formatINR(step.totalInvested)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                        +{formatINR(step.estimatedGrowth)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {formatINR(step.projectedValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.4' }}>
            💡 Notice how increasing monthly contributions has a compound multiplier effect over time. Contribution rate is within your control, while market returns vary.
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--text-muted, #717d96)',
        }}
      >
        <Info size={13} />
        <span>
          Illustrative projections based on constant annual compounding assumptions. Returns are not guaranteed. Actual equity and debt performance varies with market cycles.
        </span>
      </div>
    </div>
  );
};
export default ScenarioComparisonTable;
