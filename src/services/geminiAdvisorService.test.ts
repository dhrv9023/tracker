import { describe, it, expect } from 'vitest';
import {
  classifyIntent,
  runDeterministicPreCalculations,
  buildDeterministicFallback,
  sanitizeAdvisorOutput,
  AdvisorStructuredOutput,
} from './geminiAdvisorService';
import { FinancialSnapshot, SavingsMission, Budget, Transaction, InvestmentReadinessEvaluation, InvestmentCapacityBreakdown } from '../types/finance';

describe('Phase 6 — Gemini Advisor Service', () => {
  const mockSnapshot: FinancialSnapshot = {
    totalIncome: 80000,
    totalExpenses: 50000,
    fixedExpenses: 35000,
    variableExpenses: 15000,
    monthlySurplus: 30000,
    isDeficit: false,
    savingsRate: 38,
    investmentRate: 15,
    debtToIncomeRatio: 0,
    expenseRatio: 63,
    emergencyFundMonths: 4.0,
  };

  const mockMissions: SavingsMission[] = [
    {
      id: 'm-1',
      missionCode: 'MISSION 0001',
      name: 'Emergency Buffer',
      category: 'Emergency Fund',
      targetAmount: 200000,
      initialAmount: 40000,
      currentAmount: 80000,
      targetDate: '2026-12-01',
      isAsap: false,
      monthlyContribution: 15000,
      priority: 'high',
      status: 'on_track',
      isArchived: false,
      createdAt: '2026-08-01',
      updatedAt: '2026-09-01',
    },
  ];

  const mockReadiness: InvestmentReadinessEvaluation = {
    status: 'ready',
    score: 85,
    title: 'Ready',
    summary: 'Strong base',
    reasons: [],
    essentialMonthlyExpenses: 35000,
    currentEmergencyFund: 140000,
    emergencyFundCoverageMonths: 4.0,
    emergencyFundTargetMonths: 6,
    emergencyFundShortfall: 70000,
    outstandingDebt: 0,
    monthlyDebtPayment: 0,
    debtToIncomeRatio: 0,
    hasHighCostDebt: false,
    monthlySurplus: 30000,
    isDeficit: false,
  };

  const mockCapacity: InvestmentCapacityBreakdown = {
    monthlyIncome: 80000,
    monthlyExpenses: 50000,
    availableSurplus: 30000,
    activeMissionsCommitment: 15000,
    emergencyFundAllocation: 5000,
    safetyBufferAmount: 5000,
    safetyBufferPercent: 15,
    potentialMonthlyCapacity: 10000,
    isConstrained: false,
    constraintReasons: [],
  };

  describe('classifyIntent', () => {
    it('classifies affordability queries accurately', () => {
      expect(classifyIntent('Can I afford a ₹25,000 phone?')).toBe('affordability');
      expect(classifyIntent('Can I buy a new laptop for 60000?')).toBe('affordability');
    });

    it('classifies goal prioritization questions', () => {
      expect(classifyIntent('Which goal should I prioritize?')).toBe('goal_prioritization');
      expect(classifyIntent('Which mission should I focus on first?')).toBe('goal_prioritization');
    });

    it('classifies save vs invest questions', () => {
      expect(classifyIntent('Should I save or invest my bonus?')).toBe('savings_vs_investing');
    });

    it('classifies monthly review requests', () => {
      expect(classifyIntent('Give me my monthly financial review')).toBe('monthly_review');
    });

    it('classifies what-if scenarios', () => {
      expect(classifyIntent('What if my salary increases by ₹10,000?')).toBe('scenario_analysis');
    });

    it('classifies metric explanation when screenContext provides a metric', () => {
      expect(
        classifyIntent('Explain this to me', { page: 'dashboard', metricToExplain: 'savingsRate' })
      ).toBe('explain_metric');
    });
  });

  describe('runDeterministicPreCalculations', () => {
    it('pre-computes affordability calculations with exact numbers', () => {
      const { calculationData, suggestedCalculations } = runDeterministicPreCalculations(
        'affordability',
        'Can I afford a ₹15,000 gadget?',
        {
          userQuery: 'Can I afford a ₹15,000 gadget?',
          context: {} as any,
          snapshot: mockSnapshot,
          missions: mockMissions,
          budgets: [],
          transactions: [],
          investmentReadiness: mockReadiness,
          investmentCapacity: mockCapacity,
        }
      );

      expect(calculationData.purchaseAmount).toBe(15000);
      expect(calculationData.affordabilityStatus).toBeDefined();
      expect(suggestedCalculations.length).toBeGreaterThanOrEqual(4);
      expect(suggestedCalculations.some((c) => c.label === 'Monthly Surplus')).toBe(true);
    });
  });

  describe('sanitizeAdvisorOutput', () => {
    const fallback: AdvisorStructuredOutput = {
      intent: 'affordability',
      status: 'FALLBACK',
      answer: 'Fallback answer',
      key_facts: ['Fact 1'],
      calculations: [{ label: 'Capacity', value: '₹10,000' }],
      recommendations: ['Rec 1'],
      warnings: [],
    };

    it('cleans raw JSON wrapped in markdown fences', () => {
      const raw = `\`\`\`json
{
  "intent": "affordability",
  "status": "READY",
  "answer": "You can comfortably afford this gadget within your monthly buffer.",
  "key_facts": ["Monthly surplus is ₹30,000"],
  "calculations": [{"label": "Discretionary buffer", "value": "₹10,000"}],
  "recommendations": ["Fund purchase from uncommitted cash flow"],
  "warnings": []
}
\`\`\``;

      const sanitized = sanitizeAdvisorOutput(raw, fallback);
      expect(sanitized.status).toBe('READY');
      expect(sanitized.answer).toContain('comfortably afford');
      expect(sanitized.calculations[0].value).toBe('₹10,000');
    });

    it('returns structured fallback on invalid JSON', () => {
      const sanitized = sanitizeAdvisorOutput('INVALID_NON_JSON_RESPONSE', fallback);
      expect(sanitized.status).toBe('FALLBACK');
      expect(sanitized.answer).toBe('Fallback answer');
    });
  });
});
