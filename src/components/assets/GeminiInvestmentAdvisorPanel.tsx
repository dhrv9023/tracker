// ==========================================================================
// FINANCE OS — GEMINI INVESTMENT ADVISOR PANEL (PHASE 5)
// Conversational intelligence explaining deterministic asset allocations,
// risk profiles, tradeoffs, and scenario queries without hallucinating math.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  explainInvestmentPlan,
  GeminiInvestmentPlanOutput,
  InvestmentPlanningAIContext,
} from '../../services/geminiService';
import { getActiveGeminiApiKey } from '../../services/geminiConfig';
import { formatINR } from '../../utils/finance';
import {
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Shield,
  RefreshCw,
  Info,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export const GeminiInvestmentAdvisorPanel: React.FC = () => {
  const {
    profile,
    snapshot,
    investmentReadiness,
    investmentCapacity,
    investmentProfile,
    assetAllocationPlan,
    portfolioSummary,
    totalMonthlyMissionRequirement,
  } = useFinance();

  const [aiOutput, setAiOutput] = useState<GeminiInvestmentPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Construct structured context
  const buildContext = (query?: string): InvestmentPlanningAIContext => {
    return {
      currency: profile?.user?.currency || 'INR',
      monthly_income: snapshot.totalIncome,
      monthly_expenses: snapshot.totalExpenses,
      monthly_surplus: snapshot.monthlySurplus,
      readiness_status: investmentReadiness.status,
      readiness_reasons: investmentReadiness.reasons,
      essential_monthly_expenses: investmentReadiness.essentialMonthlyExpenses,
      current_emergency_fund: investmentReadiness.currentEmergencyFund,
      emergency_fund_coverage_months: investmentReadiness.emergencyFundCoverageMonths,
      emergency_fund_target_months: investmentReadiness.emergencyFundTargetMonths,
      debt_to_income_ratio: investmentReadiness.debtToIncomeRatio,
      has_high_cost_debt: investmentReadiness.hasHighCostDebt,
      risk_profile: investmentProfile.riskProfile,
      investment_horizon: investmentProfile.horizon,
      monthly_investment_capacity: investmentCapacity.potentialMonthlyCapacity,
      active_savings_missions_commitment: totalMonthlyMissionRequirement,
      recommended_allocation: assetAllocationPlan.items.map((i) => ({
        category: i.label,
        amount: i.monthlyAmount,
        percentage: i.percentage,
      })),
      current_portfolio_summary: {
        total_invested: portfolioSummary.totalInvested,
        current_value: portfolioSummary.currentValue,
        top_holdings: portfolioSummary.categoryBreakdown.map((c) => c.label),
      },
      user_query: query,
    };
  };

  const fetchExplanation = async (query?: string) => {
    const key = getActiveGeminiApiKey();
    setHasApiKey(!!key);
    setIsLoading(true);
    setLastQuery(query || '');

    try {
      const context = buildContext(query);
      const res = await explainInvestmentPlan(context);
      setAiOutput(res);
    } catch (e) {
      console.error('Failed to explain investment plan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [
    investmentCapacity.potentialMonthlyCapacity,
    investmentProfile.riskProfile,
    investmentProfile.horizon,
    investmentReadiness.status,
  ]);

  const handleQuickPrompt = (promptText: string) => {
    setUserQuery(promptText);
    fetchExplanation(promptText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    fetchExplanation(userQuery.trim());
  };

  const quickPrompts = [
    'How much should I invest each month?',
    'Can I invest ₹5,000 more?',
    'Should I invest or save for short-term goals?',
    'Where can I get guaranteed 15% returns?',
  ];

  return (
    <div
      style={{
        background: 'var(--bg-surface, #141824)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--accent-gold, #d4af37)',
                letterSpacing: '0.1em',
              }}
            >
              INTELLIGENCE LAYER // GEMINI COPILOT
            </span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main, #f0f4f8)',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            AI INVESTMENT ADVISOR
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Contextual reasoning, trade-off explanations, and risk insights grounded in your actual financial numbers.
          </p>
        </div>

        <button
          onClick={() => fetchExplanation(userQuery)}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--text-secondary, #94a3b8)',
            fontSize: '12px',
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {quickPrompts.map((q) => (
          <button
            key={q}
            onClick={() => handleQuickPrompt(q)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: lastQuery === q ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: lastQuery === q ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
              color: lastQuery === q ? 'var(--accent-gold, #d4af37)' : 'var(--text-secondary, #94a3b8)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Terminal size={12} />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* AI Analysis Display */}
      {isLoading ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(10, 12, 18, 0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Terminal size={24} color="var(--red-primary)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            ANALYZING FINANCIAL CONTEXT...
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', marginTop: '4px' }}>
            Interpreting capacity, readiness, and portfolio distribution via Gemini
          </div>
        </div>
      ) : aiOutput ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Terminal size={16} style={{ color: 'var(--red-bright)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold, #d4af37)', letterSpacing: '0.05em' }}>
                TACTICAL INVESTMENT ANALYSIS
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-main, #f0f4f8)', lineHeight: '1.6' }}>
              {aiOutput.summary}
            </div>

            {aiOutput.tradeoff_analysis && (
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                <strong>Trade-off Insight:</strong> {aiOutput.tradeoff_analysis}
              </div>
            )}
          </div>

          {/* Key Drivers & Allocation Explanation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Key Drivers */}
            {aiOutput.key_reasons && aiOutput.key_reasons.length > 0 && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(10, 12, 18, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#3a86ff', marginBottom: '8px' }}>
                  KEY PLAN DRIVERS
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {aiOutput.key_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks & Assumptions */}
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(10, 12, 18, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                RISKS & ASSUMPTIONS
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(aiOutput.risks || []).map((risk, i) => (
                  <li key={`risk-${i}`}>{risk}</li>
                ))}
                {(aiOutput.assumptions || []).map((asmp, i) => (
                  <li key={`asmp-${i}`}>{asmp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* Ask Question Bar */}
      <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask a specific investment question (e.g. 'Can I increase my SIP by ₹5,000?')"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f0f4f8',
            fontSize: '13px',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !userQuery.trim()}
          style={{
            padding: '0 16px',
            borderRadius: '8px',
            background: 'var(--accent-gold, #d4af37)',
            border: 'none',
            color: '#0a0c12',
            fontWeight: 700,
            fontSize: '13px',
            cursor: isLoading || !userQuery.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !userQuery.trim() ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Terminal size={14} />
          <span>ANALYZE</span>
        </button>
      </form>

      {/* Safety & Educational Authority Note */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted, #717d96)',
        }}
      >
        <Shield size={13} />
        <span>
          Deterministic finance code computes 100% of numbers. AI interprets context and qualitative factors. No stock recommendations or guaranteed forecasts.
        </span>
      </div>
    </div>
  );
};
export default GeminiInvestmentAdvisorPanel;
