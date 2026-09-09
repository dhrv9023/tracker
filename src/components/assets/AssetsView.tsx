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
import { SectionHeader } from '../common/SectionHeader';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Telemetry Readout */}
      <SectionHeader
        sectionIndex="04"
        tag="ASSETS & SIP"
        title="Assets & Investment Planner"
        description="Long-term wealth building simulator. Model compound monthly SIP growth over 1 to 30 years and test asset allocation models."
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsQuestionnaireOpen(true)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.55rem 1rem' }}
            >
              <Shield size={14} /> Risk Questionnaire
            </button>
            <button
              type="button"
              onClick={() =>
                openAdvisorWithContext(
                  { page: 'assets' },
                  'Analyze my investment capacity, current portfolio allocation, and suggest adjustments for optimal risk-adjusted growth.'
                )
              }
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}
            >
              <Terminal size={14} /> AI Portfolio Analysis
            </button>
          </>
        }
      />

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
