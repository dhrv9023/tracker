// ==========================================================================
// FINANCE OS — TOP BAR
// Global tactical header with real-time available capital ticker
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { Edit3, HelpCircle, BookOpen } from 'lucide-react';

interface TopBarProps {
  onEditBaseline: () => void;
  onOpenTutorial: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onEditBaseline, onOpenTutorial }) => {
  const { activeTab, setActiveTab, snapshot } = useFinance();

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'COMMAND CENTER', tag: 'OPERATIONS' };
      case 'cashflow':
        return { title: 'CASH FLOW', tag: 'LEDGER' };
      case 'missions':
        return { title: 'MISSIONS', tag: 'TACTICAL GOALS' };
      case 'assets':
        return { title: 'ASSETS', tag: 'INVESTMENTS' };
      case 'insights':
        return { title: 'INSIGHTS & REVIEW', tag: 'INTELLIGENCE' };
      case 'advisor':
        return { title: 'ADVISOR', tag: 'GUIDANCE' };
      case 'settings':
        return { title: 'SETTINGS', tag: 'CONFIGURATION' };
      case 'walkthrough':
        return { title: 'SYSTEM WALKTHROUGH', tag: 'FIELD MANUAL' };
      default:
        return { title: 'COMMAND CENTER', tag: 'OPERATIONS' };
    }
  };

  const meta = getPageTitle(activeTab);

  return (
    <header
      style={{
        height: '60px',
        background: 'rgba(8, 10, 15, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span className="status-pill status-pill-red" style={{ fontSize: '0.62rem' }}>
          {meta.tag}
        </span>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
          {meta.title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Available Monthly Capital Ticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.8rem',
            background: 'var(--bg-card)',
            border: `1px solid ${snapshot.isDeficit ? 'var(--status-red)' : 'var(--border-card)'}`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span
            className="pulsing-dot"
            style={{ background: snapshot.isDeficit ? 'var(--status-red)' : 'var(--status-green)' }}
          />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {snapshot.isDeficit ? 'DEFICIT:' : 'AVAILABLE SURPLUS:'}
          </span>
          <span
            className="mono-figure"
            style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: snapshot.isDeficit ? 'var(--status-red)' : 'var(--status-green)',
            }}
          >
            {snapshot.isDeficit ? `-${formatINR(Math.abs(snapshot.monthlySurplus))}` : formatINR(snapshot.monthlySurplus)}
          </span>
        </div>

        {/* Full Walkthrough & Manual */}
        <button
          type="button"
          onClick={() => setActiveTab('walkthrough')}
          className={activeTab === 'walkthrough' ? 'btn-primary' : 'btn-ghost'}
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
          title="Open Full-Page System Manual & Visual Walkthrough"
        >
          <BookOpen size={14} style={{ color: activeTab === 'walkthrough' ? '#ffffff' : 'var(--red-bright)' }} />
          <span>Walkthrough</span>
        </button>

        {/* Quick Tour Modal Action */}
        <button
          type="button"
          onClick={onOpenTutorial}
          className="btn-ghost"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
          title="Interactive Guided Tour"
        >
          <HelpCircle size={14} style={{ color: 'var(--red-bright)' }} />
          <span>Quick Tour</span>
        </button>

        {/* Quick Action */}
        <button
          type="button"
          onClick={onEditBaseline}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
        >
          <Edit3 size={13} /> Edit Baseline
        </button>
      </div>
    </header>
  );
};
