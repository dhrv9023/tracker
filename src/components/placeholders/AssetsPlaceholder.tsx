// ==========================================================================
// FINANCE OS — PHASE 1 ASSETS PLACEHOLDER
// Deliberate placeholder matching tactical command-center visual system.
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { TrendingUp, ArrowRight, Shield, PieChart } from 'lucide-react';

export const AssetsPlaceholder: React.FC = () => {
  const { profile, setActiveTab } = useFinance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="pulsing-dot" />
          <span className="status-pill status-pill-red">PHASE 2 PROTOCOL // DOCKED</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
          ASSETS & ALLOCATION
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Asset tracking, SIP calculators, and allocation engines will be initialized in an upcoming phase.
        </p>
      </div>

      {/* Tactical Status Panel */}
      <div className="ui-card ui-card-highlight" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-bright)',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={26} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <span className="status-pill status-pill-neutral" style={{ alignSelf: 'flex-start' }}>
              SYSTEM STATUS: STANDBY
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Portfolio & Asset Engine Under Construction
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              The assets module will deliver comprehensive net worth telemetry, equity vs debt asset allocation ratios, SIP compounding simulations, and rebalancing guidance tailored to your risk posture.
            </p>
          </div>
        </div>

        {/* Readout of user's current baseline assets */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <span className="ui-label">RECORDED INVESTMENTS</span>
            <div className="mono-figure" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {formatINR(profile.position.existingInvestments)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Self-declared portfolio baseline
            </span>
          </div>

          <div>
            <span className="ui-label">CURRENT SAVINGS</span>
            <div className="mono-figure" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {formatINR(profile.position.currentSavings)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Bank liquid reserves
            </span>
          </div>

          <div>
            <span className="ui-label">RISK PREFERENCE</span>
            <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--red-bright)', marginTop: '0.25rem', textTransform: 'uppercase' }}>
              {profile.riskPreference}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline risk tolerance doctrine
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Return Button */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          Return to Command Center <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
