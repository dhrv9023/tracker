// ==========================================================================
// FINANCE OS — PHASE 6: THE ADVISOR (FINANCIAL INTELLIGENCE TERMINAL)
// Tactical command-center AI financial guidance layer.
// Strictly adheres to: Application Calculates -> Gemini Interprets -> User Approves.
// ==========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { SectionHeader } from '../common/SectionHeader';
import {
  ShieldCheck,
  Terminal,
  Send,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AdvisorAction } from '../../types/finance';

const QUICK_PROMPTS = [
  { id: 'review', label: 'REVIEW MY FINANCES', query: 'Give me my monthly financial review and current status summary.' },
  { id: 'afford', label: 'CAN I AFFORD THIS?', query: 'Can I afford a ₹25,000 discretionary purchase right now?' },
  { id: 'spending', label: 'ANALYZE MY SPENDING', query: 'Where am I overspending and where can I cut expenses?' },
  { id: 'prioritize', label: 'WHICH GOAL SHOULD I PRIORITIZE?', query: 'Which of my savings missions should I prioritize first and why?' },
  { id: 'save_invest', label: 'SHOULD I SAVE OR INVEST?', query: 'Should I save this money in liquid missions or invest it into SIPs?' },
];

const LOADING_STATUSES = [
  'ANALYZING FINANCIAL CONTEXT...',
  'CHECKING CASH FLOW & SURPLUS...',
  'EVALUATING ACTIVE MISSIONS...',
  'CALCULATING SAFETY MARGINS...',
  'SYNTHESIZING TACTICAL GUIDANCE...',
];

export const AdvisorView: React.FC = () => {
  const {
    snapshot,
    activeMissions,
    investmentCapacity,
    advisorMessages,
    advisorScreenContext,
    advisorLoading,
    pendingAutoPrompt,
    sendAdvisorMessage,
    clearAdvisorHistory,
    clearPendingAutoPrompt,
    executeAdvisorAction,
  } = useFinance();

  const [inputQuery, setInputQuery] = useState('');
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [advisorMessages, advisorLoading]);

  // Loading status text cycler
  useEffect(() => {
    if (!advisorLoading) return;
    const interval = setInterval(() => {
      setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [advisorLoading]);

  // Handle pending auto prompt from contextual entry buttons
  useEffect(() => {
    if (pendingAutoPrompt && !advisorLoading) {
      const promptToRun = pendingAutoPrompt;
      clearPendingAutoPrompt();
      sendAdvisorMessage(promptToRun);
    }
  }, [pendingAutoPrompt, advisorLoading, clearPendingAutoPrompt, sendAdvisorMessage]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || advisorLoading) return;
    const query = inputQuery.trim();
    setInputQuery('');
    sendAdvisorMessage(query);
  };

  const handleQuickPrompt = (query: string) => {
    if (advisorLoading) return;
    sendAdvisorMessage(query);
  };

  const handleActionClick = (action: AdvisorAction) => {
    executeAdvisorAction(action);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 120px)' }}>
      {/* 1. ADVISOR HEADER WITH SECTION INTEL */}
      <SectionHeader
        sectionIndex="06"
        tag="TACTICAL COPILOT"
        title="The Financial Advisor"
        description="Conversational copilot grounded strictly in your verified financial data. Ask questions, evaluate trade-offs, and run scenario checks without hallucinated figures."
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.5rem 0.95rem' }}
            >
              <ShieldCheck size={14} /> Privacy & Security
            </button>
            <button
              type="button"
              onClick={clearAdvisorHistory}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.5rem 0.95rem' }}
            >
              <RotateCcw size={14} /> Clear History
            </button>
          </>
        }
      />

      {/* 2. ACTIVE SCREEN CONTEXT BADGE (If user arrived with context) */}
      {advisorScreenContext && (
        <div
          style={{
            background: 'rgba(230, 57, 70, 0.08)',
            border: '1px solid rgba(230, 57, 70, 0.3)',
            borderRadius: '6px',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: '#f8f9fa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={15} color="var(--red-bright, #e63946)" />
            <span>
              ACTIVE OPERATIONAL FOCUS //{' '}
              <strong style={{ color: 'var(--red-bright, #e63946)' }}>
                {advisorScreenContext.page.toUpperCase()}
              </strong>
              {advisorScreenContext.selectedMission && ` : MISSION "${advisorScreenContext.selectedMission.name}"`}
              {advisorScreenContext.selectedCategory && ` : CATEGORY "${advisorScreenContext.selectedCategory}"`}
              {advisorScreenContext.metricToExplain && ` : METRIC "${advisorScreenContext.metricToExplain}" (${advisorScreenContext.metricValue || ''})`}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem' }}>
            Contextual grounding enabled
          </span>
        </div>
      )}

      {/* 3. COMPACT FINANCIAL STATUS HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          background: 'rgba(15, 18, 26, 0.7)',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            MONTHLY INCOME
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#10b981', marginTop: '0.2rem' }}>
            {formatINR(snapshot.totalIncome)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            MONTHLY EXPENSES
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#f87171', marginTop: '0.2rem' }}>
            {formatINR(snapshot.totalExpenses)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            MONTHLY SURPLUS
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: snapshot.monthlySurplus >= 0 ? '#38bdf8' : '#ef4444', marginTop: '0.2rem' }}>
            {formatINR(snapshot.monthlySurplus)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            SAVINGS RATE
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', marginTop: '0.2rem' }}>
            {snapshot.savingsRate}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            INVEST CAPACITY
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', marginTop: '0.2rem' }}>
            {formatINR(investmentCapacity.potentialMonthlyCapacity)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            EMERGENCY FUND
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#34d399', marginTop: '0.2rem' }}>
            {snapshot.emergencyFundMonths !== null ? `${snapshot.emergencyFundMonths.toFixed(1)} MO` : 'DATA REQ'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
            ACTIVE MISSIONS
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#f8f9fa', marginTop: '0.2rem' }}>
            {activeMissions.length}
          </div>
        </div>
      </div>

      {/* 4. QUICK INTELLIGENCE PROMPT CHIPS */}
      <div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          TACTICAL GUIDANCE PROMPTS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleQuickPrompt(p.query)}
              disabled={advisorLoading}
              className="btn-ghost"
              style={{
                fontSize: '0.7rem',
                padding: '0.4rem 0.8rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
                opacity: advisorLoading ? 0.6 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              [ {p.label} ]
            </button>
          ))}
        </div>
      </div>

      {/* 5. CONVERSATION STREAM */}
      <div
        style={{
          flexGrow: 1,
          background: 'rgba(11, 14, 20, 0.85)',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: '560px',
          overflowY: 'auto',
        }}
      >
        {advisorMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '80%' : '90%',
                background: isUser ? 'rgba(30, 41, 59, 0.7)' : 'rgba(18, 22, 31, 0.95)',
                border: isUser ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid var(--border-card)',
                borderRadius: '6px',
                padding: '1rem',
                position: 'relative',
              }}
            >
              {/* Message Role Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '0.4rem',
                  marginBottom: '0.65rem',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isUser ? '#94a3b8' : 'var(--red-bright)' }}>
                  {isUser ? <Terminal size={12} /> : <Terminal size={12} />}
                  <strong>{isUser ? 'OPERATIVE' : 'ADVISOR TERMINAL'}</strong>
                  {msg.intent && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', opacity: 0.8 }}>
                      // INTENT: {msg.intent.toUpperCase()}
                    </span>
                  )}
                </div>
                <span style={{ color: '#64748b' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Main Text Content */}
              <div
                style={{
                  color: '#f8f9fa',
                  fontSize: '0.88rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>

              {/* Verified Calculations Grid */}
              {msg.calculations && msg.calculations.length > 0 && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    CALCULATION // DETERMINISTIC FIGURES
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.45rem' }}>
                    {msg.calculations.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(10, 13, 18, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                          {c.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8', marginTop: '0.1rem' }}>
                          {c.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Facts Breakdown */}
              {msg.keyFacts && msg.keyFacts.length > 0 && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '2px solid #10b981', padding: '0.4rem 0.75rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: '0.2rem' }}>
                    FACT // VERIFIED CONTEXT
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {msg.keyFacts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tactical Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(56, 189, 248, 0.05)', borderLeft: '2px solid #38bdf8', padding: '0.4rem 0.75rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: '0.2rem' }}>
                    RECOMMENDATION // TACTICAL STEPS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                    {msg.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings / Tradeoffs */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '2px solid #ef4444', padding: '0.4rem 0.75rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#f87171', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={12} />
                    <span>RISK // TRADE-OFF WARNING</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.4 }}>
                    {msg.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scenario Options */}
              {msg.scenarioOptions && msg.scenarioOptions.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    SCENARIO OPTIONS // WHAT-IF PATHWAYS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {msg.scenarioOptions.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '4px',
                          padding: '0.45rem 0.75rem',
                          fontSize: '0.78rem',
                        }}
                      >
                        <strong style={{ color: '#f8f9fa' }}>{opt.label}: </strong>
                        <span style={{ color: '#94a3b8' }}>{opt.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Actions (Requires Explicit User Confirmation) */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.64rem', color: 'var(--red-bright, #e63946)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    RECOMMENDED ACTION // OPERATIVE CONFIRMATION REQUIRED
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        style={{
                          background: 'rgba(230, 57, 70, 0.15)',
                          border: '1px solid rgba(230, 57, 70, 0.5)',
                          color: '#f8f9fa',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--red-bright, #e63946)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(230, 57, 70, 0.15)';
                          e.currentTarget.style.color = '#f8f9fa';
                        }}
                      >
                        <span>[ REVIEW PLAN: {act.label.toUpperCase()} ]</span>
                        <ArrowRight size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading status ticker */}
        {advisorLoading && (
          <div
            style={{
              background: 'rgba(18, 22, 31, 0.95)',
              border: '1px solid var(--border-red-subtle)',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--red-bright)',
            }}
          >
            <span className="pulsing-dot" style={{ background: 'var(--red-primary)' }} />
            <span>{LOADING_STATUSES[loadingStatusIndex]}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 6. INPUT CONSOLE */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          gap: '0.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--red-bright)', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}>
          &gt;
        </span>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about your money, goals, spending, savings, or investments..."
          disabled={advisorLoading}
          className="ui-input"
          style={{
            flexGrow: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '0.88rem',
          }}
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || advisorLoading}
          className={inputQuery.trim() && !advisorLoading ? "btn-primary" : "btn-secondary"}
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '0.5rem 1rem',
            opacity: (!inputQuery.trim() || advisorLoading) ? 0.6 : 1,
          }}
        >
          <span>SUBMIT</span>
          <Send size={13} />
        </button>
      </form>

      {/* 7. PRIVACY & SECURITY MODAL */}
      {showPrivacyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#0d1117',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={22} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8f9fa', fontFamily: 'JetBrains Mono, monospace' }}>
                DATA PRIVACY & AI SECURITY NOTICE
              </h2>
            </div>

            <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0 }}>
                <strong>The Advisor is a planning guidance tool.</strong> To answer your questions, only anonymized numerical planning parameters (income, surplus, active mission deadlines, and budget limits) are analyzed.
              </p>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.25rem' }}>WHAT IS NEVER TRANSMITTED:</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8' }}>
                  <li>No passwords or banking authentication credentials</li>
                  <li>No bank account numbers or PAN / Aadhaar identifiers</li>
                  <li>No broker credentials or payment instrument details</li>
                </ul>
              </div>
              <p style={{ margin: 0 }}>
                <strong>Deterministic Calculations:</strong> All critical financial mathematics (affordability capacity, goal priority scores, SIP future values) are computed purely in local application code. Gemini only interprets and explains these verified results.
              </p>
              <p style={{ margin: 0 }}>
                <strong>User Control:</strong> The Advisor cannot execute transactions, buy/sell assets, or modify your database without your explicit approval.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  background: 'var(--red-bright, #e63946)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ACKNOWLEDGED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorView;
