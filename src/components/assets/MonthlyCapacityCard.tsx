// ==========================================================================
// FINANCE OS — MONTHLY INVESTMENT CAPACITY CARD (PHASE 5)
// Transparent mathematical derivation of potential monthly investing capacity
// Surplus - Active Goals - Emergency Fund Allocation - Safety Buffer = Capacity
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { Shield, Sliders, Info, Target, Wallet, ArrowRight } from 'lucide-react';

export const MonthlyCapacityCard: React.FC = () => {
  const { investmentCapacity, investmentProfile, saveInvestmentProfile } = useFinance();

  const handleBufferChange = (newPct: number) => {
    saveInvestmentProfile({ safetyBufferPercent: newPct });
  };

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
              CAPITAL DISCIPLINE // STAGE 02
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
            MONTHLY INVESTMENT CAPACITY
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Derived deterministically from operational surplus after accounting for missions, reserves, and safety buffers.
          </p>
        </div>

        {/* Capacity Result Badge */}
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--accent-gold, #d4af37)', letterSpacing: '0.1em', fontWeight: 600 }}>
            SUGGESTED MONTHLY CAPACITY
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--accent-gold, #d4af37)',
              fontFamily: 'var(--font-mono, monospace)',
              marginTop: '2px',
            }}
          >
            {formatINR(investmentCapacity.potentialMonthlyCapacity)}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted, #717d96)' }}>/mo</span>
          </div>
        </div>
      </div>

      {/* Waterfall Derivation Table */}
      <div
        style={{
          background: 'rgba(10, 12, 18, 0.5)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {/* Step 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #717d96)', marginBottom: '4px' }}>
              <Wallet size={12} color="#10b981" />
              AVAILABLE SURPLUS
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
              +{formatINR(investmentCapacity.availableSurplus)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>Net monthly inflow</div>
          </div>

          {/* Step 2 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #717d96)', marginBottom: '4px' }}>
              <Target size={12} color="#3a86ff" />
              ACTIVE MISSIONS
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3a86ff', fontFamily: 'var(--font-mono, monospace)' }}>
              -{formatINR(investmentCapacity.activeMissionsCommitment)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>Committed savings goals</div>
          </div>

          {/* Step 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #717d96)', marginBottom: '4px' }}>
              <Shield size={12} color="#f59e0b" />
              EMERGENCY RESERVE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }}>
              -{formatINR(investmentCapacity.emergencyFundAllocation)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>Runway building</div>
          </div>

          {/* Step 4 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted, #717d96)', marginBottom: '4px' }}>
              <Sliders size={12} color="#a855f7" />
              SAFETY BUFFER ({investmentCapacity.safetyBufferPercent}%)
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono, monospace)' }}>
              -{formatINR(investmentCapacity.safetyBufferAmount)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>Flexible cushion</div>
          </div>

          {/* Result */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-gold, #d4af37)', marginBottom: '4px' }}>
              <ArrowRight size={12} color="var(--accent-gold, #d4af37)" />
              INVESTMENT CAPACITY
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', fontFamily: 'var(--font-mono, monospace)' }}>
              ={formatINR(investmentCapacity.potentialMonthlyCapacity)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>Investable headroom</div>
          </div>
        </div>
      </div>

      {/* Safety Buffer Interactive Control */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="var(--text-muted, #717d96)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
            Never deploy 100% of surplus. Retain a flexible planning buffer for unexpected lifestyle variations.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #717d96)', whiteSpace: 'nowrap' }}>
            Buffer: <strong style={{ color: 'var(--text-main, #f0f4f8)' }}>{investmentProfile.safetyBufferPercent || 20}%</strong>
          </span>
          <input
            type="range"
            min="10"
            max="40"
            step="5"
            value={investmentProfile.safetyBufferPercent || 20}
            onChange={(e) => handleBufferChange(Number(e.target.value))}
            style={{
              accentColor: 'var(--accent-gold, #d4af37)',
              width: '120px',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default MonthlyCapacityCard;
