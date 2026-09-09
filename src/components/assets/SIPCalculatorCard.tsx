// ==========================================================================
// FINANCE OS — SIP CALCULATOR CARD (PHASE 5)
// Deterministic future value compounding calculator using the standard
// monthly annuity formula. Handles 0% return, extreme periods, and contributions.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { calculateSIPFutureValue, formatINR } from '../../utils/finance';
import { Calculator, AlertCircle, TrendingUp } from 'lucide-react';

export const SIPCalculatorCard: React.FC = () => {
  const { investmentCapacity } = useFinance();

  const defaultMonthly = investmentCapacity.potentialMonthlyCapacity > 0
    ? investmentCapacity.potentialMonthlyCapacity
    : 10000;

  const [monthlyAmount, setMonthlyAmount] = useState<number>(defaultMonthly);
  const [returnRate, setReturnRate] = useState<number>(11);
  const [years, setYears] = useState<number>(10);

  // Sync default if capacity changes and amount was untouched
  useEffect(() => {
    if (investmentCapacity.potentialMonthlyCapacity > 0 && monthlyAmount === 10000) {
      setMonthlyAmount(investmentCapacity.potentialMonthlyCapacity);
    }
  }, [investmentCapacity.potentialMonthlyCapacity]);

  // Deterministic calculation
  const result = calculateSIPFutureValue(monthlyAmount, returnRate, years);

  const investedPct = result.illustrativeFinalValue > 0
    ? Math.round((result.totalInvested / result.illustrativeFinalValue) * 100)
    : 100;
  const growthPct = Math.max(0, 100 - investedPct);

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
              COMPOUNDING ENGINE // STAGE 04
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
            SIP COMPOUNDING CALCULATOR
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Simulate the long-term compounding impact of systematic monthly investments.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(212, 175, 55, 0.1)',
            color: 'var(--accent-gold, #d4af37)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <Calculator size={15} />
          <span>DETERMINISTIC FORMULA</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Sliders & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Monthly Investment Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                MONTHLY INVESTMENT (P)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '15px', fontWeight: 700, color: 'var(--accent-gold, #d4af37)' }}>
                  {formatINR(monthlyAmount)}
                </span>
                {investmentCapacity.potentialMonthlyCapacity > 0 && monthlyAmount !== investmentCapacity.potentialMonthlyCapacity && (
                  <button
                    type="button"
                    onClick={() => setMonthlyAmount(investmentCapacity.potentialMonthlyCapacity)}
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: 'none',
                      color: 'var(--accent-gold, #d4af37)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Match Capacity
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-gold, #d4af37)',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '4px' }}>
              <span>₹1,000</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Annual Return Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                ILLUSTRATIVE ANNUAL RETURN ASSUMPTION (r)
              </span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '15px', fontWeight: 700, color: '#3a86ff' }}>
                {returnRate}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#3a86ff',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '4px' }}>
              <span>0% (Cash)</span>
              <span>8% (Conservative)</span>
              <span>12% (Equity)</span>
              <span>20%+</span>
            </div>
          </div>

          {/* Duration in Years Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                TIME DURATION (n)
              </span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '15px', fontWeight: 700, color: '#10b981' }}>
                {years} {years === 1 ? 'Year' : 'Years'} ({years * 12} Months)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#10b981',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '4px' }}>
              <span>1 Year</span>
              <span>10 Years</span>
              <span>20 Years</span>
              <span>35 Years</span>
            </div>
          </div>
        </div>

        {/* Right Column: Compounding Readout & Ratio */}
        <div
          style={{
            background: 'rgba(10, 12, 18, 0.6)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Final Projected Value */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold, #d4af37)', letterSpacing: '0.1em', fontWeight: 600 }}>
              ILLUSTRATIVE PROJECTED VALUE
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--accent-gold, #d4af37)',
                fontFamily: 'var(--font-mono, monospace)',
                marginTop: '4px',
              }}
            >
              {formatINR(result.illustrativeFinalValue)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>
              Wealth Multiplier: <strong style={{ color: '#10b981' }}>{result.wealthMultiplier}x</strong> of total principal
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Invested: {investedPct}%</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Growth: {growthPct}%</span>
            </div>
            <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${investedPct}%`, background: '#3a86ff' }} title={`Invested: ${formatINR(result.totalInvested)}`} />
              <div style={{ width: `${growthPct}%`, background: '#10b981' }} title={`Growth: ${formatINR(result.estimatedGrowth)}`} />
            </div>
          </div>

          {/* Breakdown Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>TOTAL INVESTED (P × n)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#3a86ff', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                {formatINR(result.totalInvested)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>ESTIMATED GROWTH</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                +{formatINR(result.estimatedGrowth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Mandatory Safety & Non-Guaranteed Disclaimer */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#f59e0b', lineHeight: '1.4' }}>
          <strong>ILLUSTRATIVE PROJECTION. RETURNS ARE NOT GUARANTEED.</strong> Calculations use the standard monthly annuity formula based on hypothetical annualized return assumptions. Actual market performance fluctuates and will differ significantly.
        </span>
      </div>
    </div>
  );
};
export default SIPCalculatorCard;
