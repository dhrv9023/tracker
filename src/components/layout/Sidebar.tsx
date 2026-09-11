// ==========================================================================
// FINANCE OS — TACTICAL ANIMATED DRAWER SIDEBAR
// Human-designed Money-Heist drawer navigation that animates into view
// and gives the main content 100% full screen width when closed.
// ==========================================================================

import React, { useEffect } from 'react';
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
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenOnboarding }) => {
  const { activeTab, setActiveTab, isDemoMode } = useFinance();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <>
      {/* Dimmed Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 100,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden={!isOpen}
      />

      {/* Slide-out Tactical Navigation Drawer */}
      <aside
        style={{
          width: '275px',
          background: '#090b10',
          borderRight: '1px solid rgba(229, 9, 20, 0.4)',
          boxShadow: isOpen
            ? '0 0 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(229, 9, 20, 0.25)'
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 101,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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

          {/* Close Drawer Button */}
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{
              padding: '5px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.03)',
            }}
            title="Close Navigation (ESC)"
          >
            <X size={15} />
          </button>
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
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
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
            onClick={() => {
              onOpenOnboarding();
              onClose();
            }}
            className="btn-ghost"
            style={{ width: '100%', fontSize: '0.72rem', justifyContent: 'flex-start', padding: '0.35rem 0.45rem' }}
          >
            <SettingsIcon size={13} /> Re-Initialize Baseline
          </button>
        </div>
      </aside>
    </>
  );
};
