// ==========================================================================
// FINANCE OS — PHASE 1 MISSIONS PLACEHOLDER
// Deliberate placeholder matching tactical command-center visual system.
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { Target, ArrowRight, Shield, Clock } from 'lucide-react';

export const MissionsPlaceholder: React.FC = () => {
  const { snapshot, setActiveTab } = useFinance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="pulsing-dot" />
          <span className="status-pill status-pill-red">PHASE 2 PROTOCOL // DOCKED</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
          SAVINGS MISSIONS
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Savings missions will be initialized in the next phase.
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
            <Target size={26} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <span className="status-pill status-pill-neutral" style={{ alignSelf: 'flex-start' }}>
              SYSTEM STATUS: STANDBY
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Mission Control Under Assembly
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              The savings missions module will empower you to establish multi-horizon targets (emergency reserve expansion, gadget acquisitions, real estate down payments, vehicle purchases) with automated monthly allocation schedules and timeline forecasting.
            </p>
          </div>
        </div>

        {/* Readout of current capital readiness */}
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
            <span className="ui-label">MONTHLY SURPLUS READINESS</span>
            <div
              className="mono-figure"
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: snapshot.isDeficit ? 'var(--status-red)' : 'var(--status-green)',
                marginTop: '0.25rem',
              }}
            >
              {snapshot.isDeficit ? `-${formatINR(Math.abs(snapshot.monthlySurplus))}` : formatINR(snapshot.monthlySurplus)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {snapshot.isDeficit ? 'Deficit: Eliminate negative burn first' : 'Available for future mission allocations'}
            </span>
          </div>

          <div>
            <span className="ui-label">ESTIMATED LAUNCH</span>
            <div className="mono-figure" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              PHASE 2
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Subsequent deployment milestone
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
        <button
          type="button"
          onClick={() => setActiveTab('cashflow')}
          className="btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          Inspect Cash Flow
        </button>
      </div>
    </div>
  );
};
