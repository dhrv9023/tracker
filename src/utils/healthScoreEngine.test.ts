import { describe, it, expect } from 'vitest';
import { calculateTransparentHealthScore } from './healthScoreEngine';

describe('Phase 7 — Transparent Financial Health Score Engine', () => {
  it('awards elite score (>=85) for fortress finances with high savings, zero debt, and 6+ mo runway', () => {
    const res = calculateTransparentHealthScore({
      totalIncome: 100000,
      totalExpenses: 55000,
      monthlySurplus: 45000,
      savingsRate: 45,
      emergencyFundMonths: 7.2,
      monthlyDebt: 0,
      hasHighCostDebt: false,
      totalBudgetsCount: 5,
      budgetOverrunCount: 0,
      activeMissionsCount: 2,
      atRiskMissionsCount: 0,
      hasMissionConflict: false,
    });

    expect(res.totalScore).toBeGreaterThanOrEqual(85);
    expect(res.tier).toBe('Elite');
    expect(res.factors.length).toBe(5);
    // All factors maxed out or close to 20
    expect(res.factors[0].score).toBe(20); // Cash flow
    expect(res.factors[1].score).toBe(20); // Savings
    expect(res.factors[2].score).toBe(20); // Emergency
    expect(res.factors[3].score).toBe(20); // Debt
    expect(res.factors[4].score).toBe(20); // Discipline
  });

  it('accurately penalizes negative cash flow deficit and high-cost debt', () => {
    const res = calculateTransparentHealthScore({
      totalIncome: 60000,
      totalExpenses: 70000,
      monthlySurplus: -10000,
      savingsRate: 0,
      emergencyFundMonths: 0.8,
      monthlyDebt: 15000,
      hasHighCostDebt: true,
      totalBudgetsCount: 4,
      budgetOverrunCount: 2,
      activeMissionsCount: 1,
      atRiskMissionsCount: 1,
      hasMissionConflict: true,
    });

    expect(res.totalScore).toBeLessThan(40);
    expect(res.tier).toMatch(/Critical|Vulnerable/);
    expect(res.factors[0].score).toBe(0); // Deficit
    expect(res.factors[1].score).toBe(0); // 0% savings
    expect(res.factors[3].score).toBe(4); // High cost debt
  });

  it('breaks down each factor with maxScore of 20 and distinct details', () => {
    const res = calculateTransparentHealthScore({
      totalIncome: 80000,
      totalExpenses: 52000,
      monthlySurplus: 28000,
      savingsRate: 35,
      emergencyFundMonths: 4.0,
      monthlyDebt: 8000,
      hasHighCostDebt: false,
      totalBudgetsCount: 5,
      budgetOverrunCount: 1,
      activeMissionsCount: 2,
      atRiskMissionsCount: 0,
      hasMissionConflict: false,
    });

    res.factors.forEach((f) => {
      expect(f.maxScore).toBe(20);
      expect(f.details.length).toBeGreaterThan(0);
      expect(f.score).toBeGreaterThanOrEqual(0);
      expect(f.score).toBeLessThanOrEqual(20);
    });
  });
});
