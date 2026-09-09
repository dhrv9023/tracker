// ==========================================================================
// FINANCE OS — INTERACTIVE SECTION TUTORIAL & ORIENTATION
// Explains each of the 7 sections before jumping in.
// Can be completed once, skipped, or reopened on-demand via the TopBar.
// ==========================================================================

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  TrendingUp,
  Activity,
  ShieldCheck,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const STORAGE_KEY_TUTORIAL_COMPLETED = 'finance_tutorial_completed_v1';

export function isTutorialCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_TUTORIAL_COMPLETED) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialCompleted(completed: boolean): void {
  try {
    if (completed) {
      localStorage.setItem(STORAGE_KEY_TUTORIAL_COMPLETED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_TUTORIAL_COMPLETED);
    }
  } catch {
    // Ignore
  }
}

interface TutorialStep {
  tabId: string;
  index: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  badge: string;
  summary: string;
  highlights: string[];
  keyTip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    tabId: 'dashboard',
    index: '01',
    title: 'Command Center',
    subtitle: 'High-Level Macro Overview',
    icon: LayoutDashboard,
    badge: 'TELEMETRY & PULSE',
    summary:
      'Your executive cockpit. Delivers an immediate pulse on total monthly inflows, liquid cash reserves, fixed/variable outflows, and net capital surplus.',
    highlights: [
      'Interactive 12-month Inflow vs Outflow velocity area chart with hover crosshair',
      'At-a-glance liquid reserves runway indicator based on essential expenses',
      'Embedded AI Financial Advisor for immediate quick queries without leaving the view',
      'Recent verified transactions ledger with quick status pills and logging',
    ],
    keyTip: 'Check the Net Capital Surplus card each month to confirm you are running a positive cash-flow buffer.',
  },
  {
    tabId: 'cashflow',
    index: '02',
    title: 'Cash Flow Ledger',
    subtitle: 'Deterministic Inflow & Outflow Tracker',
    icon: ArrowLeftRight,
    badge: 'SOURCE OF TRUTH',
    summary:
      'The mathematical foundation of the app. Every number in Finance OS is calculated directly from your verified ledger — never estimated or assumed.',
    highlights: [
      'Log recurring salary, freelance revenue, and variable earnings',
      'Categorize fixed obligations (Rent, EMIs, Utilities) vs discretionary spending',
      'Real-time categorical spending donut and progress bar breakdowns',
      'One-click modal to log, edit, or remove financial transactions',
    ],
    keyTip: 'Logging recurring expenses once allows the system to accurately track your fixed commitments every month.',
  },
  {
    tabId: 'missions',
    index: '03',
    title: 'Savings Missions',
    subtitle: 'Tactical Goal Accumulation',
    icon: Target,
    badge: 'GOAL EXECUTION',
    summary:
      'Transform abstract goals into concrete operational missions (Emergency Fund, Travel, Vehicle, Home Downpayment) with automated pacing.',
    highlights: [
      'Set target dates and required amounts with deterministic monthly pacing',
      'Safety checks ensure monthly allocations never exceed your flexible surplus',
      'Milestone tracking with visual completion bars and pacing badges',
      'Deploy Capital button lets you mark missions completed and celebrate milestones',
    ],
    keyTip: 'Always prioritize your Emergency Fund mission first to secure a 3 to 6-month survival runway.',
  },
  {
    tabId: 'assets',
    index: '04',
    title: 'Assets & SIP Engine',
    subtitle: 'Compound Wealth Simulator',
    icon: TrendingUp,
    badge: 'WEALTH ACCUMULATION',
    summary:
      'Long-term investment planning engine. Models deterministic compound interest over 1 to 30 years and suggests balanced asset allocation models.',
    highlights: [
      'Interactive SIP compounding calculator with customizable monthly contributions',
      'Simulate conservative (8%), moderate (12%), and aggressive (15%) growth curves',
      'Illustrative allocation models across Domestic Equity, Debt, and Gold',
      'Calculates exact total wealth vs invested capital over your chosen time horizon',
    ],
    keyTip: 'Increase your monthly SIP by just 5% each year to dramatically accelerate compound growth.',
  },
  {
    tabId: 'insights',
    index: '05',
    title: 'Insights & Review',
    subtitle: 'Automated Financial Audit',
    icon: Activity,
    badge: 'DIAGNOSTIC AUDIT',
    summary:
      'Automated intelligence that audits your financial trajectory month-over-month, highlighting positive trends and flagging spending spikes.',
    highlights: [
      'Month-over-month delta analysis for income, expenses, and savings rate',
      'Spending shift detector flags which categories increased or decreased',
      'Transparent 100-point Financial Health Score across 5 objective pillars',
      'Actionable recommendations to plug spending leaks and optimize capital',
    ],
    keyTip: 'Review Insights at the end of each month to track your Financial Health Score improvement.',
  },
  {
    tabId: 'advisor',
    index: '06',
    title: 'AI Financial Advisor',
    subtitle: 'Tactical Scenario Copilot',
    icon: ShieldCheck,
    badge: 'AI COPILOT',
    summary:
      'A conversational copilot grounded in your verified financial numbers. Ask questions, explore what-if scenarios, and evaluate financial decisions.',
    highlights: [
      'Strictly grounded in your profile: Gemini never invents or hallucinates figures',
      'Test "what-if" scenarios like taking a car loan or changing your monthly savings',
      'Analyzes spending tradeoffs and provides practical, jargon-free advice',
      'Pre-populated suggestion chips for instant analysis in one click',
    ],
    keyTip: 'Ask the Advisor: "What happens to my emergency runway if I increase my SIP by ₹5,000?"',
  },
  {
    tabId: 'settings',
    index: '07',
    title: 'Settings & Controls',
    subtitle: 'Profile & Data Ownership',
    icon: SettingsIcon,
    badge: 'SYSTEM CONFIG',
    summary:
      'Full control over your financial baseline, currency preferences, simulation demo mode, and private local data.',
    highlights: [
      'Edit your verified baseline income, fixed expenses, and liquid savings',
      'Select preferred currency (INR ₹, USD $, EUR €, GBP £)',
      'Toggle Demo Mode to test features with rich simulated data',
      'Export your data to JSON backup or wipe local storage at any time',
    ],
    keyTip: 'Use Demo Mode anytime you want to explore the application without entering personal financial numbers.',
  },
];

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTab?: (tabId: string) => void;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
  onJumpToTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const Icon = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleFinish = () => {
    setTutorialCompleted(true);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpAndClose = () => {
    setTutorialCompleted(true);
    if (onJumpToTab) {
      onJumpToTab(currentStep.tabId);
    }
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="ui-card view-enter"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-tactical)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(229, 9, 20, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.015)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--red-bright)',
                background: 'var(--red-badge-bg)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-red-subtle)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              ORIENTATION // {currentStep.index} OF 07
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Tactical Operations Briefing
            </span>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="btn-ghost"
            style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
            title="Skip Tutorial"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Content Area */}
        <div style={{ padding: '2rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.25) 0%, rgba(20, 10, 14, 0.8) 100%)',
                border: '1px solid var(--border-red-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-bright)',
                flexShrink: 0,
              }}
            >
              <Icon size={26} />
            </div>

            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {currentStep.badge}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentStep.title}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Core Summary */}
          <div
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: 'var(--text-main)',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {currentStep.summary}
          </div>

          {/* Highlights List */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: '0.65rem',
                textTransform: 'uppercase',
              }}
            >
              What this section delivers:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {currentStep.highlights.map((h, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2
                    size={16}
                    style={{ color: 'var(--status-green)', flexShrink: 0, marginTop: '0.15rem' }}
                  />
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Pro-Tip Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              background: 'rgba(229, 9, 20, 0.06)',
              border: '1px solid var(--border-red-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: '#ffffff',
            }}
          >
            <span style={{ color: 'var(--red-bright)', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              TACTICAL TIP //
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              {currentStep.keyTip}
            </span>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.015)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Progress Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {TUTORIAL_STEPS.map((step, idx) => (
              <button
                key={step.tabId}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                style={{
                  width: idx === currentStepIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentStepIndex ? 'var(--red-primary)' : 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  padding: 0,
                }}
                title={`Jump to ${step.title}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleJumpAndClose}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.5rem 0.85rem' }}
            >
              Open {currentStep.title} <ExternalLink size={13} />
            </button>

            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}
            >
              {isLast ? 'Complete Briefing' : 'Next Section'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
