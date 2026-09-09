import { describe, it, expect } from 'vitest';
import {
  formatINR,
  calculateTotalIncome,
  calculateFixedExpenses,
  calculateVariableExpenses,
  calculateTotalExpenses,
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateInvestmentRate,
  calculateDebtToIncomeRatio,
  calculateEmergencyFundMonths,
  calculateExpenseRatio,
  calculateFinancialHealthScore,
  filterTransactionsByMonth,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
  calculateFixedExpensesFromTransactions,
  calculateVariableExpensesFromTransactions,
  calculateEssentialExpensesFromTransactions,
  calculateDiscretionaryExpensesFromTransactions,
  calculateCategorySpending,
  calculateBudgetProgress,
  calculateMonthOverMonthChange,
  generateDeterministicInsights,
  formatTransactionDate,
  getAdjacentMonth,
  calculateRemainingGoalAmount,
  calculateMissionProgress,
  calculateMonthsBetween,
  calculateRequiredMonthlyContribution,
  calculateProjectedCompletionDate,
  calculateExpectedProgress,
  calculateMissionFeasibility,
  calculateMissionConflict,
  calculateEmergencyFundTarget,
  generateSavingsScenarios,
} from './finance';
import {
  FixedExpenses,
  VariableExpenses,
  Transaction,
  Budget,
  SavingsMission,
} from '../types/finance';

describe('Deterministic Financial Calculation Engine', () => {
  describe('formatINR', () => {
    it('formats Indian numbers correctly', () => {
      expect(formatINR(1000)).toBe('₹1,000');
      expect(formatINR(100000)).toBe('₹1,00,000');
      expect(formatINR(1000000)).toBe('₹10,00,000');
      expect(formatINR(0)).toBe('₹0');
    });

    it('formats negative amounts with clear negative sign', () => {
      expect(formatINR(-5000)).toBe('-₹5,000');
      expect(formatINR(-75000)).toBe('-₹75,000');
    });

    it('handles NaN and non-finite numbers safely', () => {
      expect(formatINR(NaN)).toBe('₹0');
      expect(formatINR(Infinity)).toBe('₹0');
    });
  });

  describe('Income Calculations', () => {
    it('accurately calculates total monthly income', () => {
      expect(calculateTotalIncome({ monthlySalary: 75000, otherIncome: 5000 })).toBe(80000);
      expect(calculateTotalIncome({ monthlySalary: 50000, otherIncome: 0 })).toBe(50000);
      expect(calculateTotalIncome({ monthlySalary: 0, otherIncome: 0 })).toBe(0);
    });

    it('ignores negative income inputs', () => {
      expect(calculateTotalIncome({ monthlySalary: -50000, otherIncome: 10000 })).toBe(10000);
    });
  });

  describe('Expense Calculations', () => {
    const mockFixed: FixedExpenses = {
      rent: 18000,
      utilities: 3000,
      internet: 1000,
      phone: 800,
      insurance: 2000,
      emi: 5000,
      subscriptions: 700,
      transportation: 3500,
      education: 0,
      other: 0,
    };

    const mockVariable: VariableExpenses = {
      food: 6000,
      shopping: 2500,
      entertainment: 1500,
      travel: 1000,
      miscellaneous: 500,
    };

    it('accurately sums fixed committed expenses', () => {
      expect(calculateFixedExpenses(mockFixed)).toBe(34000);
    });

    it('accurately sums variable lifestyle expenses', () => {
      expect(calculateVariableExpenses(mockVariable)).toBe(11500);
    });

    it('accurately calculates total expenses', () => {
      expect(calculateTotalExpenses({ fixed: mockFixed, variable: mockVariable })).toBe(45500);
    });
  });

  describe('Monthly Surplus & Negative Cash Flow (Deficit)', () => {
    it('calculates positive surplus correctly', () => {
      expect(calculateMonthlySurplus(75000, 42000)).toBe(33000);
    });

    it('handles negative cash flow / deficit correctly', () => {
      expect(calculateMonthlySurplus(50000, 55000)).toBe(-5000);
    });
  });

  describe('Rates & Ratios', () => {
    it('calculates savings rate safely', () => {
      expect(calculateSavingsRate(33000, 75000)).toBe(44);
      expect(calculateSavingsRate(-5000, 50000)).toBe(0);
      expect(calculateSavingsRate(10000, 0)).toBe(0);
    });

    it('calculates investment rate safely', () => {
      expect(calculateInvestmentRate(20000, 80000)).toBe(25);
      expect(calculateInvestmentRate(0, 50000)).toBe(0);
    });

    it('calculates debt-to-income ratio', () => {
      expect(calculateDebtToIncomeRatio(15000, 60000)).toBe(25);
      expect(calculateDebtToIncomeRatio(0, 50000)).toBe(0);
    });

    it('calculates expense ratio', () => {
      expect(calculateExpenseRatio(42000, 75000)).toBe(56);
      expect(calculateExpenseRatio(60000, 50000)).toBe(120);
    });
  });

  describe('Emergency Fund Months (Runway)', () => {
    it('calculates months of essential expenses covered', () => {
      expect(calculateEmergencyFundMonths(120000, 30000)).toBe(4);
      expect(calculateEmergencyFundMonths(150000, 25000)).toBe(6);
    });

    it('returns null (Data Required) when essential expenses are missing or zero', () => {
      expect(calculateEmergencyFundMonths(50000, 0)).toBeNull();
    });
  });

  describe('Financial Health Score', () => {
    it('produces a transparent score with factor breakdowns', () => {
      const evaluation = calculateFinancialHealthScore({
        totalIncome: 75000,
        totalExpenses: 42000,
        monthlyDebt: 5000,
        emergencyFund: 150000,
        essentialMonthlyExpenses: 30000,
      });

      expect(evaluation.totalScore).toBeGreaterThan(60);
      expect(evaluation.factors).toHaveLength(4);
      expect(evaluation.factors.map((f) => f.name)).toEqual([
        'Savings Rate',
        'Emergency Buffer',
        'Debt Burden',
        'Expense Control',
      ]);
    });

    it('handles deficit correctly in health evaluation', () => {
      const evaluation = calculateFinancialHealthScore({
        totalIncome: 40000,
        totalExpenses: 50000,
        monthlyDebt: 10000,
        emergencyFund: 0,
        essentialMonthlyExpenses: 35000,
      });

      expect(evaluation.totalScore).toBeLessThan(40);
      expect(evaluation.factors[0].status).toBe('Vulnerable');
    });
  });

  // ========================================================================
  // PHASE 2: TRANSACTION & BUDGET TESTS
  // ========================================================================

  describe('Phase 2 Transaction & Budget Utilities', () => {
    const mockTxs: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 75000,
        category: 'Salary',
        date: '2026-09-01',
        description: 'Monthly Salary',
        recurring: true,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'tx-2',
        type: 'income',
        amount: 5000,
        category: 'Freelance',
        date: '2026-09-05',
        description: 'Design consulting',
        recurring: false,
        createdAt: '2026-09-05T10:00:00Z',
        updatedAt: '2026-09-05T10:00:00Z',
      },
      {
        id: 'tx-3',
        type: 'expense',
        amount: 18000,
        category: 'Housing',
        date: '2026-09-02',
        description: 'Apartment rent',
        recurring: true,
        expenseType: 'fixed',
        essentiality: 'essential',
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      },
      {
        id: 'tx-4',
        type: 'expense',
        amount: 6000,
        category: 'Food',
        date: '2026-09-04',
        description: 'Groceries',
        recurring: false,
        expenseType: 'variable',
        essentiality: 'essential',
        createdAt: '2026-09-04T10:00:00Z',
        updatedAt: '2026-09-04T10:00:00Z',
      },
      {
        id: 'tx-5',
        type: 'expense',
        amount: 3000,
        category: 'Entertainment',
        date: '2026-09-06',
        description: 'Cinema and games',
        recurring: false,
        expenseType: 'variable',
        essentiality: 'discretionary',
        createdAt: '2026-09-06T10:00:00Z',
        updatedAt: '2026-09-06T10:00:00Z',
      },
      {
        id: 'tx-old',
        type: 'expense',
        amount: 5000,
        category: 'Food',
        date: '2026-08-15',
        description: 'August Groceries',
        recurring: false,
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-08-15T10:00:00Z',
      },
    ];

    it('filters transactions by month', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      expect(sepTxs).toHaveLength(5);
      const augTxs = filterTransactionsByMonth(mockTxs, '2026-08');
      expect(augTxs).toHaveLength(1);
      expect(augTxs[0].id).toBe('tx-old');
    });

    it('calculates monthly income from transactions', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      expect(calculateMonthlyIncome(sepTxs)).toBe(80000);
    });

    it('calculates monthly expenses from transactions', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      expect(calculateMonthlyExpenses(sepTxs)).toBe(27000);
    });

    it('calculates net cash flow from transactions', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      const inc = calculateMonthlyIncome(sepTxs);
      const exp = calculateMonthlyExpenses(sepTxs);
      expect(calculateNetCashFlow(inc, exp)).toBe(53000);
    });

    it('calculates fixed vs variable expenses correctly', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      expect(calculateFixedExpensesFromTransactions(sepTxs)).toBe(18000);
      expect(calculateVariableExpensesFromTransactions(sepTxs)).toBe(9000);
    });

    it('calculates essential vs discretionary expenses correctly', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      expect(calculateEssentialExpensesFromTransactions(sepTxs)).toBe(24000); // Housing (18k) + Food (6k)
      expect(calculateDiscretionaryExpensesFromTransactions(sepTxs)).toBe(3000); // Entertainment (3k)
    });

    it('groups spending by category and calculates percentages', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      const breakdown = calculateCategorySpending(sepTxs);
      expect(breakdown).toHaveLength(3);
      expect(breakdown[0].category).toBe('Housing');
      expect(breakdown[0].amount).toBe(18000);
      expect(breakdown[0].percentage).toBe(66.7);
    });

    it('evaluates budget progress across thresholds', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');

      // Under control (< 75%)
      const budgetHousing: Budget = {
        id: 'b-1',
        category: 'Housing',
        monthlyLimit: 25000,
        createdAt: '',
        updatedAt: '',
      };
      const prog1 = calculateBudgetProgress(budgetHousing, sepTxs);
      expect(prog1.actualSpent).toBe(18000);
      expect(prog1.remaining).toBe(7000);
      expect(prog1.variance).toBe(7000);
      expect(prog1.percentUsed).toBe(72);
      expect(prog1.status).toBe('under_control');

      // Approaching limit (75% - 100%)
      const budgetFood: Budget = {
        id: 'b-2',
        category: 'Food',
        monthlyLimit: 7500,
        createdAt: '',
        updatedAt: '',
      };
      const prog2 = calculateBudgetProgress(budgetFood, sepTxs);
      expect(prog2.actualSpent).toBe(6000);
      expect(prog2.percentUsed).toBe(80);
      expect(prog2.status).toBe('approaching_limit');

      // Over budget (> 100%)
      const budgetEntertainment: Budget = {
        id: 'b-3',
        category: 'Entertainment',
        monthlyLimit: 2000,
        createdAt: '',
        updatedAt: '',
      };
      const prog3 = calculateBudgetProgress(budgetEntertainment, sepTxs);
      expect(prog3.actualSpent).toBe(3000);
      expect(prog3.percentUsed).toBe(150);
      expect(prog3.variance).toBe(-1000);
      expect(prog3.status).toBe('over_budget');
    });

    it('calculates month-over-month comparisons accurately', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      const augTxs = filterTransactionsByMonth(mockTxs, '2026-08');

      const mom = calculateMonthOverMonthChange(sepTxs, augTxs, '2026-08', '2026-09');
      expect(mom).not.toBeNull();
      expect(mom!.incomeChange).toBe(80000); // 80k vs 0 in Aug
      expect(mom!.expenseChange).toBe(22000); // 27k vs 5k in Aug
    });

    it('generates deterministic insights without hallucinating', () => {
      const sepTxs = filterTransactionsByMonth(mockTxs, '2026-09');
      const augTxs = filterTransactionsByMonth(mockTxs, '2026-08');
      const budgets: Budget[] = [
        {
          id: 'b-3',
          category: 'Entertainment',
          monthlyLimit: 2000,
          createdAt: '',
          updatedAt: '',
        },
      ];

      const insights = generateDeterministicInsights(sepTxs, augTxs, budgets);
      expect(insights.length).toBeGreaterThanOrEqual(2);
      expect(insights.some((i) => i.id.includes('budget-over'))).toBe(true);
      expect(insights.some((i) => i.id === 'fixed-expense-ratio')).toBe(true);
    });

    it('formats transaction dates and navigates adjacent months', () => {
      expect(formatTransactionDate('2026-09-09')).toBe('09 SEP');
      expect(getAdjacentMonth('2026-09', -1)).toBe('2026-08');
      expect(getAdjacentMonth('2026-09', 1)).toBe('2026-10');
      expect(getAdjacentMonth('2026-01', -1)).toBe('2025-12');
    });
  });

  // ========================================================================
  // PHASE 3: SAVINGS MISSIONS & PLANNING TESTS
  // ========================================================================

  describe('Phase 3 Savings Missions Calculations', () => {
    it('calculates remaining goal amount and clamps >= 0', () => {
      expect(calculateRemainingGoalAmount(120000, 45000)).toBe(75000);
      expect(calculateRemainingGoalAmount(120000, 120000)).toBe(0);
      expect(calculateRemainingGoalAmount(120000, 150000)).toBe(0);
    });

    it('calculates mission progress clamped strictly between 0 and 100', () => {
      expect(calculateMissionProgress(60000, 120000)).toBe(50);
      expect(calculateMissionProgress(62000, 120000)).toBe(51.7);
      expect(calculateMissionProgress(150000, 120000)).toBe(100);
      expect(calculateMissionProgress(0, 120000)).toBe(0);
      expect(calculateMissionProgress(10000, 0)).toBe(0);
    });

    it('calculates calendar months between dates accurately', () => {
      expect(calculateMonthsBetween('2026-09-01', '2027-03-01')).toBe(6);
      expect(calculateMonthsBetween('2026-09-01', '2026-12-01')).toBe(3);
      expect(calculateMonthsBetween('2026-09-01', '2026-09-01')).toBe(0);
      expect(calculateMonthsBetween('2027-01-01', '2026-09-01')).toBe(0);
    });

    it('calculates required monthly contribution for deadline', () => {
      // Remaining 60,000 in 6 months => 10,000/month
      const req = calculateRequiredMonthlyContribution(60000, '2027-03-01', '2026-09-01');
      expect(req).toBe(10000);

      // Remaining 0 => 0
      expect(calculateRequiredMonthlyContribution(0, '2027-03-01', '2026-09-01')).toBe(0);
    });

    it('calculates projected completion date and months required', () => {
      const proj = calculateProjectedCompletionDate(60000, 10000, '2026-09-01');
      expect(proj.monthsRequired).toBe(6);
      expect(proj.completionDate).toBe('2027-03');

      // Zero contribution returns Indefinite
      const projZero = calculateProjectedCompletionDate(60000, 0, '2026-09-01');
      expect(projZero.completionDate).toBe('Indefinite');
    });

    it('calculates ahead, on schedule, and behind tracking', () => {
      // Target 120k from 2026-01-01 to 2026-12-31 (12m). At 6m, expected is 60k.
      // Actual 70k => AHEAD
      const ahead = calculateExpectedProgress(120000, 0, '2026-01-01', '2026-12-31', '2026-07-01', 70000);
      expect(ahead.status).toBe('ahead');

      // Actual 50k => BEHIND
      const behind = calculateExpectedProgress(120000, 0, '2026-01-01', '2026-12-31', '2026-07-01', 50000);
      expect(behind.status).toBe('behind');

      // Actual 60k => ON_SCHEDULE
      const onSched = calculateExpectedProgress(120000, 0, '2026-01-01', '2026-12-31', '2026-07-01', 60000);
      expect(onSched.status).toBe('on_schedule');
    });

    it('evaluates feasibility levels: on_track, tight, at_risk, not_feasible, and completed', () => {
      // 1. Comfortable ON TRACK: surplus 35k, requires 10k (<= 70% of surplus)
      const f1 = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 60000,
        targetDate: '2027-03-01', // 6m => 10k/mo
        availableSurplus: 35000,
      });
      expect(f1.status).toBe('on_track');
      expect(f1.requiredMonthlyContribution).toBe(10000);
      expect(f1.shortfall).toBe(0);

      // 2. TIGHT: surplus 12k, requires 10k (> 80% safe ceiling of surplus)
      const f2 = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 60000,
        targetDate: '2027-03-01', // 6m => 10k/mo
        availableSurplus: 12000,
      });
      expect(f2.status).toBe('tight');

      // 3. NOT FEASIBLE: surplus 5k, requires 10k
      const f3 = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 60000,
        targetDate: '2027-03-01',
        availableSurplus: 5000,
      });
      expect(f3.status).toBe('not_feasible');
      expect(f3.shortfall).toBe(5000);

      // 4. AT RISK: user selected 6k/mo but needs 10k/mo
      const f4 = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 60000,
        targetDate: '2027-03-01',
        availableSurplus: 25000,
        userSelectedContribution: 6000,
      });
      expect(f4.status).toBe('at_risk');

      // 5. COMPLETED: current == target
      const f5 = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 120000,
        targetDate: '2027-03-01',
        availableSurplus: 25000,
      });
      expect(f5.status).toBe('completed');
    });

    it('detects mission conflicts across multiple active missions', () => {
      const missions: SavingsMission[] = [
        {
          id: 'm-1',
          missionCode: 'MISSION 0001',
          name: 'MacBook Pro',
          category: 'Technology',
          targetAmount: 120000,
          initialAmount: 0,
          currentAmount: 20000,
          targetDate: '2027-03-01',
          isAsap: false,
          monthlyContribution: 10000,
          priority: 'high',
          status: 'on_track',
          isArchived: false,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'm-2',
          missionCode: 'MISSION 0002',
          name: 'Goa Trip',
          category: 'Travel',
          targetAmount: 50000,
          initialAmount: 0,
          currentAmount: 10000,
          targetDate: '2027-01-01',
          isAsap: false,
          monthlyContribution: 8000,
          priority: 'medium',
          status: 'on_track',
          isArchived: false,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'm-3',
          missionCode: 'MISSION 0003',
          name: 'Camera Drone',
          category: 'Technology',
          targetAmount: 70000,
          initialAmount: 0,
          currentAmount: 0,
          targetDate: '2027-06-01',
          isAsap: false,
          monthlyContribution: 7000,
          priority: 'low',
          status: 'on_track',
          isArchived: false,
          createdAt: '',
          updatedAt: '',
        },
      ];

      // Total required: 10k + 8k + 7k = 25k/mo
      // Available surplus: 20k/mo => Conflict detected with 5k shortfall
      const conflict = calculateMissionConflict(missions, 20000);
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.totalRequiredContribution).toBe(25000);
      expect(conflict.shortfall).toBe(5000);
      expect(conflict.recommendations.length).toBeGreaterThan(0);
      expect(conflict.recommendations.some((r) => r.includes('MacBook Pro'))).toBe(true);

      // Available surplus: 30k/mo => No conflict
      const noConflict = calculateMissionConflict(missions, 30000);
      expect(noConflict.hasConflict).toBe(false);
      expect(noConflict.shortfall).toBe(0);
    });

    it('calculates emergency fund target based on coverage months', () => {
      expect(calculateEmergencyFundTarget(30000, 3)).toBe(90000);
      expect(calculateEmergencyFundTarget(30000, 6)).toBe(180000);
      expect(calculateEmergencyFundTarget(30000, 12)).toBe(360000);
    });

    it('generates scenario comparisons dynamically', () => {
      const scenarios = generateSavingsScenarios(60000, 10000, '2027-03-01');
      expect(scenarios.length).toBeGreaterThanOrEqual(3);
      expect(scenarios.some((s) => s.monthlyContribution === 10000)).toBe(true);
      const baseline = scenarios.find((s) => s.monthlyContribution === 10000);
      expect(baseline?.monthsRequired).toBe(6);
    });

    it('evaluates ASAP mode feasibility using safe surplus ceiling', () => {
      // ASAP with 30k surplus: safe ceiling (80%) is 24k
      const asapFeasible = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 24000,
        targetDate: '',
        isAsap: true,
        availableSurplus: 30000,
      });
      expect(asapFeasible.status).toBe('on_track');
      expect(asapFeasible.requiredMonthlyContribution).toBe(24000);
      expect(asapFeasible.surplusAfterContribution).toBe(6000);

      // ASAP with 0 surplus: not feasible
      const asapInfeasible = calculateMissionFeasibility({
        targetAmount: 120000,
        currentAmount: 0,
        targetDate: '',
        isAsap: true,
        availableSurplus: 0,
      });
      expect(asapInfeasible.status).toBe('not_feasible');
    });

    it('detects overdue missions when target date is in the past and goal is incomplete', () => {
      const overdue = calculateMissionFeasibility({
        targetAmount: 100000,
        currentAmount: 40000,
        targetDate: '2025-01-01', // Past date
        isAsap: false,
        availableSurplus: 30000,
      });
      expect(overdue.status).toBe('overdue');
      expect(overdue.requiredMonthlyContribution).toBe(60000); // Demands remaining balance immediately
      expect(overdue.explanation).toContain('lapsed');
    });
  });
});
