import { describe, it, expect } from 'vitest';
import {
  calculateAffordability,
  calculateGoalPriorityScore,
  calculateScenarioImpact,
  calculateSavingsVsInvestmentGuidance,
  calculateMonthlyFinancialReview,
} from './advisorFinance';
import { SavingsMission, FinancialSnapshot, Transaction, Budget, InvestmentReadinessEvaluation, InvestmentCapacityBreakdown } from '../types/finance';

describe('Phase 6 — Advisor Deterministic Finance Engine', () => {
  describe('calculateAffordability', () => {
    it('evaluates comfortable one-time purchase within immediate discretionary buffer', () => {
      const res = calculateAffordability({
        purchaseAmount: 5000,
        monthlyIncome: 80000,
        monthlyExpenses: 45000,
        monthlySurplus: 35000,
        activeMissionRequirement: 10000,
        investmentCapacity: 12000,
        safetyBuffer: 5000,
      });

      // surplus: 35000 - committed (22000) - safety (5000) = 8000 discretionary capacity
      // 5000 <= 8000 => COMFORTABLE
      expect(res.affordabilityStatus).toBe('COMFORTABLE');
      expect(res.shortfall).toBe(0);
      expect(res.remainingCapacity).toBe(3000);
      expect(res.impactOnGoalCompletion).toContain('absorbed from this month');
    });

    it('evaluates manageable one-time purchase achievable over 2-3 months', () => {
      const res = calculateAffordability({
        purchaseAmount: 20000,
        monthlyIncome: 80000,
        monthlyExpenses: 45000,
        monthlySurplus: 35000,
        activeMissionRequirement: 10000,
        investmentCapacity: 12000,
        safetyBuffer: 5000,
      });

      // discretionary capacity = 8000; 20000 <= 8000 * 3 => MANAGEABLE
      expect(res.affordabilityStatus).toBe('MANAGEABLE');
      expect(res.shortfall).toBe(0);
      expect(res.impactOnGoalCompletion).toContain('accumulated in ~3 months');
    });

    it('evaluates tight purchase when exceeding unallocated capacity but within surplus', () => {
      const res = calculateAffordability({
        purchaseAmount: 30000,
        monthlyIncome: 80000,
        monthlyExpenses: 45000,
        monthlySurplus: 35000,
        activeMissionRequirement: 10000,
        investmentCapacity: 12000,
        safetyBuffer: 5000,
      });

      // uncommitted: 13000; 30000 <= 13000 * 3 => TIGHT
      expect(res.affordabilityStatus).toBe('TIGHT');
      expect(res.shortfall).toBe(22000); // 30000 - 8000
      expect(res.impactOnGoalCompletion).toContain('reducing emergency safety buffers');
    });

    it('flags NOT_RECOMMENDED when in cash flow deficit or purchase is too large', () => {
      const res = calculateAffordability({
        purchaseAmount: 20000,
        monthlyIncome: 50000,
        monthlyExpenses: 55000,
        monthlySurplus: -5000,
        activeMissionRequirement: 5000,
        investmentCapacity: 0,
      });

      expect(res.affordabilityStatus).toBe('NOT_RECOMMENDED');
      expect(res.impactOnGoalCompletion).toContain('deficit');
    });

    it('evaluates recurring monthly cost commitments like rent increase', () => {
      const res = calculateAffordability({
        purchaseAmount: 0,
        recurringMonthlyCost: 5000,
        monthlyIncome: 90000,
        monthlyExpenses: 50000,
        monthlySurplus: 40000,
        activeMissionRequirement: 15000,
        investmentCapacity: 12000,
        safetyBuffer: 5000,
      });

      // committed: 27000, uncommitted: 13000, discretionary: 8000
      // 5000 <= 8000 => MANAGEABLE
      expect(res.affordabilityStatus).toBe('MANAGEABLE');
      expect(res.shortfall).toBe(0);
      expect(res.remainingCapacity).toBe(3000);
    });
  });

  describe('calculateGoalPriorityScore', () => {
    const mockMissions: SavingsMission[] = [
      {
        id: 'm-1',
        missionCode: 'MISSION 0001',
        name: 'Emergency Fund Foundation',
        category: 'Emergency Fund',
        targetAmount: 200000,
        initialAmount: 50000,
        currentAmount: 80000,
        targetDate: '2026-11-01',
        isAsap: false,
        monthlyContribution: 20000,
        priority: 'high',
        status: 'on_track',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 'm-2',
        missionCode: 'MISSION 0002',
        name: 'New Gaming Rig',
        category: 'Technology',
        targetAmount: 100000,
        initialAmount: 20000,
        currentAmount: 30000,
        targetDate: '2027-06-01',
        isAsap: false,
        monthlyContribution: 8000,
        priority: 'low',
        status: 'on_track',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 'm-3',
        missionCode: 'MISSION 0003',
        name: 'Motorcycle Down Payment',
        category: 'Vehicle',
        targetAmount: 60000,
        initialAmount: 40000,
        currentAmount: 52000, // 86% complete!
        targetDate: '2026-10-15',
        isAsap: false,
        monthlyContribution: 8000,
        priority: 'medium',
        status: 'tight',
        isArchived: false,
        createdAt: '2026-08-01',
        updatedAt: '2026-09-01',
      },
    ];

    it('ranks Emergency Fund as top priority when emergency runway is low', () => {
      const ranked = calculateGoalPriorityScore(mockMissions, 25000, 1.8);
      expect(ranked.length).toBe(3);
      expect(ranked[0].mission.id).toBe('m-1');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[0].priorityScore).toBeGreaterThan(60);
      expect(ranked[0].rationale).toContain('Vital liquidity shield');
    });

    it('boosts missions near completion for quick wins and clearing cognitive load', () => {
      const ranked = calculateGoalPriorityScore(mockMissions, 25000, 6.0);
      const motorcycle = ranked.find((r) => r.mission.id === 'm-3');
      expect(motorcycle).toBeDefined();
      expect(motorcycle?.rationale).toContain('Close to completion');
    });
  });

  describe('calculateScenarioImpact', () => {
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
      emergencyFundMonths: 3.5,
    };

    it('accurately calculates income increase scenario (+₹10,000)', () => {
      const res = calculateScenarioImpact('income_change', 10000, mockSnapshot, 12000);
      expect(res.newSurplus).toBe(40000);
      expect(res.surplusDelta).toBe(10000);
      expect(res.newSavingsRate).toBe(44); // 40000 / 90000 = ~44%
      expect(res.impactSummary).toContain('expands from ₹30,000 to ₹40,000');
    });

    it('accurately calculates expense increase scenario (+₹5,000 rent hike)', () => {
      const res = calculateScenarioImpact('expense_change', 5000, mockSnapshot, 12000);
      expect(res.newSurplus).toBe(25000);
      expect(res.surplusDelta).toBe(-5000);
      expect(res.impactSummary).toContain('shrinking surplus to ₹25,000');
    });

    it('accurately calculates pausing investments for 3 months', () => {
      const res = calculateScenarioImpact('pause_investing', 3, mockSnapshot, 12000);
      expect(res.impactSummary).toContain('frees ₹12,000/mo (₹36,000 total)');
      expect(res.tradeoffs[1]).toContain('Sacrifices 3 months');
    });
  });

  describe('calculateSavingsVsInvestmentGuidance', () => {
    it('recommends debt payoff first when high-cost debt is present', () => {
      const res = calculateSavingsVsInvestmentGuidance(25000, 4.0, true, 5000, 10000, 'ready');
      expect(res.primaryRecommendation).toBe('PAY_OFF_HIGH_COST_DEBT');
      expect(res.recommendedSplit.savingsPct).toBe(80);
      expect(res.headline).toContain('Clear High-Cost Debt');
    });

    it('recommends building emergency reserve when runway is under 3 months', () => {
      const res = calculateSavingsVsInvestmentGuidance(25000, 1.5, false, 5000, 10000, 'ready');
      expect(res.primaryRecommendation).toBe('BUILD_EMERGENCY_RESERVE');
      expect(res.recommendedSplit.savingsPct).toBe(75);
      expect(res.headline).toContain('Prioritize Emergency Reserve Foundation');
    });

    it('recommends balanced hybrid when runway is 3-6 months and active missions exist', () => {
      const res = calculateSavingsVsInvestmentGuidance(25000, 4.2, false, 10000, 10000, 'ready');
      expect(res.primaryRecommendation).toBe('SPLIT_BALANCED');
      expect(res.recommendedSplit.investmentPct).toBe(60);
      expect(res.headline).toContain('Balanced Hybrid');
    });

    it('recommends maximizing investments when fortress reserve (6+ months) is secured', () => {
      const res = calculateSavingsVsInvestmentGuidance(30000, 7.5, false, 0, 15000, 'ready');
      expect(res.primaryRecommendation).toBe('MAXIMIZE_INVESTMENTS');
      expect(res.recommendedSplit.investmentPct).toBe(80);
      expect(res.headline).toContain('Deploy Capital into Long-Term');
    });
  });

  describe('calculateMonthlyFinancialReview', () => {
    const mockSnapshot: FinancialSnapshot = {
      totalIncome: 85000,
      totalExpenses: 52000,
      fixedExpenses: 35000,
      variableExpenses: 17000,
      monthlySurplus: 33000,
      isDeficit: false,
      savingsRate: 39,
      investmentRate: 14,
      debtToIncomeRatio: 0,
      expenseRatio: 61,
      emergencyFundMonths: 4.5,
    };

    const mockTransactions: Transaction[] = [
      {
        id: 't-1',
        type: 'income',
        amount: 85000,
        category: 'Salary',
        date: '2026-09-01',
        description: 'Monthly Salary',
        recurring: true,
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 't-2',
        type: 'expense',
        amount: 25000,
        category: 'Housing',
        date: '2026-09-02',
        description: 'Rent',
        recurring: true,
        createdAt: '2026-09-02',
        updatedAt: '2026-09-02',
      },
      {
        id: 't-3',
        type: 'expense',
        amount: 14000,
        category: 'Food',
        date: '2026-09-05',
        description: 'Groceries',
        recurring: false,
        createdAt: '2026-09-05',
        updatedAt: '2026-09-05',
      },
      {
        id: 't-4',
        type: 'expense',
        amount: 8000,
        category: 'Shopping',
        date: '2026-09-10',
        description: 'Clothes',
        recurring: false,
        createdAt: '2026-09-10',
        updatedAt: '2026-09-10',
      },
    ];

    const mockBudgets: Budget[] = [
      { id: 'b-1', category: 'Housing', monthlyLimit: 25000, createdAt: '', updatedAt: '' },
      { id: 'b-2', category: 'Food', monthlyLimit: 10000, createdAt: '', updatedAt: '' }, // overbudget! (14000 vs 10000)
    ];

    const mockReadiness: InvestmentReadinessEvaluation = {
      status: 'ready',
      score: 85,
      title: 'Ready',
      summary: 'Solid foundation',
      reasons: [],
      essentialMonthlyExpenses: 35000,
      currentEmergencyFund: 150000,
      emergencyFundCoverageMonths: 4.3,
      emergencyFundTargetMonths: 6,
      emergencyFundShortfall: 60000,
      outstandingDebt: 0,
      monthlyDebtPayment: 0,
      debtToIncomeRatio: 0,
      hasHighCostDebt: false,
      monthlySurplus: 33000,
      isDeficit: false,
    };

    const mockCapacity: InvestmentCapacityBreakdown = {
      monthlyIncome: 85000,
      monthlyExpenses: 52000,
      availableSurplus: 33000,
      activeMissionsCommitment: 10000,
      emergencyFundAllocation: 5000,
      safetyBufferAmount: 6000,
      safetyBufferPercent: 20,
      potentialMonthlyCapacity: 12000,
      isConstrained: false,
      constraintReasons: [],
    };

    it('aggregates income, expenses, overbudget categories, and recommended focus', () => {
      const review = calculateMonthlyFinancialReview(
        '2026-09',
        mockSnapshot,
        mockTransactions,
        mockBudgets,
        [],
        mockReadiness,
        mockCapacity
      );

      expect(review.income).toBe(85000);
      expect(review.expenses).toBe(47000);
      expect(review.netCashFlow).toBe(38000);
      expect(review.topSpendingCategories[0].category).toBe('Housing');
      expect(review.budgetPerformance.overbudgetCategories).toContain('Food');
      expect(review.recommendedFocus).toContain('Food');
    });
  });
});
