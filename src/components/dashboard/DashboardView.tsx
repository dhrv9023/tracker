// ==========================================================================
// FINANCE OS — COMMAND CENTER (DASHBOARD)
// Recreated to faithfully match the reference design (Media 2 & 3):
// - Radiant crimson hero metric card + 3 dark stat cards
// - 2/3 width interactive Cash Flow & Velocity Area Chart with crosshair tooltip
// - 1/3 width live AI Advisor widget with suggestion chips & input bar
// - Full-width Transaction History ledger with status pills
// - Active Missions overview
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, calculateMissionProgress } from '../../utils/finance';
import { TransactionModal } from '../cashflow/TransactionModal';
import { SectionHeader } from '../common/SectionHeader';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  Send,
  ShieldCheck,
  Target,
  Edit3,
  Terminal,
  Clock,
  Repeat,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
  Mic,
} from 'lucide-react';

interface DashboardViewProps {
  onEditBaseline: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onEditBaseline }) => {
  const {
    profile,
    snapshot,
    setActiveTab,
    selectedMonth,
    currentMonthTransactions,
    activeMissions,
    remainingFlexibleSurplus,
    openAdvisorWithContext,
    advisorMessages,
    deleteTransaction,
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [advisorInput, setAdvisorInput] = useState('');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(7); // Default to current (Aug/Sep)

  const userName = profile.user.name || 'Operative';
  const efMonths = snapshot.emergencyFundMonths ?? 0;

  // Generate 12-month trend data for the area chart (Media 2 & 3)
  const chartMonths = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseIncome = snapshot.totalIncome || 80000;
    const baseExpense = snapshot.totalExpenses || 54200;

    // Deterministic progression around verified base numbers
    const variations = [
      { inc: 0.88, exp: 0.95 },
      { inc: 0.92, exp: 0.90 },
      { inc: 0.95, exp: 0.92 },
      { inc: 0.98, exp: 0.96 },
      { inc: 1.00, exp: 0.94 },
      { inc: 1.05, exp: 1.02 },
      { inc: 0.98, exp: 0.91 },
      { inc: 1.00, exp: 1.00 }, // Current
      { inc: 1.02, exp: 0.95 },
      { inc: 1.06, exp: 0.98 },
      { inc: 1.10, exp: 1.04 },
      { inc: 1.15, exp: 1.08 },
    ];

    return months.map((name, i) => {
      const income = Math.round(baseIncome * variations[i].inc);
      const expense = Math.round(baseExpense * variations[i].exp);
      const surplus = income - expense;
      return { name, income, expense, surplus };
    });
  }, [snapshot.totalIncome, snapshot.totalExpenses]);

  // Handle Quick Advisor Send
  const handleSendAdvisorPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = advisorInput.trim();
    if (!prompt) return;
    openAdvisorWithContext({ page: 'dashboard' }, prompt);
    setActiveTab('advisor');
    setAdvisorInput('');
  };

  const handleChipClick = (prompt: string) => {
    openAdvisorWithContext({ page: 'dashboard' }, prompt);
    setActiveTab('advisor');
  };

  // SVG Chart Geometry calculations
  const maxVal = Math.max(...chartMonths.map((m) => Math.max(m.income, m.expense))) * 1.15 || 100000;
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const pointsInflow = chartMonths.map((m, i) => {
    const x = paddingX + (i / (chartMonths.length - 1)) * graphWidth;
    const y = svgHeight - paddingY - (m.income / maxVal) * graphHeight;
    return { x, y, ...m };
  });

  const pointsOutflow = chartMonths.map((m, i) => {
    const x = paddingX + (i / (chartMonths.length - 1)) * graphWidth;
    const y = svgHeight - paddingY - (m.expense / maxVal) * graphHeight;
    return { x, y, ...m };
  });

  // Build SVG bezier path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const pathInflow = buildSmoothPath(pointsInflow);
  const areaInflow = `${pathInflow} L ${pointsInflow[pointsInflow.length - 1].x},${svgHeight - paddingY} L ${pointsInflow[0].x},${svgHeight - paddingY} Z`;

  const pathOutflow = buildSmoothPath(pointsOutflow);
  const areaOutflow = `${pathOutflow} L ${pointsOutflow[pointsOutflow.length - 1].x},${svgHeight - paddingY} L ${pointsOutflow[0].x},${svgHeight - paddingY} Z`;

  const activeHoverData = hoveredMonthIndex !== null ? chartMonths[hoveredMonthIndex] : chartMonths[7];
  const activeHoverPoint = hoveredMonthIndex !== null ? pointsInflow[hoveredMonthIndex] : pointsInflow[7];

  // Latest advisor message preview
  const lastAdvisorMsg = advisorMessages.filter((m) => m.role === 'advisor').slice(-1)[0]?.content ||
    `Your current monthly surplus is running at ${formatINR(snapshot.monthlySurplus)} with ${efMonths.toFixed(1)} months of liquid runway. Uncommitted flexible buffer stands at ${formatINR(remainingFlexibleSurplus)}. Recommended allocation: 60% towards active missions and 40% towards long-term investment.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* 1. TOP SECTION INTEL HEADER (CLEAN, UNCLUTTERED, INFORMATIVE) */}
      <SectionHeader
        sectionIndex="01"
        tag="COMMAND CENTER"
        title={`Welcome back, ${userName} 👋`}
        description="High-level financial cockpit monitoring your monthly inflow vs outflow velocity, liquid reserves runway, and conversational tactical copilot."
        actions={
          <>
            <span
              className="status-pill status-pill-neutral"
              style={{ fontSize: '0.72rem', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-pill)' }}
            >
              {selectedMonth}
            </span>
            <button
              type="button"
              onClick={onEditBaseline}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}
            >
              <Edit3 size={14} /> Edit Baseline
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="btn-primary"
              style={{
                fontSize: '0.825rem',
                padding: '0.6rem 1.35rem',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #e50914 0%, #b8050e 100%)',
                boxShadow: '0 4px 20px rgba(229, 9, 20, 0.45)',
              }}
            >
              <Plus size={15} /> Add Transaction
            </button>
          </>
        }
      />

      {/* 2. TOP 4 KEY METRIC CARDS (SPACIOUS, HIGH-CONTRAST, EXACTLY LIKE PICTURE 2) */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {/* CARD 1: HERO INFLOW CARD (RADIANT CRIMSON GRADIENT WITH BREATHING GLOW) */}
        <div
          className="hero-card-glow stagger-1"
          style={{
            background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.45) 0%, rgba(20, 10, 14, 0.95) 75%)',
            border: '1px solid rgba(229, 9, 20, 0.5)',
            borderRadius: 'var(--radius-card)',
            padding: '1.35rem 1.5rem',
            boxShadow: '0 8px 24px rgba(229, 9, 20, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ₹
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>•••</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
              Total Monthly Inflow
            </div>
            <div
              className="mono-figure"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.2rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {formatINR(snapshot.totalIncome)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              +12.6% vs avg
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.65)' }}>Verified</span>
          </div>
        </div>

        {/* CARD 2: TOTAL SAVINGS & RESERVES */}
        <div
          className="ui-card stagger-2"
          style={{
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <Wallet size={16} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>•••</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Liquid Reserves
            </div>
            <div
              className="mono-figure"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.2rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {formatINR(profile.position.currentSavings)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(6, 214, 160, 0.12)',
                color: 'var(--status-green)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(6, 214, 160, 0.25)',
              }}
            >
              {efMonths.toFixed(1)} mo Runway
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Liquid Capital</span>
          </div>
        </div>

        {/* CARD 3: MONTHLY OUTFLOW */}
        <div
          className="ui-card stagger-3"
          style={{
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <CreditCard size={16} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>•••</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Monthly Outflow
            </div>
            <div
              className="mono-figure"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.2rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {formatINR(snapshot.totalExpenses)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(239, 71, 111, 0.12)',
                color: 'var(--status-red)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(239, 71, 111, 0.25)',
              }}
            >
              Fixed {formatINR(snapshot.fixedExpenses)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Var {formatINR(snapshot.variableExpenses)}
            </span>
          </div>
        </div>

        {/* CARD 4: NET SURPLUS */}
        <div
          className="ui-card stagger-4"
          style={{
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-green)',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>•••</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Net Capital Surplus
            </div>
            <div
              className="mono-figure"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: snapshot.isDeficit ? 'var(--status-red)' : 'var(--status-green)',
                margin: '0.2rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {snapshot.isDeficit ? `-${formatINR(Math.abs(snapshot.monthlySurplus))}` : formatINR(snapshot.monthlySurplus)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: snapshot.savingsRate >= 20 ? 'rgba(6, 214, 160, 0.12)' : 'rgba(255, 209, 102, 0.12)',
                color: snapshot.savingsRate >= 20 ? 'var(--status-green)' : 'var(--status-yellow)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {snapshot.savingsRate.toFixed(1)}% Saved
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Capital Retention</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: 2/3 DUAL-CURVE AREA CHART + 1/3 ADVISOR WIDGET (MATCHING PICTURE 2 & 3) */}
      <div className="chart-advisor-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* LEFT 2/3: INTERACTIVE CASH FLOW & VELOCITY AREA CHART */}
        <div
          className="ui-card"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Chart Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                Your Assets & Cash Flow Velocity
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.45rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff2a3a' }} />
                  Monthly Inflow
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#990f18' }} />
                  Monthly Outflow
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-pill status-pill-neutral" style={{ fontSize: '0.68rem', padding: '0.25rem 0.65rem' }}>
                12-MONTH PROJECTION
              </span>
            </div>
          </div>

          {/* SVG Multi-Month Glowing Area Chart with Y-Axis */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.75rem', position: 'relative', width: '100%', height: '230px' }}>
            {/* Y-Axis Markings (Picture 2 match) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingBottom: '24px',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textAlign: 'right',
                width: '45px',
                flexShrink: 0,
              }}
            >
              <span>{formatINR(maxVal).replace(/,000$/, 'K')}</span>
              <span>{formatINR(maxVal * 0.66).replace(/,000$/, 'K')}</span>
              <span>{formatINR(maxVal * 0.33).replace(/,000$/, 'K')}</span>
              <span>₹0</span>
            </div>

            {/* SVG Chart Container */}
            <div style={{ position: 'relative', flexGrow: 1, height: '100%' }}>
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Radiant Inflow Red Gradient */}
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff2a3a" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#ff2a3a" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Outflow Dark Crimson Gradient */}
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#990f18" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#990f18" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Dotted horizontal grid guidelines */}
                {[0.25, 0.5, 0.75].map((pct, i) => {
                  const y = svgHeight - paddingY - pct * graphHeight;
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Area Fills */}
                <path d={areaInflow} fill="url(#inflowGrad)" />
                <path d={areaOutflow} fill="url(#outflowGrad)" />

                {/* Stroke Lines */}
                <path
                  d={pathOutflow}
                  fill="none"
                  stroke="#990f18"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d={pathInflow}
                  fill="none"
                  stroke="#ff2a3a"
                  strokeWidth="2.5"
                />

                {/* Active Crosshair & Point Highlight (Media 2 Tooltip Style) */}
                {activeHoverPoint && (
                  <g>
                    <line
                      x1={activeHoverPoint.x}
                      y1={paddingY}
                      x2={activeHoverPoint.x}
                      y2={svgHeight - paddingY}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={activeHoverPoint.x}
                      cy={activeHoverPoint.y}
                      r="5"
                      fill="#ffffff"
                      stroke="#ff2a3a"
                      strokeWidth="3"
                    />
                  </g>
                )}

                {/* Transparent hover hit boxes for each month */}
                {pointsInflow.map((pt, i) => (
                  <rect
                    key={i}
                    x={pt.x - graphWidth / (chartMonths.length * 2)}
                    y={0}
                    width={graphWidth / chartMonths.length}
                    height={svgHeight}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMonthIndex(i)}
                  />
                ))}
              </svg>

              {/* Floating Tooltip Card (Matching Picture 2's tooltip!) */}
              {activeHoverData && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 18, 26, 0.96)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    fontSize: '0.75rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75), 0 0 15px rgba(229, 9, 20, 0.2)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>{activeHoverData.name} 2026</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Inflow: {formatINR(activeHoverData.income)}</span>
                  </div>
                  <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>Outlay</span>
                    <span style={{ color: 'var(--status-red)', fontWeight: 700 }}>{formatINR(activeHoverData.expense)}</span>
                  </div>
                  <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block' }}>Surplus</span>
                    <span style={{ color: 'var(--status-green)', fontWeight: 700 }}>+{formatINR(activeHoverData.surplus)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Month Axis Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginLeft: '52px',
            }}
          >
            {chartMonths.map((m, idx) => (
              <span
                key={m.name}
                style={{
                  color: hoveredMonthIndex === idx ? 'var(--red-bright)' : 'var(--text-muted)',
                  fontWeight: hoveredMonthIndex === idx ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'color var(--duration-fast)',
                }}
                onClick={() => setHoveredMonthIndex(idx)}
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT 1/3: LIVE AI ADVISOR WIDGET (MATCHING PICTURE 2'S RIGHT PANEL) */}
        <div
          className="ui-card"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="pulsing-dot" style={{ background: 'var(--status-green)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  AI Assistant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('advisor')}
                className="btn-ghost"
                style={{ padding: '0.25rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                title="Open Full Advisor"
              >
                Open Terminal <ChevronRight size={14} />
              </button>
            </div>

            {/* Tactical Assessment Thread Preview */}
            <div
              style={{
                background: 'rgba(10, 12, 18, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.15rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                <Terminal size={13} style={{ color: 'var(--red-bright)' }} />
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--red-bright)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  TACTICAL BRIEFING
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {lastAdvisorMsg}
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleChipClick('Analyze my spending breakdown and flag any anomalies.')}
                className="btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                }}
              >
                ⚡ Analyze Spending Anomalies
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('Can I afford allocating more to my active savings missions?')}
                className="btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  fontSize: '0.75rem',
                  padding: '0.45rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                }}
              >
                🎯 Goal Feasibility & Pacing
              </button>
            </div>
          </div>

          {/* Prompt Input Box (Picture 2 capsule bar) */}
          <form onSubmit={handleSendAdvisorPrompt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                placeholder="Ask AI Assistant anything..."
                className="ui-input"
                style={{
                  fontSize: '0.825rem',
                  padding: '0.65rem 2.25rem 0.65rem 0.95rem',
                  borderRadius: 'var(--radius-pill)',
                  width: '100%',
                }}
              />
              <Mic
                size={14}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Send to AI Assistant"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* 4. ACTIVE MISSIONS STRIP (TACTICAL SAVINGS) */}
      {activeMissions.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={15} style={{ color: 'var(--red-bright)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Active Savings Missions ({activeMissions.length})
              </h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeMissions.slice(0, 3).map((mission, idx) => {
              const progress = calculateMissionProgress(mission.currentAmount, mission.targetAmount);
              return (
                <div
                  key={mission.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--red-bright)' }}>
                        MISSION 0{idx + 1}
                      </span>
                      <span className="status-pill status-pill-green" style={{ fontSize: '0.62rem' }}>
                        ● {mission.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.65rem' }}>
                      {mission.name.toUpperCase()}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>CAPITAL: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(mission.currentAmount)}</strong></span>
                      <span>TARGET: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(mission.targetAmount)}</strong></span>
                    </div>

                    <div className="progress-bar-track" style={{ marginBottom: '0.65rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.55rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>ALLOCATION // {formatINR(mission.monthlyContribution)}/mo</span>
                    <span>{progress.toFixed(0)}% PACED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BOTTOM SECTION: FULL-WIDTH TRANSACTION HISTORY (MATCHING PICTURE 2) */}
      <div className="ui-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              Transaction History
            </h3>
            <span className="status-pill status-pill-neutral" style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem' }}>
              {currentMonthTransactions.length} records
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
            >
              <Plus size={14} /> Log Movement
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cashflow')}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
            >
              View Full Ledger →
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        {currentMonthTransactions.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Clock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              No transactions recorded for {selectedMonth}
            </div>
            <p style={{ fontSize: '0.825rem', margin: '0.35rem 0 1.25rem', color: 'var(--text-muted)' }}>
              Record your verified income or expense transactions to activate telemetry.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}
            >
              <Plus size={14} /> Add First Transaction
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', margin: '0 -0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-tactical)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, width: '120px' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>DESCRIPTION</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, width: '120px' }}>TYPE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, width: '140px' }}>CATEGORY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right', width: '140px' }}>AMOUNT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center', width: '130px' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right', width: '90px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthTransactions.slice(0, 6).map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--duration-fast) var(--ease-out)',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {tx.date}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                          {tx.description}
                        </span>
                        {tx.recurring && (
                          <span className="status-pill status-pill-yellow" style={{ fontSize: '0.58rem', padding: '0.12rem 0.4rem' }}>
                            <Repeat size={8} /> RECURRING
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.76rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {tx.type}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="status-pill status-pill-neutral" style={{ fontSize: '0.65rem' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className="mono-figure"
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        textAlign: 'right',
                        color: tx.type === 'income' ? 'var(--status-green)' : '#ffffff',
                      }}
                    >
                      {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span
                        className="status-pill status-pill-green"
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.65rem' }}
                      >
                        ● Completed
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTx(tx);
                            setIsTxModalOpen(true);
                          }}
                          className="btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTransaction(tx.id)}
                          className="btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Add/Edit Modal */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          initialData={editingTx}
          onClose={() => {
            setIsTxModalOpen(false);
            setEditingTx(null);
          }}
        />
      )}
    </div>
  );
};
