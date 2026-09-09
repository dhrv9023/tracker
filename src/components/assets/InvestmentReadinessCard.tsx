// ==========================================================================
// FINANCE OS — INVESTMENT READINESS ANALYSIS (PHASE 5)
// Evaluates cash flow surplus, emergency runway, and debt burden before
// recommending aggressive market investments.
// ==========================================================================

import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  CreditCard,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface InvestmentReadinessCardProps {
  onOpenQuestionnaire?: () => void;
}

export const InvestmentReadinessCard: React.FC<InvestmentReadinessCardProps> = ({
  onOpenQuestionnaire,
}) => {
  const { investmentReadiness, investmentProfile, saveInvestmentProfile } = useFinance();

  const getStatusBadge = () => {
    switch (investmentReadiness.status) {
      case 'ready':
        return {
          label: 'READY TO INVEST',
          color: 'var(--accent-gold, #d4af37)',
          bg: 'rgba(212, 175, 55, 0.12)',
          border: 'rgba(212, 175, 55, 0.35)',
          icon: ShieldCheck,
        };
      case 'partially_ready':
        return {
          label: 'PARTIALLY READY',
          color: '#3a86ff',
          bg: 'rgba(58, 134, 255, 0.12)',
          border: 'rgba(58, 134, 255, 0.35)',
          icon: CheckCircle2,
        };
      case 'building_foundation':
        return {
          label: 'BUILDING FOUNDATION',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.35)',
          icon: AlertTriangle,
        };
      case 'not_ready':
      default:
        return {
          label: 'NOT READY',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)',
          icon: AlertOctagon,
        };
    }
  };

  const badge = getStatusBadge();
  const StatusIcon = badge.icon;

  const targetOptions = [3, 6, 9, 12];

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
      {/* Top Banner */}
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
                color: 'var(--text-muted, #717d96)',
                letterSpacing: '0.1em',
              }}
            >
              PREREQUISITE AUDIT // STAGE 01
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
            INVESTMENT READINESS ANALYSIS
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            We analyze your cash flow, emergency runway, and debt before calculating investment plans.
          </p>
        </div>

        {/* Readiness Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          <StatusIcon size={16} />
          {badge.label}
        </div>
      </div>

      {/* Summary Box */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(10, 12, 18, 0.6)',
          borderLeft: `3px solid ${badge.color}`,
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)', marginBottom: '4px' }}>
          {investmentReadiness.title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', lineHeight: '1.5' }}>
          {investmentReadiness.summary}
        </div>
      </div>

      {/* Grid: Emergency Fund Check & Debt Check */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Card 1: Emergency Fund Check */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-gold, #d4af37)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
                EMERGENCY RESERVE CHECK
              </span>
            </div>
            {/* Target selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>Target:</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {targetOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => saveInvestmentProfile({ emergencyTargetMonths: m })}
                    style={{
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      borderRadius: '4px',
                      border: 'none',
                      background:
                        investmentProfile.emergencyTargetMonths === m
                          ? 'var(--accent-gold, #d4af37)'
                          : 'rgba(255, 255, 255, 0.08)',
                      color:
                        investmentProfile.emergencyTargetMonths === m
                          ? '#0a0c12'
                          : 'var(--text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      fontWeight: investmentProfile.emergencyTargetMonths === m ? 700 : 500,
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>ESSENTIAL EXPENSES</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)', fontFamily: 'var(--font-mono, monospace)' }}>
                {formatINR(investmentReadiness.essentialMonthlyExpenses)}/mo
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>CURRENT RESERVE</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)', fontFamily: 'var(--font-mono, monospace)' }}>
                {formatINR(investmentReadiness.currentEmergencyFund)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>RUNWAY COVERED</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  color:
                    investmentReadiness.emergencyFundCoverageMonths >= investmentReadiness.emergencyFundTargetMonths
                      ? '#10b981'
                      : investmentReadiness.emergencyFundCoverageMonths >= 3
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                {investmentReadiness.emergencyFundCoverageMonths} / {investmentReadiness.emergencyFundTargetMonths} Months
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>RESERVE SHORTFALL</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: investmentReadiness.emergencyFundShortfall > 0 ? '#f59e0b' : '#10b981',
                }}
              >
                {investmentReadiness.emergencyFundShortfall > 0
                  ? formatINR(investmentReadiness.emergencyFundShortfall)
                  : 'Funded ✓'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(
                  100,
                  (investmentReadiness.currentEmergencyFund /
                    Math.max(1, investmentReadiness.essentialMonthlyExpenses * investmentReadiness.emergencyFundTargetMonths)) *
                    100
                )}%`,
                background:
                  investmentReadiness.emergencyFundCoverageMonths >= investmentReadiness.emergencyFundTargetMonths
                    ? '#10b981'
                    : 'var(--accent-gold, #d4af37)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Card 2: Debt & Obligations Check */}
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CreditCard size={16} color={investmentReadiness.hasHighCostDebt ? '#ef4444' : '#3a86ff'} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)' }}>
              DEBT & LIABILITY AUDIT
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>OUTSTANDING DEBT</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)', fontFamily: 'var(--font-mono, monospace)' }}>
                {formatINR(investmentReadiness.outstandingDebt)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>MONTHLY EMI / PAYMENT</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #f0f4f8)', fontFamily: 'var(--font-mono, monospace)' }}>
                {formatINR(investmentReadiness.monthlyDebtPayment)}/mo
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>DEBT-TO-INCOME (DTI)</div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: investmentReadiness.debtToIncomeRatio > 40 ? '#ef4444' : '#10b981',
                }}
              >
                {investmentReadiness.debtToIncomeRatio}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>HIGH-COST LIABILITIES</div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: investmentReadiness.hasHighCostDebt ? '#ef4444' : '#10b981',
                }}
              >
                {investmentReadiness.hasHighCostDebt ? 'Alert: Credit Card Debt' : 'None Detected ✓'}
              </div>
            </div>
          </div>

          {investmentReadiness.hasHighCostDebt && (
            <div
              style={{
                fontSize: '11px',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '6px 10px',
                borderRadius: '6px',
                marginTop: '6px',
                lineHeight: '1.4',
              }}
            >
              ⚠ Reducing revolving high-cost debt guarantees a risk-free return and should precede aggressive market investing.
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {onOpenQuestionnaire && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
          }}
        >
          <button
            onClick={onOpenQuestionnaire}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold, #d4af37)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '6px',
            }}
          >
            <span>Retake Investment Questionnaire</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
export default InvestmentReadinessCard;
