// ==========================================================================
// FINANCE OS — SIDEBAR NAVIGATION
// Human-designed tactical navigation with Money-Heist aesthetic
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  TrendingUp,
  Activity,
  ShieldCheck,
  Settings as SettingsIcon,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  onOpenOnboarding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenOnboarding }) => {
  const { activeTab, setActiveTab, isDemoMode } = useFinance();

  const navItems = [
    { id: 'dashboard', index: '01', label: 'COMMAND CENTER', icon: LayoutDashboard },
    { id: 'cashflow', index: '02', label: 'CASH FLOW', icon: ArrowLeftRight },
    { id: 'missions', index: '03', label: 'MISSIONS', icon: Target },
    { id: 'assets', index: '04', label: 'ASSETS', icon: TrendingUp },
    { id: 'insights', index: '05', label: 'INSIGHTS', icon: Activity },
    { id: 'advisor', index: '06', label: 'ADVISOR', icon: ShieldCheck },
    { id: 'settings', index: '07', label: 'SETTINGS', icon: SettingsIcon },
    { id: 'walkthrough', index: '08', label: 'WALKTHROUGH', icon: BookOpen },
  ];

  return (
    <aside
      style={{
        width: '240px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        minHeight: '100%',
        alignSelf: 'stretch',
        zIndex: 20,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: 'var(--red-primary)',
          }}
        />
        <div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            FINANCE OS
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
            }}
          >
            COMMAND TERMINAL
          </div>
        </div>
      </div>

      {/* Primary Navigation Items */}
      <nav
        style={{
          padding: '1rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flexGrow: 1,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              data-tab-id={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--red-badge-bg)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--border-red-subtle)' : 'transparent'}`,
                borderLeft: isActive ? '3px solid var(--red-primary)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: isActive ? 'var(--red-bright)' : 'var(--text-muted)',
                  width: '16px',
                }}
              >
                {item.index}
              </span>
              <Icon size={16} style={{ color: isActive ? 'var(--red-bright)' : 'inherit' }} />
              <span style={{ flexGrow: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            STATUS: {isDemoMode ? 'DEMO MODE' : 'ONLINE'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              className="pulsing-dot"
              style={{ background: isDemoMode ? 'var(--status-yellow)' : 'var(--status-green)' }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: '0.68rem',
                color: isDemoMode ? 'var(--status-yellow)' : 'var(--status-green)',
                fontWeight: 700,
              }}
            >
              {isDemoMode ? 'DEMO' : 'ACTIVE'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenOnboarding}
          className="btn-ghost"
          style={{ width: '100%', fontSize: '0.72rem', justifyContent: 'flex-start', padding: '0.35rem 0.45rem' }}
        >
          <SettingsIcon size={13} /> Re-Initialize Baseline
        </button>
      </div>
    </aside>
  );
};
