// ==========================================================================
// FINANCE OS — PHASE 1 ADVISOR PLACEHOLDER
// Deliberate placeholder matching tactical command-center visual system.
// No fake AI behavior or premature API calls.
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Cpu, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export const AdvisorPlaceholder: React.FC = () => {
  const { setActiveTab } = useFinance();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="pulsing-dot" />
          <span className="status-pill status-pill-red">PHASE 3 INTELLIGENCE // DOCKED</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
          AI FINANCIAL ADVISOR
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Gemini AI integration is NOT part of Phase 1. Zero fake AI functionality is active.
        </p>
      </div>

      {/* Tactical Intelligence Status Panel */}
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
            <Cpu size={26} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <span className="status-pill status-pill-neutral" style={{ alignSelf: 'flex-start' }}>
              INTELLIGENCE SUBSYSTEM // DOCKED FOR PHASE 3
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Deterministic Engine Active // AI Advisor Scheduled
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              In Phase 1, all financial calculations (income, expenses, available capital surplus/deficit, savings rate, emergency runway, and financial health scores) are computed deterministically using standard mathematical formulas.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The interactive Gemini AI Advisor will be integrated in Phase 3 to interpret your verified financial records, explain surplus scenarios, conduct stress tests, and provide contextual recommendations without inventing numbers.
            </p>
          </div>
        </div>

        {/* Verification Checkpoints */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div style={{ background: 'var(--bg-card-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)' }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>DETERMINISTIC COMPLIANCE</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Zero hallucinated math. 100% of calculations run via pure TypeScript functions.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Lock size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>LOCAL PRIVACY</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Your financial baseline is persisted exclusively in local browser storage.
            </p>
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
