// ==========================================================================
// FINANCE OS — SYSTEM WALKTHROUGH & FIELD MANUAL
// Human-designed visual guide featuring screenshots, metrics & workflows
// ==========================================================================

import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  TrendingUp,
  Activity,
  ShieldCheck,
  Lock,
  Maximize2,
  X,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface WalkthroughViewProps {
  onNavigate: (tabId: string) => void;
  onOpenTutorial?: () => void;
}

interface WalkthroughSection {
  id: string;
  tabId: string;
  index: string;
  title: string;
  tagline: string;
  screenshot: string;
  screenshotCaption: string;
  icon: React.ElementType;
  overview: string;
  keyMetrics: { label: string; formula: string; purpose: string }[];
  steps: string[];
  actionLabel: string;
}

export const WalkthroughView: React.FC<WalkthroughViewProps> = ({ onNavigate, onOpenTutorial }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; caption: string } | null>(null);

  const sections: WalkthroughSection[] = [
    {
      id: 'dashboard',
      tabId: 'dashboard',
      index: '01',
      title: 'COMMAND CENTER & LIQUIDITY TELEMETRY',
      tagline: 'High-altitude situational awareness: inflow, outflow, net surplus velocity, and live tactical AI.',
      screenshot: '/screenshots/real_dashboard.png',
      screenshotCaption: 'Authentic Command Center: Crimson Hero Card, Multi-Month Area Velocity Chart, Live Advisor Widget & Transaction Ledger.',
      icon: LayoutDashboard,
      overview:
        'The Command Center gives you an instantaneous, 3-second operational read of your financial position. Modeled directly after the high-stakes tactical command console, it isolates your top four vital signs without spreadsheet clutter.',
      keyMetrics: [
        {
          label: 'Total Monthly Inflow',
          formula: 'Sum of all monthly salaries, dividends & passive earnings',
          purpose: 'Defines your top-line capital influx for budgeting & mission funding.',
        },
        {
          label: 'Available Surplus',
          formula: 'Monthly Inflow - (Fixed Needs + Discretionary Wants + Active SIPs)',
          purpose: 'Unallocated free cash flow ready for immediate deployment into missions.',
        },
        {
          label: 'Liquid Reserves',
          formula: 'Checking + Savings + Cash equivalents',
          purpose: 'Immediate survival liquidity protecting you from debt emergencies.',
        },
        {
          label: 'Net Burn / Velocity',
          formula: 'Dual-curve area chart trajectory over rolling 12 months',
          purpose: 'Visualizes whether capital reserves are expanding or draining.',
        },
      ],
      steps: [
        'Review the Crimson Hero Card for your current month top-line influx.',
        'Hover over the multi-month Area Chart to inspect inflow vs outlay deltas.',
        'Use the integrated AI Assistant input bar to query tactical tradeoffs without leaving the dashboard.',
        'Inspect recent transactions in the ledger below to confirm settled entries.',
      ],
      actionLabel: 'Launch Command Center',
    },
    {
      id: 'cashflow',
      tabId: 'cashflow',
      index: '02',
      title: 'CASH FLOW & DISCIPLINED LEDGER',
      tagline: 'Deterministic transaction tracking, envelope budgeting, and zero-leak expenditure audits.',
      screenshot: '/screenshots/real_cashflow.png',
      screenshotCaption: 'Authentic Cash Flow View: Income vs Outflow delta summary, budget envelopes, and categorized movement ledger.',
      icon: ArrowLeftRight,
      overview:
        'Cash Flow is the mathematical backbone of Finance OS. Every rupee entering or leaving the perimeter is logged, categorized into Needs, Wants, or Investments, and verified against your monthly budget caps.',
      keyMetrics: [
        {
          label: 'Fixed Obligations (Needs)',
          formula: 'Rent + EMIs + Utilities + Groceries + Insurance',
          purpose: 'Non-negotiable baseline expenses required to sustain operations.',
        },
        {
          label: 'Discretionary Spend (Wants)',
          formula: 'Dining out + Entertainment + Shopping + Subscriptions',
          purpose: 'Adjustable burn rate that can be trimmed instantly during tactical crunches.',
        },
        {
          label: 'Envelope Utilization %',
          formula: '(Category Actual Spent / Category Budget Cap) × 100',
          purpose: 'Prevents budget overruns before the month closes.',
        },
      ],
      steps: [
        'Click "+ Log Movement" to record incoming capital or outgoing expenditures.',
        'Assign a category and classify as Need, Want, or Investment.',
        'Monitor the progress rings on your category envelope budgets.',
        'Switch between months using the calendar selector to review historical trends.',
      ],
      actionLabel: 'Open Cash Flow Ledger',
    },
    {
      id: 'missions',
      tabId: 'missions',
      index: '03',
      title: 'TACTICAL MISSIONS & TARGET PACING',
      tagline: 'Goal-oriented capital accumulation: emergency runways, debt strikes, and milestone vaults.',
      screenshot: '/screenshots/real_missions.png',
      screenshotCaption: 'Authentic Tactical Missions: Capital accumulation goals, target pacing bars, and conflict detection alerts.',
      icon: Target,
      overview:
        'Missions turn passive savings into targeted financial strikes. Rather than leaving cash idle in low-interest accounts, you allocate every surplus rupee to structured operations with clear deadlines and priority tiers.',
      keyMetrics: [
        {
          label: 'Emergency Runway',
          formula: 'Liquid Reserves / Monthly Fixed Outlay',
          purpose: 'Survival buffer measured in months of life expenses covered.',
        },
        {
          label: 'Pacing Velocity',
          formula: 'Current Accumulated Capital / Target Required Capital',
          purpose: 'Percentage progress showing exact distance to mission completion.',
        },
        {
          label: 'Conflict Status',
          formula: 'Calculates if total mission monthly demands exceed available surplus',
          purpose: 'Automated defense warning preventing over-commitment.',
        },
      ],
      steps: [
        'Click "+ New Mission" and choose Emergency Fund, Debt Strike, or Milestone Vault.',
        'Set target amount, deadline, and priority rank (Alpha / Bravo / Charlie).',
        'Use "Deploy Capital" to direct free monthly surplus into active missions.',
        'Observe the conflict engine alert if target commitments exceed available cash flow.',
      ],
      actionLabel: 'Configure Missions',
    },
    {
      id: 'assets',
      tabId: 'assets',
      index: '04',
      title: 'ASSET PORTFOLIO & COMPOUND SIP ENGINE',
      tagline: 'Multi-asset class tracking, SIP growth modeling, and long-term wealth compounding.',
      screenshot: '/screenshots/real_assets.png',
      screenshotCaption: 'Authentic Assets View: Equity, Debt, Gold & Liquid distribution with interactive compound SIP projections.',
      icon: TrendingUp,
      overview:
        'The Assets subsystem models your balance sheet. It categorizes your holdings across Equity, Fixed Income (Debt), Gold, and Liquid Cash, while providing an exact compound interest calculator to project future wealth.',
      keyMetrics: [
        {
          label: 'Total Net Portfolio',
          formula: 'Equity + Debt + Gold + Cash Equivalents',
          purpose: 'Macro balance sheet strength excluding depreciating consumer goods.',
        },
        {
          label: 'Asset Allocation Ratio',
          formula: '% split across Equity / Debt / Gold / Cash',
          purpose: 'Ensures proper diversification matched to your risk tolerance.',
        },
        {
          label: 'SIP Compounded Value',
          formula: 'P × [((1 + i)^n - 1) / i] × (1 + i)',
          purpose: 'Deterministic mathematical calculation of disciplined monthly compounding.',
        },
      ],
      steps: [
        'Log existing holdings across mutual funds, stocks, fixed deposits, or gold.',
        'Use the interactive SIP Calculator sliders to model monthly investments from 1 to 30 years.',
        'Observe the exact split between invested capital and earned compound interest.',
        'Review the AI Investment Guidance panel for strategic rebalancing advice.',
      ],
      actionLabel: 'Explore Assets & SIP',
    },
    {
      id: 'insights',
      tabId: 'insights',
      index: '05',
      title: 'INTELLIGENCE RADAR & MONTHLY AUDIT',
      tagline: 'Automated financial health score, spending anomaly detection, and end-of-month reviews.',
      screenshot: '/screenshots/real_insights.png',
      screenshotCaption: 'Authentic Intelligence Radar: Real-time anomaly detection, financial health scoring, and monthly audit debrief.',
      icon: Activity,
      overview:
        'The Insights engine runs deterministic heuristics on your financial data. It surfaces unusual spending spikes, evaluates your debt-to-income ratio, and produces an automated end-of-month operational debrief.',
      keyMetrics: [
        {
          label: 'Financial Health Score',
          formula: 'Weighted composite of Savings Rate (30%), Runway (30%), Budget Discipline (20%), Debt Load (20%)',
          purpose: 'Single 0-100 metric tracking your month-over-month financial resilience.',
        },
        {
          label: 'Category Spike Alert',
          formula: 'Category spend > 125% of 3-month trailing average',
          purpose: 'Early warning radar catching lifestyle creep before it exhausts cash flow.',
        },
        {
          label: 'Savings Rate %',
          formula: '((Inflow - Outflow) / Inflow) × 100',
          purpose: 'Core indicator of wealth-building velocity.',
        },
      ],
      steps: [
        'Check the active Intelligence Feed for real-time anomaly alerts.',
        'Review the Monthly Audit tab at the end of each calendar month.',
        'Generate an AI-powered strategic summary comparing this month to last month.',
        'Adopt targeted tactical recommendations to improve your health score next cycle.',
      ],
      actionLabel: 'Inspect Insights Radar',
    },
    {
      id: 'advisor',
      tabId: 'advisor',
      index: '06',
      title: 'THE ADVISOR — TACTICAL AI COPILOT',
      tagline: 'Deterministic calculations meet generative strategic counsel. Zero key exposure.',
      screenshot: '/screenshots/real_advisor.png',
      screenshotCaption: 'Authentic Tactical Advisor: Verified figures, conversational tradeoff queries, and Vercel serverless security.',
      icon: ShieldCheck,
      overview:
        'The Advisor acts as your financial chief of staff. Grounded entirely in your real numbers (surplus, debts, missions, portfolio), it answers complex "What If?" scenarios without ever guessing or hallucinating basic arithmetic.',
      keyMetrics: [
        {
          label: 'Mathematical Grounding',
          formula: 'Deterministic calculation engine feeds verified JSON to the prompt',
          purpose: 'Eliminates AI arithmetic errors and provides rock-solid figures.',
        },
        {
          label: 'Zero Key Exposure',
          formula: 'Requests route through /api/gemini on Vercel serverless runtime',
          purpose: 'Guarantees your Gemini API key is never bundled into client JavaScript.',
        },
        {
          label: 'Scenario Modeling',
          formula: 'Simulates "What happens if I allocate ₹10K extra to Debt Payoff?"',
          purpose: 'Reveals second-order effects on emergency runway and mission timelines.',
        },
      ],
      steps: [
        'Select one of the pre-calculated tactical prompt chips (e.g. "Analyze Spending Anomalies").',
        'Or type custom queries like "Can I afford a ₹50,000 purchase this month without breaching runway?"',
        'Review the structured advice complete with pros, cons, and mathematical breakdowns.',
        'Clear conversation history at any time with the top-right privacy trigger.',
      ],
      actionLabel: 'Consult Advisor',
    },
  ];

  const filteredSections =
    activeFilter === 'all'
      ? sections
      : sections.filter((s) => s.id === activeFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Visual Section Header */}
      <SectionHeader
        sectionIndex="08"
        tag="FIELD MANUAL"
        title="SYSTEM MANUAL & FIELD BLUEPRINT"
        description="Comprehensive visual breakdown of all operational modules, metric formulas, tactical workflows, and deterministic architecture."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="btn-ghost"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.4rem' }}
              >
                <HelpCircle size={15} style={{ color: 'var(--red-bright)' }} />
                <span>Launch Interactive Tour</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', gap: '0.4rem' }}
            >
              <Zap size={14} />
              <span>Enter Command Center</span>
            </button>
          </div>
        }
      />

      {/* Chapter Quick-Jump Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: activeFilter === 'all' ? 'var(--red-primary)' : 'transparent',
            color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${activeFilter === 'all' ? 'var(--red-primary)' : 'var(--border-subtle)'}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}
        >
          ALL MODULES ({sections.length})
        </button>

        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeFilter === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveFilter(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--red-badge-bg)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--border-red-subtle)' : 'var(--border-subtle)'}`,
                borderLeft: isActive ? '3px solid var(--red-primary)' : '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              <Icon size={14} style={{ color: isActive ? 'var(--red-bright)' : 'var(--text-muted)' }} />
              <span>{section.index} // {section.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Module Blueprint Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {filteredSections.map((section) => {
          const Icon = section.icon;
          return (
            <article
              key={section.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--red-badge-bg)',
                      border: '1px solid var(--border-red-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--red-bright)',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        className="status-pill status-pill-red"
                        style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                      >
                        SECTION {section.index}
                      </span>
                      <h3
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {section.tagline}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(section.tabId)}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 0.9rem',
                    gap: '0.45rem',
                    fontWeight: 700,
                  }}
                >
                  <span>{section.actionLabel}</span>
                  <ArrowRight size={14} style={{ color: 'var(--red-bright)' }} />
                </button>
              </div>

              {/* Main Split: Screenshot Preview (Left) + Overview & Workflows (Right) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '2rem',
                  alignItems: 'stretch',
                }}
              >
                {/* Visual Screenshot Frame with Lightbox Trigger */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    onClick={() =>
                      setLightboxImage({
                        src: section.screenshot,
                        title: section.title,
                        caption: section.screenshotCaption,
                      })
                    }
                    role="button"
                    tabIndex={0}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-tactical)',
                      background: '#0a0c13',
                      cursor: 'zoom-in',
                      aspectRatio: '16 / 10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                    }}
                    title="Click to view full-resolution screenshot"
                  >
                    <img
                      src={section.screenshot}
                      alt={section.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--duration-normal) var(--ease-out)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(9, 10, 15, 0.85) 0%, transparent 60%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'rgba(0,0,0,0.75)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.72rem',
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      >
                        <Maximize2 size={13} style={{ color: 'var(--red-bright)' }} />
                        <span>Click to Enlarge Screenshot</span>
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    // {section.screenshotCaption}
                  </p>
                </div>

                {/* Tactical Content & Operating Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--red-bright)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Operational Overview
                    </h4>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {section.overview}
                    </p>
                  </div>

                  {/* Standard Operating Procedure (Workflow) */}
                  <div
                    style={{
                      background: 'rgba(10, 12, 19, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CheckCircle2 size={14} style={{ color: 'var(--status-green)' }} />
                      <span>Standard Operating Procedure</span>
                    </h4>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      {section.steps.map((step, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.65rem',
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              color: 'var(--red-bright)',
                              fontWeight: 700,
                              minWidth: '18px',
                            }}
                          >
                            0{idx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Key Metrics Formula & Purpose */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Key Telemetry & Mathematical Formulas
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {section.keyMetrics.map((km, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {km.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--status-yellow)',
                          background: 'rgba(255, 209, 102, 0.08)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '2px',
                          border: '1px solid rgba(255, 209, 102, 0.2)',
                        }}
                      >
                        {km.formula}
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.35,
                          marginTop: '0.2rem',
                        }}
                      >
                        {km.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Security & Architectural Invariant Footer Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.9) 0%, rgba(9, 10, 15, 0.95) 100%)',
          border: '1px solid var(--border-tactical)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-card-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 214, 160, 0.12)',
              border: '1px solid rgba(6, 214, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-green)',
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
              THE DETERMINISTIC ARCHITECTURAL GUARANTEE
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Zero hallucination risk. Zero client-side API key leakage. 100% user data sovereignty.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              1. Deterministic Calculation Core
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              All financial totals, SIP compound growth, budget envelope utilization, and runway ratios are executed via verified TypeScript arithmetic. AI models never compute your balance sheet.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              2. Vercel Serverless Key Shield
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              All Gemini generative requests route through <code style={{ color: 'var(--red-bright)' }}>api/gemini.ts</code> on Vercel's server runtime. Your Gemini API key is never bundled in browser JavaScript chunks.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              3. Local-First Data Sovereignty
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Transactions, missions, and portfolio data reside exclusively in your browser's persistent storage. You can export encrypted JSON backups or purge the data store at any time in Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Screenshot Lightbox Modal */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 10, 0.94)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              maxWidth: '1200px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-tactical)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-sidebar)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {lightboxImage.title}
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {lightboxImage.caption}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="btn-ghost"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image */}
            <div
              style={{
                maxHeight: '75vh',
                overflow: 'auto',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
