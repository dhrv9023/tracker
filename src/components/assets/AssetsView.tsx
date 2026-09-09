// ==========================================================================
// FINANCE OS — ASSET ALLOCATION & INVESTMENT PLANNER (PHASE 5)
// Primary console for investment readiness, monthly capacity, illustrative
// asset allocation, SIP compounding, scenario simulation, and portfolio tracking.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { InvestmentReadinessCard } from './InvestmentReadinessCard';
import { MonthlyCapacityCard } from './MonthlyCapacityCard';
import { IllustrativeAllocationCard } from './IllustrativeAllocationCard';
import { PortfolioTrackingCard } from './PortfolioTrackingCard';
import { CurrentVsTargetComparison } from './CurrentVsTargetComparison';
import { SIPCalculatorCard } from './SIPCalculatorCard';
import { ScenarioComparisonTable } from './ScenarioComparisonTable';
import { GeminiInvestmentAdvisorPanel } from './GeminiInvestmentAdvisorPanel';
import { RiskQuestionnaireModal } from './RiskQuestionnaireModal';
import {
  TrendingUp,
  Shield,
  PieChart,
  Calculator,
  Layers,
  Award,
  Wallet,
  Terminal,
} from 'lucide-react';

export const AssetsView: React.FC = () => {
  const {
    investmentReadiness,
    investmentCapacity,
    investmentProfile,
    portfolioSummary,
    openAdvisorWithContext,
  } = useFinance();


  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  return (
    <div
      style={{
        padding: '24px 32px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Top Banner & Telemetry Readout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
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
              FINANCE OS // ASSET ENGINE
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-main, #f0f4f8)',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            ASSET ALLOCATION
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Build an investment plan around your financial reality.
          </p>
        </div>

        {/* Top Telemetry Pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Readiness Pill */}
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(10, 12, 18, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
              READINESS STATUS
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color:
                  investmentReadiness.status === 'ready'
                    ? 'var(--accent-gold, #d4af37)'
                    : investmentReadiness.status === 'building_foundation'
                    ? '#f59e0b'
                    : '#3a86ff',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              {investmentReadiness.status.replace('_', ' ')}
            </div>
          </div>

          {/* Monthly Capacity Pill */}
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(10, 12, 18, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
              MONTHLY CAPACITY
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-gold, #d4af37)',
                fontFamily: 'var(--font-mono, monospace)',
                marginTop: '2px',
              }}
            >
              {formatINR(investmentCapacity.potentialMonthlyCapacity)}/mo
            </div>
          </div>

          {/* Risk Profile Pill */}
          <button
            onClick={() => setIsQuestionnaireOpen(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--accent-gold, #d4af37)', textTransform: 'uppercase', fontWeight: 600 }}>
              RISK PROFILE
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f0f4f8',
                textTransform: 'uppercase',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{investmentProfile.riskProfile}</span>
              <span style={{ fontSize: '10px', color: 'var(--accent-gold, #d4af37)' }}>✎</span>
            </div>
          </button>

          {/* Ask Advisor Review Plan Button */}
          <button
            type="button"
            onClick={() =>
              openAdvisorWithContext(
                { page: 'assets' },
                'Review my illustrative asset allocation plan, risk profile, and monthly capacity.'
              )
            }
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(230, 57, 70, 0.15)',
              border: '1px solid rgba(230, 57, 70, 0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f8f9fa',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            <Terminal size={14} color="var(--red-bright)" />
            <span>REVIEW THIS PLAN</span>
          </button>
        </div>
      </div>


      {/* 1. Investment Readiness Card */}
      <InvestmentReadinessCard onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)} />

      {/* 2. Monthly Investment Capacity Derivation */}
      <MonthlyCapacityCard />

      {/* 3. Illustrative Model Allocation */}
      <IllustrativeAllocationCard />

      {/* 4. Portfolio Tracking (Manual Holdings) */}
      <PortfolioTrackingCard />

      {/* 5. Current vs Target Model Comparison */}
      <CurrentVsTargetComparison />

      {/* 6. SIP Calculator */}
      <SIPCalculatorCard />

      {/* 7. Scenario Comparison & Contribution Scaling */}
      <ScenarioComparisonTable />

      {/* 8. Gemini Investment Advisor */}
      <GeminiInvestmentAdvisorPanel />

      {/* Questionnaire Modal */}
      <RiskQuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
      />
    </div>
  );
};
export default AssetsView;
