import { describe, it, expect } from 'vitest';
import {
  evaluateDataSufficiency,
  safePercentageChange,
  generateCashFlowInsights,
  generateSpendingInsights,
  generateBudgetInsights,
  generateMissionInsights,
  generateEmergencyFundInsights,
  generateDebtInsights,
  generateInvestmentInsights,
  generateAllInsights,
  generateMonthlyReviewReport,
} from './insightsEngine';
import {
  Transaction,
  Budget,
  SavingsMission,
  FinancialSnapshot,
  InvestmentReadinessEvaluation,
  InvestmentCapacityBreakdown,
  PortfolioAllocationSummary,
} from '../types/finance';

const createTestTx = (partial: Partial<Transaction> & { id: string; date: string; amount: number; type: 'income' | 'expense' }): Transaction => ({
  category: 'Other',
  description: 'Test Tx',
  recurring: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...partial,
});

const createTestBudget = (partial: Partial<Budget> & { id: string; category: string; monthlyLimit: number }): Budget => ({
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...partial,
});

const createTestMission = (partial: Partial<SavingsMission> & { id: string; name: string; targetAmount: number }): SavingsMission => ({
  missionCode: 'MISSION 0001',
  category: 'General',
  initialAmount: 0,
  currentAmount: 0,
  targetDate: '2027-01-01',
  isAsap: false,
  monthlyContribution: 5000,
  priority: 'high',
  status: 'on_track',
  isArchived: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...partial,
});

const createTestSnapshot = (partial: Partial<FinancialSnapshot> = {}): FinancialSnapshot => ({
  totalIncome: 100000,
  totalExpenses: 60000,
  fixedExpenses: 35000,
  variableExpenses: 25000,
  monthlySurplus: 40000,
  savingsRate: 40,
  investmentRate: 15,
  debtToIncomeRatio: 0,
  expenseRatio: 60,
  emergencyFundMonths: 6,
  isDeficit: false,
  ...partial,
});

const createTestReadiness = (partial: Partial<InvestmentReadinessEvaluation> = {}): InvestmentReadinessEvaluation => ({
  status: 'ready',
  score: 85,
  title: 'Ready',
  summary: 'Solid readiness',
  reasons: [],
  essentialMonthlyExpenses: 35000,
  currentEmergencyFund: 210000,
  emergencyFundCoverageMonths: 6,
  emergencyFundTargetMonths: 6,
  emergencyFundShortfall: 0,
  outstandingDebt: 0,
  monthlyDebtPayment: 0,
  debtToIncomeRatio: 0,
  hasHighCostDebt: false,
  monthlySurplus: 40000,
  isDeficit: false,
  ...partial,
});

const createTestCapacity = (partial: Partial<InvestmentCapacityBreakdown> = {}): InvestmentCapacityBreakdown => ({
  monthlyIncome: 100000,
  monthlyExpenses: 60000,
  availableSurplus: 40000,
  activeMissionsCommitment: 10000,
  emergencyFundAllocation: 0,
  safetyBufferPercent: 20,
  safetyBufferAmount: 5000,
  potentialMonthlyCapacity: 25000,
  isConstrained: false,
  constraintReasons: [],
  ...partial,
});

const createTestPortfolio = (partial: Partial<PortfolioAllocationSummary> = {}): PortfolioAllocationSummary => ({
  totalInvested: 100000,
  currentValue: 108000,
  unrealizedGain: 8000,
  gainPercentage: 8,
  holdingsCount: 2,
  categoryBreakdown: [],
  ...partial,
});

describe('insightsEngine - Data Sufficiency', () => {
  it('identifies 0 recorded months', () => {
    const res = evaluateDataSufficiency([]);
    expect(res.totalRecordedMonths).toBe(0);
    expect(res.hasMoMComparison).toBe(false);
    expect(res.hasTrendAnalysis).toBe(false);
    expect(res.explanation).toContain('No transaction telemetry');
  });

  it('identifies exactly 1 recorded month and disables MoM comparisons', () => {
    const txs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-01', amount: 5000, category: 'Food', type: 'expense' }),
      createTestTx({ id: '2', date: '2026-09-05', amount: 75000, category: 'Salary', type: 'income' }),
    ];
    const res = evaluateDataSufficiency(txs);
    expect(res.totalRecordedMonths).toBe(1);
    expect(res.availableMonths).toEqual(['2026-09']);
    expect(res.hasMoMComparison).toBe(false);
    expect(res.hasTrendAnalysis).toBe(false);
    expect(res.explanation).toContain('1 month recorded');
  });

  it('identifies 2 recorded months and activates MoM comparison', () => {
    const txs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-01', amount: 5000, category: 'Food', type: 'expense' }),
      createTestTx({ id: '2', date: '2026-08-15', amount: 4000, category: 'Food', type: 'expense' }),
    ];
    const res = evaluateDataSufficiency(txs);
    expect(res.totalRecordedMonths).toBe(2);
    expect(res.hasMoMComparison).toBe(true);
    expect(res.hasTrendAnalysis).toBe(false);
  });

  it('identifies 3+ recorded months and activates trend analysis', () => {
    const txs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-01', amount: 5000, category: 'Food', type: 'expense' }),
      createTestTx({ id: '2', date: '2026-08-15', amount: 4000, category: 'Food', type: 'expense' }),
      createTestTx({ id: '3', date: '2026-07-20', amount: 4500, category: 'Food', type: 'expense' }),
    ];
    const res = evaluateDataSufficiency(txs);
    expect(res.totalRecordedMonths).toBe(3);
    expect(res.hasMoMComparison).toBe(true);
    expect(res.hasTrendAnalysis).toBe(true);
  });
});

describe('insightsEngine - safePercentageChange', () => {
  it('safely handles previous = 0 without NaN or Infinity', () => {
    expect(safePercentageChange(100, 0)).toBe(100);
    expect(safePercentageChange(-50, 0)).toBe(-100);
    expect(safePercentageChange(0, 0)).toBe(0);
  });

  it('calculates standard deltas correctly', () => {
    expect(safePercentageChange(120, 100)).toBe(20);
    expect(safePercentageChange(80, 100)).toBe(-20);
    expect(safePercentageChange(50, 200)).toBe(-75);
  });
});

describe('insightsEngine - Cash Flow Insights', () => {
  it('flags operating cash flow deficit as CRITICAL', () => {
    const current = createTestSnapshot({
      totalIncome: 50000,
      totalExpenses: 55000,
      monthlySurplus: -5000,
      isDeficit: true,
      savingsRate: 0,
    });
    const sufficiency = evaluateDataSufficiency([]);
    const insights = generateCashFlowInsights(current, null, '2026-09', sufficiency);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].category).toBe('CASH_FLOW');
    expect(insights[0].severity).toBe('CRITICAL');
    expect(insights[0].title).toContain('Deficit');
  });

  it('detects surplus expansion when MoM is enabled', () => {
    const current = createTestSnapshot({
      totalIncome: 100000,
      totalExpenses: 60000,
      monthlySurplus: 40000,
      savingsRate: 40,
    });
    const prev = createTestSnapshot({
      totalIncome: 90000,
      totalExpenses: 60000,
      monthlySurplus: 30000,
      savingsRate: 33,
    });
    const sufficiency = {
      totalRecordedMonths: 2,
      availableMonths: ['2026-09', '2026-08'],
      hasMoMComparison: true,
      hasTrendAnalysis: false,
      explanation: '',
    };
    const insights = generateCashFlowInsights(current, prev, '2026-09', sufficiency);
    const expanded = insights.find((i) => i.id.includes('SURPLUS_EXPANDED'));
    expect(expanded).toBeDefined();
    expect(expanded?.metric).toBe('+₹10,000');
  });
});

describe('insightsEngine - Spending & Anomaly Insights', () => {
  it('detects high spending concentration in single category', () => {
    const sufficiency = {
      totalRecordedMonths: 1,
      availableMonths: ['2026-09'],
      hasMoMComparison: false,
      hasTrendAnalysis: false,
      explanation: '',
    };
    const txs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-02', amount: 20000, category: 'Dining Out', type: 'expense' }),
      createTestTx({ id: '2', date: '2026-09-10', amount: 10000, category: 'Groceries', type: 'expense' }),
    ];
    const insights = generateSpendingInsights(txs, txs, '2026-09', sufficiency);
    const concentration = insights.find((i) => i.id.includes('SPENDING:CONCENTRATION'));
    expect(concentration).toBeDefined();
    expect(concentration?.title).toContain('Dining Out');
  });

  it('detects spending anomaly when >= 3 months history exists', () => {
    const sufficiency = {
      totalRecordedMonths: 3,
      availableMonths: ['2026-09', '2026-08', '2026-07'],
      hasMoMComparison: true,
      hasTrendAnalysis: true,
      explanation: '',
    };
    const allTxs: Transaction[] = [
      // Current month: Shopping = ₹12,000
      createTestTx({ id: '1', date: '2026-09-05', amount: 12000, category: 'Shopping', type: 'expense' }),
      // Aug: Shopping = ₹3,000
      createTestTx({ id: '2', date: '2026-08-05', amount: 3000, category: 'Shopping', type: 'expense' }),
      // Jul: Shopping = ₹3,000
      createTestTx({ id: '3', date: '2026-07-05', amount: 3000, category: 'Shopping', type: 'expense' }),
    ];
    const currentMonthTxs = allTxs.filter((t) => t.date.startsWith('2026-09'));
    const insights = generateSpendingInsights(currentMonthTxs, allTxs, '2026-09', sufficiency);
    const anomaly = insights.find((i) => i.id.includes('SPENDING:ANOMALY:2026-09:Shopping'));
    expect(anomaly).toBeDefined();
    expect(anomaly?.title).toContain('Spending Anomaly Detected in Shopping');
  });
});

describe('insightsEngine - Budget Insights & Repeated Overspending', () => {
  const budgets: Budget[] = [
    createTestBudget({ id: 'b1', category: 'Dining', monthlyLimit: 5000 }),
  ];

  it('flags single month budget overrun', () => {
    const sufficiency = {
      totalRecordedMonths: 1,
      availableMonths: ['2026-09'],
      hasMoMComparison: false,
      hasTrendAnalysis: false,
      explanation: '',
    };
    const currentTxs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-10', amount: 6500, category: 'Dining', type: 'expense' }),
    ];
    const insights = generateBudgetInsights(budgets, currentTxs, currentTxs, '2026-09', sufficiency);
    const overrun = insights.find((i) => i.id.includes('BUDGET:OVERRUN:2026-09:Dining'));
    expect(overrun).toBeDefined();
    expect(overrun?.severity).toBe('WARNING');
  });

  it('flags repeated budget overspending across consecutive months', () => {
    const sufficiency = {
      totalRecordedMonths: 2,
      availableMonths: ['2026-09', '2026-08'],
      hasMoMComparison: true,
      hasTrendAnalysis: false,
      explanation: '',
    };
    const allTxs: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-10', amount: 6500, category: 'Dining', type: 'expense' }),
      createTestTx({ id: '2', date: '2026-08-10', amount: 6200, category: 'Dining', type: 'expense' }),
    ];
    const currentTxs = allTxs.filter((t) => t.date.startsWith('2026-09'));
    const insights = generateBudgetInsights(budgets, currentTxs, allTxs, '2026-09', sufficiency);
    const repeated = insights.find((i) => i.id.includes('BUDGET:REPEATED_OVERRUN:2026-09:Dining'));
    expect(repeated).toBeDefined();
    expect(repeated?.severity).toBe('WARNING');
    expect(repeated?.evidence).toContain('multiple consecutive recorded months');
  });
});

describe('insightsEngine - Mission Insights & Allocation Conflict', () => {
  it('detects mission allocation conflict when committed savings exceed surplus', () => {
    const missions: SavingsMission[] = [
      createTestMission({
        id: 'm1',
        name: 'Emergency Booster',
        targetAmount: 100000,
        currentAmount: 20000,
        monthlyContribution: 20000,
        priority: 'high',
      }),
      createTestMission({
        id: 'm2',
        name: 'MacBook Pro',
        targetAmount: 150000,
        currentAmount: 30000,
        monthlyContribution: 15000,
        priority: 'high',
      }),
    ];

    // Monthly surplus is only 25,000, but missions demand 35,000 (conflict!)
    const insights = generateMissionInsights(missions, 25000, '2026-09');
    const conflict = insights.find((i) => i.id.includes('MISSIONS:ALLOCATION_CONFLICT'));
    expect(conflict).toBeDefined();
    expect(conflict?.severity).toBe('WARNING');
    expect(conflict?.title).toBe('Mission Capital Allocation Conflict');
    expect(conflict?.evidence).toContain('₹35,000');
  });
});

describe('insightsEngine - generateAllInsights', () => {
  it('deduplicates, sorts by priorityScore, and filters dismissed insights', () => {
    const snapshot = createTestSnapshot();
    const readiness = createTestReadiness();
    const capacity = createTestCapacity();

    const all = generateAllInsights({
      snapshot,
      previousSnapshot: null,
      transactions: [],
      budgets: [],
      missions: [],
      totalDebt: 0,
      hasHighCostDebt: false,
      investmentReadiness: readiness,
      investmentCapacity: capacity,
      selectedMonth: '2026-09',
      dismissedIds: [],
    });

    expect(all.length).toBeGreaterThan(0);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].priorityScore).toBeGreaterThanOrEqual(all[i].priorityScore);
    }

    const firstId = all[0].id;
    const filtered = generateAllInsights({
      snapshot,
      previousSnapshot: null,
      transactions: [],
      budgets: [],
      missions: [],
      totalDebt: 0,
      hasHighCostDebt: false,
      investmentReadiness: readiness,
      investmentCapacity: capacity,
      selectedMonth: '2026-09',
      dismissedIds: [firstId],
    });

    expect(filtered.some((i) => i.id === firstId)).toBe(false);
  });
});

describe('insightsEngine - generateMonthlyReviewReport', () => {
  const snapshot = createTestSnapshot({
    totalIncome: 80000,
    totalExpenses: 50000,
    monthlySurplus: 30000,
    savingsRate: 38,
  });
  const readiness = createTestReadiness();
  const capacity = createTestCapacity({
    availableSurplus: 30000,
    activeMissionsCommitment: 10000,
    potentialMonthlyCapacity: 15000,
  });
  const portfolioSummary = createTestPortfolio();

  it('computes accurate report with previous month deltas', () => {
    const transactions: Transaction[] = [
      // September
      createTestTx({ id: '1', date: '2026-09-01', amount: 80000, category: 'Salary', type: 'income' }),
      createTestTx({ id: '2', date: '2026-09-05', amount: 30000, category: 'Housing', type: 'expense' }),
      createTestTx({ id: '3', date: '2026-09-10', amount: 20000, category: 'Food', type: 'expense' }),
      // August
      createTestTx({ id: '4', date: '2026-08-01', amount: 75000, category: 'Salary', type: 'income' }),
      createTestTx({ id: '5', date: '2026-08-05', amount: 30000, category: 'Housing', type: 'expense' }),
      createTestTx({ id: '6', date: '2026-08-10', amount: 15000, category: 'Food', type: 'expense' }),
    ];

    const report = generateMonthlyReviewReport({
      selectedMonth: '2026-09',
      transactions,
      budgets: [createTestBudget({ id: 'b1', category: 'Food', monthlyLimit: 18000 })],
      missions: [],
      snapshot,
      investmentReadiness: readiness,
      investmentCapacity: capacity,
      portfolioSummary,
      totalDebt: 0,
      hasHighCostDebt: false,
    });

    expect(report.month).toBe('2026-09');
    expect(report.income).toBe(80000);
    expect(report.expenses).toBe(50000);
    expect(report.netCashFlow).toBe(30000);
    expect(report.previousMonth).toBe('2026-08');
    expect(report.incomeChange).toBeDefined();
    expect(report.incomeChange?.absolute).toBe(5000); // 80000 - 75000
    expect(report.expensesChange?.absolute).toBe(5000); // 50000 - 45000
    expect(report.healthScore.totalScore).toBeGreaterThan(0);
    expect(report.budgetPerformance.overbudgetCount).toBe(1); // Food 20k > 18k limit
  });

  it('safely omits MoM comparisons when only 1 month exists', () => {
    const transactions: Transaction[] = [
      createTestTx({ id: '1', date: '2026-09-01', amount: 80000, category: 'Salary', type: 'income' }),
      createTestTx({ id: '2', date: '2026-09-05', amount: 50000, category: 'Housing', type: 'expense' }),
    ];

    const report = generateMonthlyReviewReport({
      selectedMonth: '2026-09',
      transactions,
      budgets: [],
      missions: [],
      snapshot,
      investmentReadiness: readiness,
      investmentCapacity: capacity,
      portfolioSummary,
      totalDebt: 0,
      hasHighCostDebt: false,
    });

    expect(report.previousMonth).toBeUndefined();
    expect(report.incomeChange).toBeUndefined();
    expect(report.expensesChange).toBeUndefined();
    expect(report.netCashFlowChange).toBeUndefined();
    expect(report.savingsRateChange).toBeUndefined();
  });
});
