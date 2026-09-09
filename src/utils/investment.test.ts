// ==========================================================================
// FINANCE OS — PHASE 5 INVESTMENT PLANNER + SIP ENGINE TEST SUITE
// Tests deterministic calculation engine, SIP compounding, readiness audit,
// capacity derivation, risk profiling, asset allocation, and Gemini fallbacks.
// ==========================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateSIPFutureValue,
  calculateInvestmentReadiness,
  calculateInvestmentCapacity,
  calculateRiskProfile,
  calculateAssetAllocation,
  calculatePortfolioAllocation,
  calculateAllocationComparison,
  generateProjectionScenarios,
  generateContributionComparisons,
} from './finance';
import {
  sanitizeGeminiInvestmentOutput,
  InvestmentPlanningAIContext,
} from '../services/geminiService';
import { InvestmentHolding } from '../types/finance';

describe('Phase 5 Investment Planner + SIP Engine', () => {
  // ------------------------------------------------------------------------
  // 1. SIP Future Value Compounding Annuity Formula
  // ------------------------------------------------------------------------
  describe('calculateSIPFutureValue', () => {
    it('accurately calculates compounding future value for standard SIP', () => {
      // P = ₹10,000, r = 12% p.a., n = 10 years (120 months)
      // Standard mathematical formula:
      // r_m = 0.01
      // (1.01)^120 ≈ 3.30038689
      // FV = 10000 * ((3.30038689 - 1) / 0.01) * 1.01 ≈ 23,23,391
      const res = calculateSIPFutureValue(10000, 12, 10);
      expect(res.totalInvested).toBe(1200000);
      expect(res.illustrativeFinalValue).toBeGreaterThan(2320000);
      expect(res.illustrativeFinalValue).toBeLessThan(2330000);
      expect(res.estimatedGrowth).toBe(res.illustrativeFinalValue - res.totalInvested);
      expect(res.wealthMultiplier).toBeGreaterThan(1.9);
    });

    it('safely handles 0% return rate (pure capital accumulation)', () => {
      // P = ₹15,000, r = 0%, n = 5 years
      const res = calculateSIPFutureValue(15000, 0, 5);
      expect(res.totalInvested).toBe(900000);
      expect(res.illustrativeFinalValue).toBe(900000);
      expect(res.estimatedGrowth).toBe(0);
      expect(res.wealthMultiplier).toBe(1);
    });

    it('handles negative or zero inputs gracefully without crashing', () => {
      const res1 = calculateSIPFutureValue(0, 12, 10);
      expect(res1.illustrativeFinalValue).toBe(0);
      expect(res1.totalInvested).toBe(0);

      const res2 = calculateSIPFutureValue(10000, 12, 0);
      expect(res2.illustrativeFinalValue).toBe(0);
      expect(res2.totalInvested).toBe(0);

      const res3 = calculateSIPFutureValue(-5000, 10, 5);
      expect(res3.illustrativeFinalValue).toBe(0);
    });

    it('handles large contribution and 30-year duration without precision overflow', () => {
      const res = calculateSIPFutureValue(100000, 14, 30);
      expect(res.totalInvested).toBe(36000000); // 3.6 Crore
      expect(res.illustrativeFinalValue).toBeGreaterThan(500000000); // Massive compound growth
      expect(res.wealthMultiplier).toBeGreaterThan(10);
    });
  });

  // ------------------------------------------------------------------------
  // 2. Investment Readiness Analysis
  // ------------------------------------------------------------------------
  describe('calculateInvestmentReadiness', () => {
    it('flags NOT READY when cash flow is running in deficit', () => {
      const readiness = calculateInvestmentReadiness({
        monthlyIncome: 50000,
        monthlyExpenses: 55000,
        monthlySurplus: -5000,
        essentialMonthlyExpenses: 35000,
        currentEmergencyFund: 70000,
        emergencyTargetMonths: 6,
        outstandingDebt: 0,
        creditCardDebt: 0,
        monthlyDebtPayment: 0,
        debtToIncomeRatio: 0,
      });

      expect(readiness.status).toBe('not_ready');
      expect(readiness.isDeficit).toBe(true);
      expect(readiness.reasons[0]).toContain('deficit');
    });

    it('flags BUILDING FOUNDATION when emergency runway is insufficient', () => {
      const readiness = calculateInvestmentReadiness({
        monthlyIncome: 80000,
        monthlyExpenses: 45000,
        monthlySurplus: 35000,
        essentialMonthlyExpenses: 30000,
        currentEmergencyFund: 15000, // only 0.5 months (target: 6)
        emergencyTargetMonths: 6,
        outstandingDebt: 0,
        creditCardDebt: 0,
        monthlyDebtPayment: 0,
        debtToIncomeRatio: 0,
      });

      expect(readiness.status).toBe('building_foundation');
      expect(readiness.emergencyFundCoverageMonths).toBe(0.5);
      expect(readiness.emergencyFundShortfall).toBe(165000);
      expect(readiness.reasons[0]).toContain('shortfall');
    });

    it('flags PARTIALLY READY when high-cost revolving debt is present', () => {
      const readiness = calculateInvestmentReadiness({
        monthlyIncome: 80000,
        monthlyExpenses: 45000,
        monthlySurplus: 35000,
        essentialMonthlyExpenses: 25000,
        currentEmergencyFund: 150000, // 6 months covered
        emergencyTargetMonths: 6,
        outstandingDebt: 60000,
        creditCardDebt: 45000, // High interest credit card debt!
        monthlyDebtPayment: 5000,
        debtToIncomeRatio: 6,
      });

      expect(readiness.status).toBe('partially_ready');
      expect(readiness.hasHighCostDebt).toBe(true);
      expect(readiness.title).toContain('DEBT BURDEN');
    });

    it('flags READY when surplus, emergency runway, and debt are all sound', () => {
      const readiness = calculateInvestmentReadiness({
        monthlyIncome: 100000,
        monthlyExpenses: 50000,
        monthlySurplus: 50000,
        essentialMonthlyExpenses: 30000,
        currentEmergencyFund: 180000, // full 6 months
        emergencyTargetMonths: 6,
        outstandingDebt: 0,
        creditCardDebt: 0,
        monthlyDebtPayment: 0,
        debtToIncomeRatio: 0,
      });

      expect(readiness.status).toBe('ready');
      expect(readiness.score).toBeGreaterThanOrEqual(90);
      expect(readiness.emergencyFundShortfall).toBe(0);
    });
  });

  // ------------------------------------------------------------------------
  // 3. Monthly Investment Capacity Derivation
  // ------------------------------------------------------------------------
  describe('calculateInvestmentCapacity', () => {
    it('accurately deducts active missions, emergency building, and safety buffer', () => {
      // Surplus: ₹35,000
      // Active Missions: ₹10,000
      // Shortfall: ₹1,20,000 (shortfall / 12 = ₹10,000)
      // Safety buffer: 20% of ₹35,000 = ₹7,000
      // Capacity = 35,000 - 10,000 - 10,000 - 7,000 = ₹8,000
      const cap = calculateInvestmentCapacity({
        monthlyIncome: 85000,
        monthlyExpenses: 50000,
        monthlySurplus: 35000,
        activeMissionsCommitment: 10000,
        emergencyFundShortfall: 120000,
        safetyBufferPercent: 20,
      });

      expect(cap.availableSurplus).toBe(35000);
      expect(cap.safetyBufferAmount).toBe(7000);
      expect(cap.activeMissionsCommitment).toBe(10000);
      expect(cap.emergencyFundAllocation).toBe(10000);
      expect(cap.potentialMonthlyCapacity).toBe(8000);
    });

    it('never invests 100% of surplus even if no missions or emergency needs exist', () => {
      const cap = calculateInvestmentCapacity({
        monthlyIncome: 100000,
        monthlyExpenses: 60000,
        monthlySurplus: 40000,
        activeMissionsCommitment: 0,
        emergencyFundShortfall: 0,
        safetyBufferPercent: 20,
      });

      // 40,000 - 0 - 0 - 8,000 (20%) = 32,000
      expect(cap.safetyBufferAmount).toBe(8000);
      expect(cap.potentialMonthlyCapacity).toBe(32000);
      expect(cap.potentialMonthlyCapacity).toBeLessThan(cap.availableSurplus);
    });

    it('clamps capacity to 0 when surplus is fully consumed by commitments', () => {
      const cap = calculateInvestmentCapacity({
        monthlyIncome: 50000,
        monthlyExpenses: 45000,
        monthlySurplus: 5000,
        activeMissionsCommitment: 6000,
        emergencyFundShortfall: 50000,
        safetyBufferPercent: 20,
      });

      expect(cap.potentialMonthlyCapacity).toBe(0);
    });
  });

  // ------------------------------------------------------------------------
  // 4. Risk Profile Scoring
  // ------------------------------------------------------------------------
  describe('calculateRiskProfile', () => {
    it('classifies conservative profile for short horizon and low drawdown tolerance', () => {
      const res = calculateRiskProfile({
        horizon: 'short',
        riskReaction: 'sell_all',
        experience: 'beginner',
        liquidityPreference: 'immediate',
        investmentGoal: 'home',
      });

      expect(res.riskProfile).toBe('conservative');
      expect(res.score).toBeLessThanOrEqual(7);
      expect(res.factors.length).toBeGreaterThanOrEqual(4);
    });

    it('classifies aggressive profile for 10+ year horizon and opportunistic buying mindset', () => {
      const res = calculateRiskProfile({
        horizon: 'very_long',
        riskReaction: 'buy_more',
        experience: 'experienced',
        liquidityPreference: 'locked',
        investmentGoal: 'wealth',
      });

      expect(res.riskProfile).toBe('aggressive');
      expect(res.score).toBeGreaterThanOrEqual(12);
    });

    it('classifies moderate profile for balanced parameters', () => {
      const res = calculateRiskProfile({
        horizon: 'long',
        riskReaction: 'hold',
        experience: 'some_experience',
        liquidityPreference: 'flexible',
        investmentGoal: 'retirement',
      });

      expect(res.riskProfile).toBe('moderate');
      expect(res.score).toBeGreaterThanOrEqual(8);
      expect(res.score).toBeLessThanOrEqual(11);
    });
  });

  // ------------------------------------------------------------------------
  // 5. Illustrative Asset Allocation Model
  // ------------------------------------------------------------------------
  describe('calculateAssetAllocation', () => {
    it('produces an allocation where percentage sum is 100% and amounts match capacity', () => {
      const capacity = 15000;
      const plan = calculateAssetAllocation(capacity, 'moderate', 'long', 'ready');

      const totalPct = plan.items.reduce((s, i) => s + i.percentage, 0);
      const totalAmt = plan.items.reduce((s, i) => s + i.monthlyAmount, 0);

      expect(totalPct).toBe(100);
      expect(totalAmt).toBe(capacity);
      expect(plan.items.length).toBe(4);
      expect(plan.explanation).toContain('balanced');
    });

    it('allocates high debt and reserve when horizon is short', () => {
      const plan = calculateAssetAllocation(10000, 'aggressive', 'short', 'ready');
      const debtItem = plan.items.find((i) => i.categoryKey === 'debt');
      const equityItem = plan.items.find((i) => i.categoryKey === 'equity');

      expect(debtItem?.percentage).toBeGreaterThan(50);
      expect(equityItem?.percentage).toBeLessThanOrEqual(20);
    });

    it('allocates high growth equity for very long aggressive profiles', () => {
      const plan = calculateAssetAllocation(20000, 'aggressive', 'very_long', 'ready');
      const equityItem = plan.items.find((i) => i.categoryKey === 'equity');

      expect(equityItem?.percentage).toBe(80);
      expect(equityItem?.monthlyAmount).toBe(16000);
    });
  });

  // ------------------------------------------------------------------------
  // 6. Portfolio Tracking & Allocation Comparison
  // ------------------------------------------------------------------------
  describe('calculatePortfolioAllocation & calculateAllocationComparison', () => {
    const mockHoldings: InvestmentHolding[] = [
      {
        id: 'h1',
        name: 'Nifty 50 Index Fund',
        category: 'index_funds',
        investedAmount: 100000,
        currentValue: 120000,
        purchaseDate: '2025-01-01',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'h2',
        name: 'Fixed Deposit',
        category: 'fixed_deposits',
        investedAmount: 50000,
        currentValue: 53000,
        purchaseDate: '2025-01-01',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'h3',
        name: 'Sovereign Gold Bond',
        category: 'gold',
        investedAmount: 25000,
        currentValue: 27000,
        purchaseDate: '2025-01-01',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ];

    it('correctly aggregates invested capital, current value, and unrealized gains', () => {
      const summary = calculatePortfolioAllocation(mockHoldings);

      expect(summary.totalInvested).toBe(175000);
      expect(summary.currentValue).toBe(200000);
      expect(summary.unrealizedGain).toBe(25000);
      expect(summary.gainPercentage).toBe(14.3);
      expect(summary.holdingsCount).toBe(3);
    });

    it('compares actual portfolio weights against model allocation', () => {
      const plan = calculateAssetAllocation(10000, 'moderate', 'long', 'ready');
      const comparison = calculateAllocationComparison(mockHoldings, plan);

      expect(comparison.length).toBe(4);
      const equityRow = comparison.find((r) => r.category.includes('Equity'));
      // Equity actual is 120000 / 200000 = 60%
      expect(equityRow?.currentPct).toBe(60);
      expect(equityRow?.targetPct).toBe(60);
      expect(equityRow?.variancePct).toBe(0);
    });
  });

  // ------------------------------------------------------------------------
  // 7. Scenario Comparison & Contribution Scale
  // ------------------------------------------------------------------------
  describe('generateProjectionScenarios & generateContributionComparisons', () => {
    it('generates 3 distinct return scenarios with increasing values', () => {
      const scs = generateProjectionScenarios(10000, 10);
      expect(scs.length).toBe(3);

      const [cons, bal, growth] = scs;
      expect(cons.annualRatePct).toBe(8);
      expect(bal.annualRatePct).toBe(11);
      expect(growth.annualRatePct).toBe(14);

      expect(growth.projectedValue).toBeGreaterThan(bal.projectedValue);
      expect(bal.projectedValue).toBeGreaterThan(cons.projectedValue);
    });

    it('generates scaled contribution steps comparing long-term effects', () => {
      const steps = generateContributionComparisons(10, 11);
      expect(steps.length).toBe(6);
      expect(steps[0].monthlyAmount).toBe(5000);
      expect(steps[steps.length - 1].monthlyAmount).toBe(30000);
      expect(steps[steps.length - 1].projectedValue).toBeGreaterThan(steps[0].projectedValue * 5);
    });
  });

  // ------------------------------------------------------------------------
  // 8. Gemini Investment Explanation & Sanitization
  // ------------------------------------------------------------------------
  describe('sanitizeGeminiInvestmentOutput', () => {
    const fallbackContext: InvestmentPlanningAIContext = {
      currency: 'INR',
      monthly_income: 80000,
      monthly_expenses: 50000,
      monthly_surplus: 30000,
      readiness_status: 'ready',
      readiness_reasons: ['Cash flow is positive.'],
      essential_monthly_expenses: 30000,
      current_emergency_fund: 180000,
      emergency_fund_coverage_months: 6,
      emergency_fund_target_months: 6,
      debt_to_income_ratio: 0,
      has_high_cost_debt: false,
      risk_profile: 'moderate',
      investment_horizon: 'long',
      monthly_investment_capacity: 15000,
      active_savings_missions_commitment: 5000,
      recommended_allocation: [
        { category: 'Equity', amount: 9000, percentage: 60 },
        { category: 'Debt', amount: 3750, percentage: 25 },
        { category: 'Gold', amount: 1500, percentage: 10 },
        { category: 'Reserve', amount: 750, percentage: 5 },
      ],
    };

    it('strips markdown code fences and returns clean structured output', () => {
      const raw = `\`\`\`json
{
  "summary": "Your plan allocates ₹15,000 monthly across a balanced 60/25/10/5 framework.",
  "readiness": "ready",
  "risk_profile": "moderate",
  "key_reasons": ["Sound emergency reserves."],
  "allocation_explanation": ["Long-term equity beats inflation."],
  "risks": ["Short-term market drawdowns."],
  "assumptions": ["Assumes regular contributions."],
  "next_steps": ["Automate monthly SIPs."],
  "tradeoff_analysis": "Reserves ₹5,000 for MacBook goal."
}
\`\`\``;

      const res = sanitizeGeminiInvestmentOutput(raw, fallbackContext);
      expect(res.summary).toContain('Your plan allocates ₹15,000');
      expect(res.readiness).toBe('ready');
      expect(res.tradeoff_analysis).toContain('MacBook');
    });

    it('falls back gracefully on malformed or empty output without throwing', () => {
      const res = sanitizeGeminiInvestmentOutput('Not JSON text from AI', fallbackContext);
      expect(res.summary).toContain('15,000');
      expect(res.readiness).toBe('ready');
      expect(res.risks[0]).toContain('not guaranteed');
    });
  });
});
