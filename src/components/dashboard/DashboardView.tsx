// ==========================================================================
// FINANCE OS — COMMAND CENTER (DASHBOARD)
// Human-Designed Tactical Financial Command Center with Money-Heist Aesthetic
// Deterministic telemetry reading verified records with zero AI hallucination.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, calculateMissionProgress } from '../../utils/finance';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Target,
  Edit3,
  Terminal,
  Activity,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onEditBaseline: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onEditBaseline }) => {
  const {
    profile,
    snapshot,
    healthEvaluation,
    isDemoMode,
    setActiveTab,
    selectedMonth,
    hasTransactionsForSelectedMonth,
    currentMonthTransactions,
    activeMissions,
    completedMissions,
    overallMissionProgress,
    totalMonthlyMissionRequirement,
    remainingFlexibleSurplus,
    openAdvisorWithContext,
    insights,
  } = useFinance();

  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);

  const totalDebt = profile.position.debt.outstandingLoans + profile.position.debt.creditCardDebt;
  const recentTransactions = currentMonthTransactions.slice(0, 5);

  const efMonths = snapshot.emergencyFundMonths ?? 0;

  // Determine top priority action
  const getNextAction = () => {
    if (snapshot.isDeficit) {
      return {
        title: 'ELIMINATE OPERATING CASH FLOW DEFICIT',
        description: `Your monthly expenses (${formatINR(snapshot.totalExpenses)}) exceed your income (${formatINR(snapshot.totalIncome)}) by ${formatINR(Math.abs(snapshot.monthlySurplus))}. Reduce non-essential discretionary spending immediately.`,
        actionLabel: 'REVIEW CASH FLOW',
        targetTab: 'cashflow',
      };
    }
    if (efMonths < 3) {
      return {
        title: 'EXPAND LIQUID EMERGENCY RUNWAY',
        description: `Your current liquid reserves provide ${efMonths.toFixed(1)} months of runway. Prioritize allocating surplus to an emergency fund until you reach 3-6 months.`,
        actionLabel: 'SET UP EMERGENCY MISSION',
        targetTab: 'missions',
      };
    }
    if (profile.position.debt.creditCardDebt > 0) {
      return {
        title: 'LIQUIDATE HIGH-COST REVOLVING DEBT',
        description: `You have ${formatINR(profile.position.debt.creditCardDebt)} in credit card debt. Eliminating this stops destructive compounding interest from draining your monthly cash flow.`,
        actionLabel: 'REVIEW DEBT STRATEGY',
        targetTab: 'advisor',
      };
    }
    if (activeMissions.length === 0) {
      return {
        title: 'DEPLOY SURPLUS TOWARD TACTICAL MISSIONS',
        description: `You have an uncommitted monthly surplus of ${formatINR(snapshot.monthlySurplus)}. Build a targeted savings mission to lock in capital for upcoming objectives.`,
        actionLabel: 'CREATE FIRST MISSION',
        targetTab: 'missions',
      };
    }
    return {
      title: 'OPTIMIZE MONTHLY SURPLUS ALLOCATION',
      description: `Your operations are stable with ${formatINR(remainingFlexibleSurplus)} remaining flexible surplus after active missions. Review long-term SIP capacity and asset distribution.`,
      actionLabel: 'REVIEW ASSETS & SIPS',
      targetTab: 'assets',
    };
  };

  const nextAction = getNextAction();

  // Filter top 2 high-priority insights
  const attentionInsights = insights.slice(0, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 01 // HEADER & TELEMETRY STATUS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--red-bright)', letterSpacing: '0.12em' }}>
              01 // COMMAND CENTER
            </span>
            <span style={{ color: 'var(--border-tactical)' }}>•</span>
            <span className="pulsing-dot" style={{ background: snapshot.isDeficit ? 'var(--status-red)' : 'var(--status-green)' }} />
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {hasTransactionsForSelectedMonth
                ? `VERIFIED TELEMETRY (${currentMonthTransactions.length} RECORDS)`
                : 'BASELINE TELEMETRY'}
            </span>
            {isDemoMode && (
              <span className="status-pill status-pill-yellow" style={{ fontSize: '0.62rem' }}>DEMO</span>
            )}
          </div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {profile.user.name ? `FINANCIAL OPERATIONS // ${profile.user.name.toUpperCase()}` : 'FINANCIAL OPERATIONS // ACTIVE'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Authoritative financial ledger, capital pacing, and mission execution telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => openAdvisorWithContext({ page: 'dashboard' }, 'Provide an operational financial briefing on my current position.')}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.55rem 1rem' }}
          >
            <Terminal size={14} /> GET GUIDANCE
          </button>
          <button
            type="button"
            onClick={onEditBaseline}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.55rem 1rem' }}
          >
            <Edit3 size={14} /> EDIT PROFILE
          </button>
        </div>
      </div>

      {/* DEFICIT RED-ALERT WARNING (IF ACTIVE DEFICIT) */}
      {snapshot.isDeficit && (
        <div
          style={{
            background: 'rgba(239, 71, 111, 0.08)',
            border: '1px solid var(--status-red)',
            borderLeft: '4px solid var(--status-red)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
              OPERATIONAL CASH FLOW DEFICIT // ACTION REQUIRED
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
              Monthly expenses ({formatINR(snapshot.totalExpenses)}) exceed monthly income ({formatINR(snapshot.totalIncome)}) by{' '}
              <strong className="font-mono" style={{ color: 'var(--status-red)' }}>{formatINR(Math.abs(snapshot.monthlySurplus))}</strong>.
              Capital depletion is currently active.
            </p>
          </div>
        </div>
      )}

      {/* HERO DOMINANT METRIC — ARCHITECTURAL COMMAND DISPLAY */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-tactical)',
          borderLeft: `4px solid ${snapshot.isDeficit ? 'var(--status-red)' : 'var(--red-primary)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: snapshot.isDeficit ? 'var(--status-red)' : 'var(--text-muted)',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}
            >
              {snapshot.isDeficit ? 'OPERATIONAL DEFICIT // ACTION REQUIRED' : 'MONTHLY SURPLUS // NET CAPITAL GENERATION'}
            </span>
            <div
              className="mono-figure"
              style={{
                fontSize: '3.2rem',
                fontWeight: 800,
                color: snapshot.isDeficit ? 'var(--status-red)' : '#ffffff',
                lineHeight: 1.1,
                margin: '0.35rem 0 0.5rem',
                letterSpacing: '-0.03em',
              }}
            >
              {snapshot.isDeficit ? `-${formatINR(Math.abs(snapshot.monthlySurplus))}` : formatINR(snapshot.monthlySurplus)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="status-pill status-pill-neutral" style={{ fontSize: '0.65rem' }}>
              PERIOD // {selectedMonth}
            </span>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() =>
                  openAdvisorWithContext(
                    { page: 'dashboard', metricToExplain: 'availableSurplus', metricValue: formatINR(snapshot.monthlySurplus) },
                    `Explain the financial math behind my monthly surplus of ${formatINR(snapshot.monthlySurplus)}.`
                  )
                }
                className="btn-ghost"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
              >
                [ EXPLAIN SURPLUS ]
              </button>
            </div>
          </div>
        </div>

        {/* SUPPORTING POSITION BAR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MONTHLY INFLOW
            </div>
            <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
              {formatINR(snapshot.totalIncome)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <ArrowUpRight size={12} /> Verified Inflow
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MONTHLY OUTFLOW
            </div>
            <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
              {formatINR(snapshot.totalExpenses)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Fixed {formatINR(snapshot.fixedExpenses)} • Var {formatINR(snapshot.variableExpenses)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              SAVINGS RATE
            </div>
            <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: snapshot.savingsRate >= 20 ? 'var(--status-green)' : '#ffffff', marginTop: '0.15rem' }}>
              {snapshot.savingsRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Target: 20–30%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              UNCOMMITTED BUFFER
            </div>
            <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: remainingFlexibleSurplus >= 0 ? 'var(--status-blue)' : 'var(--status-red)', marginTop: '0.15rem' }}>
              {formatINR(remainingFlexibleSurplus)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Post-Mission Flexibility
            </div>
          </div>
        </div>
      </div>

      {/* 02 // CAPITAL POSITION — INTEGRATED ARCHITECTURAL PANEL */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            02 // CAPITAL POSITION
          </span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            LIQUIDITY & OBLIGATIONS
          </span>
        </div>

        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            overflow: 'hidden',
          }}
        >
          {/* Savings */}
          <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CURRENT SAVINGS
              </span>
              <Wallet size={15} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="mono-figure" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {formatINR(profile.position.currentSavings)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Liquid Bank Reserves
            </span>
          </div>

          {/* Emergency Fund */}
          <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                EMERGENCY FUND
              </span>
              <ShieldCheck size={15} style={{ color: efMonths >= 3 ? 'var(--status-green)' : 'var(--status-yellow)' }} />
            </div>
            <div className="mono-figure" style={{ fontSize: '1.45rem', fontWeight: 800, color: efMonths >= 3 ? '#ffffff' : 'var(--status-yellow)' }}>
              {efMonths.toFixed(1)} months
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Essential Outflow Runway
            </span>
          </div>

          {/* Investments */}
          <div style={{ padding: '1.25rem', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                INVESTMENTS
              </span>
              <TrendingUp size={15} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="mono-figure" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {formatINR(profile.position.existingInvestments)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Recorded Portfolio Value
            </span>
          </div>

          {/* Debt */}
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                TOTAL DEBT
              </span>
              <ShieldAlert size={15} style={{ color: totalDebt > 0 ? 'var(--status-red)' : 'var(--status-green)' }} />
            </div>
            <div className="mono-figure" style={{ fontSize: '1.45rem', fontWeight: 800, color: totalDebt > 0 ? 'var(--status-red)' : '#ffffff' }}>
              {formatINR(totalDebt)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Loans {formatINR(profile.position.debt.outstandingLoans)} • CC {formatINR(profile.position.debt.creditCardDebt)}
            </span>
          </div>
        </div>
      </div>

      {/* 03 // ACTIVE MISSIONS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              03 // ACTIVE MISSIONS
            </span>
            <span className="status-pill status-pill-neutral" style={{ fontSize: '0.62rem' }}>
              {activeMissions.length} ACTIVE • {completedMissions.length} COMPLETED
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            Manage Missions →
          </button>
        </div>

        {activeMissions.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px dashed var(--border-tactical)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <Target size={24} style={{ color: 'var(--red-primary)', margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              NO ACTIVE SAVINGS MISSIONS
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 1rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Create a savings goal and build a deterministic monthly contribution plan around it.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('missions')}
              className="btn-primary"
              style={{ fontSize: '0.78rem' }}
            >
              CREATE MISSION
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeMissions.slice(0, 3).map((mission, idx) => {
              const progress = calculateMissionProgress(mission.currentAmount, mission.targetAmount);
              return (
                <div
                  key={mission.id}
                  style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--red-bright)' }}>
                        MISSION 0{idx + 1}
                      </span>
                      <span className="status-pill status-pill-green" style={{ fontSize: '0.62rem' }}>
                        ● {mission.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem' }}>
                      {mission.name.toUpperCase()}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>CAPITAL: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(mission.currentAmount)}</strong></span>
                      <span>TARGET: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(mission.targetAmount)}</strong></span>
                    </div>

                    <div className="progress-bar-track" style={{ marginBottom: '0.75rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>ALLOCATION // {formatINR(mission.monthlyContribution)}/mo</span>
                    <span>{progress.toFixed(0)}% PACED</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 04 // WHAT NEEDS ATTENTION & RECENT ACTIVITY (TWO-COLUMN GRID) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* WHAT NEEDS ATTENTION */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              04 // WHAT NEEDS ATTENTION
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className="btn-ghost"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            >
              All Signals ({insights.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attentionInsights.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={20} style={{ color: 'var(--status-green)', margin: '0 auto 0.35rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>ALL SYSTEMS OPERATIONAL</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Zero active anomalies or budget overruns detected in verified records.
                </p>
              </div>
            ) : (
              attentionInsights.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-card)',
                    borderLeft: `3px solid ${item.severity === 'CRITICAL' ? 'var(--status-red)' : item.severity === 'WARNING' ? 'var(--status-yellow)' : 'var(--status-blue)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.15rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {item.category} // {item.severity}
                    </span>
                    {item.metric && (
                      <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.65rem', lineHeight: 1.4 }}>
                    {item.summary}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('insights')}
                      className="btn-ghost"
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', border: '1px solid var(--border-subtle)' }}
                    >
                      [ REVIEW ]
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdvisorWithContext({ page: 'insights' }, `Explain this insight: "${item.title}". Summary: ${item.summary}. What tactical adjustments should I consider?`)}
                      className="btn-ghost"
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', color: 'var(--red-bright)' }}
                    >
                      [ EXPLAIN ]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY LEDGER */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              05 // RECENT ACTIVITY
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('cashflow')}
              className="btn-ghost"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            >
              Full Ledger →
            </button>
          </div>

          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            {recentTransactions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                No transactions recorded for {selectedMonth}.
              </div>
            ) : (
              <div>
                {recentTransactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: idx < recentTransactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                      </div>
                    </div>
                    <div
                      className="mono-figure"
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: tx.type === 'income' ? 'var(--status-green)' : '#ffffff',
                      }}
                    >
                      {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 06 // NEXT ACTION BANNER */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(229, 9, 20, 0.08) 0%, var(--bg-panel) 100%)',
          border: '1px solid var(--border-red-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--red-bright)', letterSpacing: '0.1em' }}>
            06 // NEXT ACTION
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
            {nextAction.title}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '650px' }}>
            {nextAction.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(nextAction.targetTab as any)}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}
        >
          {nextAction.actionLabel} <ArrowRight size={14} />
        </button>
      </div>

      {/* 07 // TRANSPARENT FINANCIAL HEALTH RATING (COLLAPSIBLE INSPECTION) */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setShowHealthBreakdown(!showHealthBreakdown)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.5rem 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>
              07 // FINANCIAL HEALTH SCORE AUDIT
            </span>
            <span className="mono-figure" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
              {healthEvaluation.totalScore} / 100
            </span>
            <span className="status-pill status-pill-neutral" style={{ fontSize: '0.62rem' }}>
              {healthEvaluation.tier} TIER
            </span>
          </div>
          {showHealthBreakdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {showHealthBreakdown && (
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginTop: '0.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {healthEvaluation.factors.map((f) => (
              <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{f.name}</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#ffffff' }}>
                    {f.score} / {f.maxScore}
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${(f.score / f.maxScore) * 100}%` }} />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  {f.details}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
