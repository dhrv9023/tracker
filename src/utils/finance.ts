// ==========================================================================
// FINANCE OS — DETERMINISTIC FINANCIAL CALCULATION ENGINE
// Pure, deterministic math layer with zero AI/external dependencies.
// (PHASE 1, PHASE 2 & PHASE 3)
// ==========================================================================

import {
  IncomeProfile,
  ExpenseProfile,
  FixedExpenses,
  VariableExpenses,
  FinancialHealthEvaluation,
  HealthScoreFactor,
  Transaction,
  Budget,
  BudgetStatus,
  BudgetProgress,
  CategorySpendingSummary,
  MonthOverMonthChange,
  CashFlowInsight,
  SavingsMission,
  SavingsContribution,
  SavingsScenario,
  MissionFeasibility,
  MissionAheadBehind,
  MissionConflictSummary,
  MissionStatus,
  MissionPriority,
  InvestmentRiskProfile,
  InvestmentGoal,
  InvestmentHorizon,
  InvestmentExperience,
  LiquidityPreference,
  InvestmentReadinessStatus,
  UserInvestmentProfile,
  RiskReaction,
  AssetCategory,
  InvestmentHolding,
  InvestmentCapacityBreakdown,
  InvestmentReadinessEvaluation,
  AssetAllocationItem,
  AssetAllocationPlan,
  SIPCalculationResult,
  ProjectionScenario,
  CurrentVsTargetAllocation,
  PortfolioAllocationSummary,
} from '../types/finance';

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Interest',
  'Bonus',
  'Other',
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Education',
  'Entertainment',
  'Shopping',
  'Travel',
  'Subscriptions',
  'Debt',
  'Other',
] as const;

export const DEFAULT_MISSION_CATEGORIES = [
  'Emergency Fund',
  'Technology',
  'Travel',
  'Vehicle',
  'Education',
  'Home',
  'Wedding/Event',
  'Health',
  'Business',
  'Other',
] as const;

/**
 * Formats a numerical amount into Indian Rupee format (e.g. ₹1,00,000 or -₹5,000).
 * Avoids floating point artifacts and handles negative values cleanly.
 */
export function formatINR(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  });

  const formattedNumber = formatter.format(absAmount);
  return `${isNegative ? '-' : ''}₹${formattedNumber}`;
}

/**
 * Calculates total monthly revenue (take-home salary + other inflows).
 */
export function calculateTotalIncome(income: IncomeProfile): number {
  if (!income) return 0;
  const salary = Math.max(0, Number(income.monthlySalary) || 0);
  const other = Math.max(0, Number(income.otherIncome) || 0);
  return salary + other;
}

/**
 * Calculates total monthly fixed committed obligations.
 */
export function calculateFixedExpenses(fixed: FixedExpenses): number {
  if (!fixed) return 0;
  const values = [
    fixed.rent,
    fixed.utilities,
    fixed.internet,
    fixed.phone,
    fixed.insurance,
    fixed.emi,
    fixed.subscriptions,
    fixed.transportation,
    fixed.education,
    fixed.other,
  ];
  return values.reduce((sum, val) => sum + Math.max(0, Number(val) || 0), 0);
}

/**
 * Calculates total monthly variable lifestyle expenditures.
 */
export function calculateVariableExpenses(variable: VariableExpenses): number {
  if (!variable) return 0;
  const values = [
    variable.food,
    variable.shopping,
    variable.entertainment,
    variable.travel,
    variable.miscellaneous,
  ];
  return values.reduce((sum, val) => sum + Math.max(0, Number(val) || 0), 0);
}

/**
 * Calculates total monthly expenses (fixed + variable).
 */
export function calculateTotalExpenses(expenses: ExpenseProfile): number {
  if (!expenses) return 0;
  const fixed = calculateFixedExpenses(expenses.fixed);
  const variable = calculateVariableExpenses(expenses.variable);
  return fixed + variable;
}

/**
 * Calculates monthly available capital (surplus or deficit).
 * Surplus = Total Income - Total Expenses
 * If negative, this represents a cash flow deficit.
 */
export function calculateMonthlySurplus(totalIncome: number, totalExpenses: number): number {
  const safeIncome = Math.max(0, Number(totalIncome) || 0);
  const safeExpenses = Math.max(0, Number(totalExpenses) || 0);
  return safeIncome - safeExpenses;
}

/**
 * Calculates deterministic savings rate as a percentage of total income.
 * Rate = (Net Surplus / Total Income) * 100
 * Handles zero income safely.
 */
export function calculateSavingsRate(monthlySurplus: number, totalIncome: number): number {
  const safeIncome = Math.max(0, Number(totalIncome) || 0);
  if (safeIncome === 0 || monthlySurplus <= 0) return 0;
  const rate = (monthlySurplus / safeIncome) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
}

/**
 * Calculates investment rate (existing investments or allocated capital relative to income).
 */
export function calculateInvestmentRate(investmentAmount: number, totalIncome: number): number {
  const safeIncome = Math.max(0, Number(totalIncome) || 0);
  if (safeIncome === 0 || investmentAmount <= 0) return 0;
  const rate = (investmentAmount / safeIncome) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Calculates debt-to-income ratio based on monthly EMI/debt obligations.
 */
export function calculateDebtToIncomeRatio(monthlyDebtService: number, totalIncome: number): number {
  const safeIncome = Math.max(0, Number(totalIncome) || 0);
  const safeDebt = Math.max(0, Number(monthlyDebtService) || 0);
  if (safeIncome === 0) return safeDebt > 0 ? 100 : 0;
  const ratio = (safeDebt / safeIncome) * 100;
  return Math.min(100, Math.round(ratio * 10) / 10);
}

/**
 * Calculates expense ratio (Total Expenses / Total Income).
 */
export function calculateExpenseRatio(totalExpenses: number, totalIncome: number): number {
  const safeIncome = Math.max(0, Number(totalIncome) || 0);
  const safeExpenses = Math.max(0, Number(totalExpenses) || 0);
  if (safeIncome === 0) return safeExpenses > 0 ? 100 : 0;
  const ratio = (safeExpenses / safeIncome) * 100;
  return Math.round(ratio * 10) / 10;
}

/**
 * Calculates estimated months of essential expenses covered by current emergency reserves.
 * If essential monthly expenses are zero or missing, returns null ("DATA REQUIRED").
 */
export function calculateEmergencyFundMonths(
  emergencyFund: number,
  essentialMonthlyExpenses: number
): number | null {
  const safeExpenses = Number(essentialMonthlyExpenses) || 0;
  if (safeExpenses <= 0) return null; // Flag "DATA REQUIRED"

  const safeFund = Math.max(0, Number(emergencyFund) || 0);
  const months = safeFund / safeExpenses;
  return Math.round(months * 10) / 10;
}

/**
 * Transparent, deterministic Personal Financial Health Score (0 - 100).
 */
export function calculateFinancialHealthScore(params: {
  totalIncome: number;
  totalExpenses: number;
  monthlyDebt: number;
  emergencyFund: number;
  essentialMonthlyExpenses: number;
}): FinancialHealthEvaluation {
  const { totalIncome, totalExpenses, monthlyDebt, emergencyFund, essentialMonthlyExpenses } = params;

  const factors: HealthScoreFactor[] = [];

  // Factor 1: Savings Rate (Max 30 pts)
  const surplus = calculateMonthlySurplus(totalIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(Math.max(0, surplus), totalIncome);
  let savingsScore = 0;
  let savingsStatus: HealthScoreFactor['status'] = 'Vulnerable';
  let savingsDetails = '';

  if (totalIncome === 0) {
    savingsScore = 0;
    savingsStatus = 'Data Required';
    savingsDetails = 'Income baseline required.';
  } else if (surplus < 0) {
    savingsScore = 0;
    savingsStatus = 'Vulnerable';
    savingsDetails = `Negative cash flow (-${formatINR(Math.abs(surplus))}). Deficit posture.`;
  } else if (savingsRate >= 40) {
    savingsScore = 30;
    savingsStatus = 'Strong';
    savingsDetails = `Elite savings rate (${savingsRate}% preserved).`;
  } else if (savingsRate >= 20) {
    savingsScore = 22;
    savingsStatus = 'Strong';
    savingsDetails = `Target savings rate (${savingsRate}% preserved).`;
  } else if (savingsRate >= 10) {
    savingsScore = 14;
    savingsStatus = 'Moderate';
    savingsDetails = `Adequate savings rate (${savingsRate}% preserved).`;
  } else {
    savingsScore = 6;
    savingsStatus = 'Vulnerable';
    savingsDetails = `Low savings rate (${savingsRate}% preserved).`;
  }

  factors.push({
    name: 'Savings Rate',
    score: savingsScore,
    maxScore: 30,
    status: savingsStatus,
    details: savingsDetails,
  });

  // Factor 2: Emergency Buffer (Max 25 pts)
  const runwayMonths = calculateEmergencyFundMonths(emergencyFund, essentialMonthlyExpenses);
  let emergencyScore = 0;
  let emergencyStatus: HealthScoreFactor['status'] = 'Vulnerable';
  let emergencyDetails = '';

  if (runwayMonths === null) {
    emergencyScore = 5;
    emergencyStatus = 'Data Required';
    emergencyDetails = 'Essential expense baseline needed for precise runway calculation.';
  } else if (runwayMonths >= 6) {
    emergencyScore = 25;
    emergencyStatus = 'Strong';
    emergencyDetails = `Fortified runway (${runwayMonths} months buffer).`;
  } else if (runwayMonths >= 3) {
    emergencyScore = 18;
    emergencyStatus = 'Moderate';
    emergencyDetails = `Moderate runway (${runwayMonths} months buffer).`;
  } else if (runwayMonths >= 1) {
    emergencyScore = 10;
    emergencyStatus = 'Vulnerable';
    emergencyDetails = `Fragile runway (${runwayMonths} months buffer). Target 3-6 months.`;
  } else {
    emergencyScore = 2;
    emergencyStatus = 'Vulnerable';
    emergencyDetails = 'Critically exposed reserve buffer (< 1 month buffer).';
  }

  factors.push({
    name: 'Emergency Buffer',
    score: emergencyScore,
    maxScore: 25,
    status: emergencyStatus,
    details: emergencyDetails,
  });

  // Factor 3: Debt Burden (Max 25 pts)
  const dti = calculateDebtToIncomeRatio(monthlyDebt, totalIncome);
  let debtScore = 0;
  let debtStatus: HealthScoreFactor['status'] = 'Strong';
  let debtDetails = '';

  if (totalIncome === 0) {
    debtScore = monthlyDebt > 0 ? 0 : 25;
    debtStatus = monthlyDebt > 0 ? 'Vulnerable' : 'Strong';
    debtDetails = monthlyDebt > 0 ? 'Debt obligations with zero income.' : 'No debt reported.';
  } else if (dti === 0) {
    debtScore = 25;
    debtStatus = 'Strong';
    debtDetails = 'Zero debt leverage detected.';
  } else if (dti <= 20) {
    debtScore = 20;
    debtStatus = 'Strong';
    debtDetails = `Low debt load (${dti}% of monthly income).`;
  } else if (dti <= 40) {
    debtScore = 12;
    debtStatus = 'Moderate';
    debtDetails = `Moderate debt servicing (${dti}% of monthly income).`;
  } else {
    debtScore = 4;
    debtStatus = 'Vulnerable';
    debtDetails = `High debt servicing burden (${dti}% of monthly income).`;
  }

  factors.push({
    name: 'Debt Burden',
    score: debtScore,
    maxScore: 25,
    status: debtStatus,
    details: debtDetails,
  });

  // Factor 4: Expense Ratio (Max 20 pts)
  const expenseRatio = calculateExpenseRatio(totalExpenses, totalIncome);
  let expenseScore = 0;
  let expenseStatus: HealthScoreFactor['status'] = 'Strong';
  let expenseDetails = '';

  if (totalIncome === 0) {
    expenseScore = 0;
    expenseStatus = 'Data Required';
    expenseDetails = 'Income data required.';
  } else if (expenseRatio <= 60) {
    expenseScore = 20;
    expenseStatus = 'Strong';
    expenseDetails = `Lean operational outlays (${expenseRatio}% of income).`;
  } else if (expenseRatio <= 80) {
    expenseScore = 14;
    expenseStatus = 'Moderate';
    expenseDetails = `Controlled outflows (${expenseRatio}% of income).`;
  } else {
    expenseScore = 4;
    expenseStatus = 'Vulnerable';
    expenseDetails = `High expense load (${expenseRatio}% of income consumed).`;
  }

  factors.push({
    name: 'Expense Control',
    score: expenseScore,
    maxScore: 20,
    status: expenseStatus,
    details: expenseDetails,
  });

  const totalScore = Math.min(100, Math.max(0, savingsScore + emergencyScore + debtScore + expenseScore));

  let tier: FinancialHealthEvaluation['tier'] = 'Moderate';
  if (totalScore >= 85) tier = 'Elite';
  else if (totalScore >= 70) tier = 'Strong';
  else if (totalScore >= 50) tier = 'Moderate';
  else if (totalScore >= 35) tier = 'Vulnerable';
  else tier = 'Critical';

  return {
    totalScore,
    tier,
    factors,
    summary: `Preliminary rating based on 4 verified financial dimensions. Score: ${totalScore}/100 (${tier}).`,
  };
}

// ==========================================================================
// PHASE 2: TRANSACTION, BUDGET, AND CASH FLOW CALCULATION FUNCTIONS
// ==========================================================================

/**
 * Returns a local date string formatted as YYYY-MM-DD.
 * Strictly avoids UTC conversion drift caused by toISOString() across timezones.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month key in format YYYY-MM (e.g. "2026-09").
 */
export function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a month key (e.g. "2026-09") into a friendly display label (e.g. "September 2026").
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns month key shifted by delta months (e.g. -1 for previous month, +1 for next).
 */
export function getAdjacentMonth(monthKey: string, delta: number): string {
  if (!monthKey || !monthKey.includes('-')) return getCurrentMonthKey();
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month + delta, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

/**
 * Formats YYYY-MM-DD to tactical "09 SEP" format.
 */
export function formatTransactionDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[2].padStart(2, '0');
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${day} ${monthNames[monthIdx] || ''}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Filters transactions that occurred within the specified month (YYYY-MM).
 */
export function filterTransactionsByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  if (!Array.isArray(transactions) || !monthKey) return [];
  return transactions.filter((t) => t.date && t.date.startsWith(monthKey));
}

/**
 * Calculates total monthly income from transactions.
 */
export function calculateMonthlyIncome(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Calculates total monthly expenses from transactions.
 */
export function calculateMonthlyExpenses(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Calculates net cash flow (inflow - outflow).
 */
export function calculateNetCashFlow(income: number, expenses: number): number {
  return (Math.max(0, Number(income) || 0)) - (Math.max(0, Number(expenses) || 0));
}

/**
 * Calculates fixed expenses from transactions.
 */
export function calculateFixedExpensesFromTransactions(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      if (t.expenseType === 'fixed') return true;
      if (t.expenseType === 'variable') return false;
      return t.recurring === true;
    })
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Calculates variable expenses from transactions.
 */
export function calculateVariableExpensesFromTransactions(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      if (t.expenseType === 'variable') return true;
      if (t.expenseType === 'fixed') return false;
      return t.recurring !== true;
    })
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Calculates essential expenses from transactions.
 */
export function calculateEssentialExpensesFromTransactions(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  const defaultEssentialCategories = ['Housing', 'Food', 'Utilities', 'Transportation', 'Healthcare', 'Education', 'Debt'];
  return transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      if (t.essentiality === 'essential') return true;
      if (t.essentiality === 'discretionary') return false;
      return defaultEssentialCategories.includes(t.category);
    })
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Calculates discretionary expenses from transactions.
 */
export function calculateDiscretionaryExpensesFromTransactions(transactions: Transaction[]): number {
  if (!Array.isArray(transactions)) return 0;
  const defaultEssentialCategories = ['Housing', 'Food', 'Utilities', 'Transportation', 'Healthcare', 'Education', 'Debt'];
  return transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      if (t.essentiality === 'discretionary') return true;
      if (t.essentiality === 'essential') return false;
      return !defaultEssentialCategories.includes(t.category);
    })
    .reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);
}

/**
 * Groups and sums transactions by category with percentages.
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense'
): CategorySpendingSummary[] {
  if (!Array.isArray(transactions)) return [];
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + Math.max(0, Number(t.amount) || 0), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filtered.forEach((t) => {
    const cat = t.category || 'Other';
    const existing = categoryMap.get(cat) || { amount: 0, count: 0 };
    categoryMap.set(cat, {
      amount: existing.amount + (Number(t.amount) || 0),
      count: existing.count + 1,
    });
  });

  const results: CategorySpendingSummary[] = [];
  categoryMap.forEach((val, cat) => {
    results.push({
      category: cat,
      amount: val.amount,
      percentage: total > 0 ? Math.round((val.amount / total) * 1000) / 10 : 0,
      count: val.count,
    });
  });

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Evaluates budget progress, percentage used, remaining allowance, and status thresholds.
 */
export function calculateBudgetProgress(budget: Budget, transactions: Transaction[]): BudgetProgress {
  const limit = Math.max(0, Number(budget.monthlyLimit) || 0);
  const matching = transactions.filter((t) => t.type === 'expense' && t.category === budget.category);
  const actualSpent = matching.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const remaining = Math.max(0, limit - actualSpent);
  const variance = limit - actualSpent;
  const percentUsed = limit > 0 ? Math.round((actualSpent / limit) * 1000) / 10 : (actualSpent > 0 ? 100 : 0);

  let status: BudgetStatus = 'under_control';
  if (percentUsed > 100) {
    status = 'over_budget';
  } else if (percentUsed >= 75) {
    status = 'approaching_limit';
  }

  return {
    category: budget.category,
    budgetLimit: limit,
    actualSpent,
    remaining,
    variance,
    percentUsed,
    status,
  };
}

/**
 * Calculates month-over-month comparison between current and previous month.
 */
export function calculateMonthOverMonthChange(
  currentMonthTxs: Transaction[],
  previousMonthTxs: Transaction[],
  previousMonthKey: string,
  currentMonthKey: string
): MonthOverMonthChange | null {
  if (!currentMonthTxs.length && !previousMonthTxs.length) return null;

  const currentIncome = calculateMonthlyIncome(currentMonthTxs);
  const previousIncome = calculateMonthlyIncome(previousMonthTxs);

  const currentExpenses = calculateMonthlyExpenses(currentMonthTxs);
  const previousExpenses = calculateMonthlyExpenses(previousMonthTxs);

  const currentNet = calculateNetCashFlow(currentIncome, currentExpenses);
  const previousNet = calculateNetCashFlow(previousIncome, previousExpenses);

  const currentSavingsRate = calculateSavingsRate(Math.max(0, currentNet), currentIncome);
  const previousSavingsRate = calculateSavingsRate(Math.max(0, previousNet), previousIncome);

  // Category changes
  const currCatMap = new Map<string, number>();
  currentMonthTxs.filter((t) => t.type === 'expense').forEach((t) => {
    currCatMap.set(t.category, (currCatMap.get(t.category) || 0) + t.amount);
  });

  const prevCatMap = new Map<string, number>();
  previousMonthTxs.filter((t) => t.type === 'expense').forEach((t) => {
    prevCatMap.set(t.category, (prevCatMap.get(t.category) || 0) + t.amount);
  });

  const allCategories = new Set([...currCatMap.keys(), ...prevCatMap.keys()]);
  const categoryChanges = Array.from(allCategories).map((cat) => {
    const curr = currCatMap.get(cat) || 0;
    const prev = prevCatMap.get(cat) || 0;
    return {
      category: cat,
      currentAmount: curr,
      previousAmount: prev,
      change: curr - prev,
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return {
    previousMonth: previousMonthKey,
    currentMonth: currentMonthKey,
    incomeChange: currentIncome - previousIncome,
    expenseChange: currentExpenses - previousExpenses,
    netCashFlowChange: currentNet - previousNet,
    savingsRateChange: currentSavingsRate - previousSavingsRate,
    categoryChanges,
  };
}

/**
 * Generates deterministic rule-based insights.
 * Zero AI / zero Gemini.
 */
export function generateDeterministicInsights(
  currentMonthTxs: Transaction[],
  previousMonthTxs: Transaction[],
  budgets: Budget[]
): CashFlowInsight[] {
  const insights: CashFlowInsight[] = [];
  if (!currentMonthTxs.length) return insights;

  const totalIncome = calculateMonthlyIncome(currentMonthTxs);
  const totalExpenses = calculateMonthlyExpenses(currentMonthTxs);
  const netSurplus = calculateNetCashFlow(totalIncome, totalExpenses);
  const fixedExpenses = calculateFixedExpensesFromTransactions(currentMonthTxs);

  // 1. Budget overrun or high usage alerts
  budgets.forEach((b) => {
    const prog = calculateBudgetProgress(b, currentMonthTxs);
    if (prog.status === 'over_budget') {
      const overBy = Math.abs(prog.variance);
      insights.push({
        id: `budget-over-${b.category}`,
        type: 'warning',
        title: `${b.category.toUpperCase()} OVER BUDGET`,
        message: `${b.category} spending (${formatINR(prog.actualSpent)}) has exceeded its monthly limit (${formatINR(prog.budgetLimit)}) by ${formatINR(overBy)}.`,
      });
    } else if (prog.status === 'approaching_limit') {
      insights.push({
        id: `budget-near-${b.category}`,
        type: 'info',
        title: `${b.category.toUpperCase()} AT ${prog.percentUsed}%`,
        message: `${b.category} is approaching limit at ${prog.percentUsed}% of budget with ${formatINR(prog.remaining)} remaining.`,
      });
    }
  });

  // 2. Fixed expense ratio insight
  if (totalExpenses > 0) {
    const fixedPct = Math.round((fixedExpenses / totalExpenses) * 100);
    insights.push({
      id: 'fixed-expense-ratio',
      type: fixedPct > 70 ? 'warning' : 'info',
      title: 'FIXED OBLIGATION LOAD',
      message: `Your fixed recurring commitments represent ${fixedPct}% of total monthly outlays (${formatINR(fixedExpenses)} of ${formatINR(totalExpenses)}).`,
    });
  }

  // 3. Cash flow surplus or deficit insight
  if (netSurplus < 0) {
    insights.push({
      id: 'net-deficit-alert',
      type: 'warning',
      title: 'OPERATIONAL DEFICIT',
      message: `Recorded expenses exceed income by ${formatINR(Math.abs(netSurplus))}. Immediate pause on discretionary spending recommended.`,
    });
  } else if (netSurplus > 0) {
    insights.push({
      id: 'net-surplus-info',
      type: 'success',
      title: 'CAPITAL SURPLUS PRESERVED',
      message: `You have preserved ${formatINR(netSurplus)} in liquid capital surplus after recorded expenditures.`,
    });
  }

  // 4. Month-over-month trend insights if previous month data exists
  if (previousMonthTxs.length > 0) {
    const prevExpenses = calculateMonthlyExpenses(previousMonthTxs);
    const expenseDiff = totalExpenses - prevExpenses;
    if (expenseDiff < 0) {
      insights.push({
        id: 'mom-expense-drop',
        type: 'success',
        title: 'LOWER SPENDING RATE',
        message: `Total spending is ${formatINR(Math.abs(expenseDiff))} lower than the prior month (${formatINR(prevExpenses)}).`,
      });
    } else if (expenseDiff > 0) {
      insights.push({
        id: 'mom-expense-rise',
        type: 'info',
        title: 'ELEVATED EXPENDITURES',
        message: `Total spending is ${formatINR(expenseDiff)} higher than the prior month.`,
      });
    }
  }

  return insights;
}

// ==========================================================================
// PHASE 3: SAVINGS MISSIONS & PLANNING CALCULATIONS
// ==========================================================================

/**
 * Calculates remaining capital required for a savings mission.
 * Clamped >= 0.
 */
export function calculateRemainingGoalAmount(targetAmount: number, currentAmount: number): number {
  const target = Math.max(0, Number(targetAmount) || 0);
  const current = Math.max(0, Number(currentAmount) || 0);
  return Math.max(0, target - current);
}

/**
 * Calculates progress percentage toward mission completion.
 * Clamped strictly between 0 and 100.
 */
export function calculateMissionProgress(currentAmount: number, targetAmount: number): number {
  const target = Math.max(0, Number(targetAmount) || 0);
  const current = Math.max(0, Number(currentAmount) || 0);
  if (target === 0) return 0;
  const ratio = (current / target) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
}

/**
 * Calculates calendar monthly contribution cycles between two dates (YYYY-MM-DD or YYYY-MM).
 */
export function calculateMonthsBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const startClean = startDateStr.length === 7 ? `${startDateStr}-01` : startDateStr;
  const endClean = endDateStr.length === 7 ? `${endDateStr}-01` : endDateStr;

  const start = new Date(startClean);
  const end = new Date(endClean);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end.getTime() < start.getTime()) return 0;

  const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, monthDiff);
}

/**
 * Calculates required monthly contribution to reach target by deadline.
 */
export function calculateRequiredMonthlyContribution(
  remainingAmount: number,
  targetDateStr: string,
  startDateStr: string = getLocalDateString()
): number {
  const remaining = Math.max(0, Number(remainingAmount) || 0);
  if (remaining === 0) return 0;

  const months = calculateMonthsBetween(startDateStr, targetDateStr);
  if (months <= 0) return remaining; // Due now or in the past
  return Math.ceil(remaining / months);
}

/**
 * Calculates projected completion date given a monthly contribution.
 */
export function calculateProjectedCompletionDate(
  remainingAmount: number,
  monthlyContribution: number,
  startDateStr: string = getLocalDateString()
): { completionDate: string; monthsRequired: number } {
  const remaining = Math.max(0, Number(remainingAmount) || 0);
  const contribution = Math.max(0, Number(monthlyContribution) || 0);

  if (remaining === 0) {
    return { completionDate: startDateStr.substring(0, 7), monthsRequired: 0 };
  }

  if (contribution === 0) {
    return { completionDate: 'Indefinite', monthsRequired: 999 };
  }

  const monthsRequired = Math.ceil(remaining / contribution);
  const start = new Date(startDateStr);
  const targetYear = start.getFullYear();
  const targetMonth = start.getMonth() + monthsRequired;
  const projected = new Date(targetYear, targetMonth, 1);

  const y = projected.getFullYear();
  const m = String(projected.getMonth() + 1).padStart(2, '0');
  return {
    completionDate: `${y}-${m}`,
    monthsRequired,
  };
}

/**
 * Calculates whether actual progress is AHEAD, ON SCHEDULE, or BEHIND schedule.
 */
export function calculateExpectedProgress(
  targetAmount: number,
  initialAmount: number,
  startDateStr: string,
  targetDateStr: string,
  currentDateStr: string = getLocalDateString(),
  currentAmount: number = 0
): MissionAheadBehind {
  const target = Math.max(0, Number(targetAmount) || 0);
  const initial = Math.max(0, Number(initialAmount) || 0);
  const actual = Math.max(0, Number(currentAmount) || 0);

  const startMs = new Date(startDateStr).getTime();
  const targetMs = new Date(targetDateStr).getTime();
  const currentMs = new Date(currentDateStr).getTime();

  const totalDuration = targetMs - startMs;
  const elapsed = currentMs - startMs;

  if (totalDuration <= 0) {
    return {
      status: actual >= target ? 'on_schedule' : 'behind',
      expectedAmount: target,
      actualAmount: actual,
      variance: actual - target,
    };
  }

  const progressRatio = Math.min(1, Math.max(0, elapsed / totalDuration));
  const expected = Math.round(initial + (target - initial) * progressRatio);
  const variance = actual - expected;

  // Tolerance threshold of ₹1000
  let status: MissionAheadBehind['status'] = 'on_schedule';
  if (variance >= 1000) {
    status = 'ahead';
  } else if (variance <= -1000) {
    status = 'behind';
  }

  return {
    status,
    expectedAmount: expected,
    actualAmount: actual,
    variance,
  };
}

/**
 * Deterministic Mission Feasibility Engine.
 * Evaluates whether required contribution fits within available monthly surplus
 * factoring in a configurable safety buffer (default 20%).
 */
export function calculateMissionFeasibility(params: {
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  isAsap?: boolean;
  availableSurplus: number;
  userSelectedContribution?: number;
  safetyBufferPct?: number;
}): MissionFeasibility {
  const {
    targetAmount,
    currentAmount,
    targetDate,
    isAsap = false,
    availableSurplus,
    userSelectedContribution,
    safetyBufferPct = 20,
  } = params;

  const remaining = calculateRemainingGoalAmount(targetAmount, currentAmount);
  const surplus = Math.max(0, Number(availableSurplus) || 0);
  const todayStr = getLocalDateString();

  // Completed check
  if (remaining === 0) {
    return {
      status: 'completed',
      requiredMonthlyContribution: 0,
      recommendedContribution: 0,
      availableSurplus: surplus,
      surplusAfterContribution: surplus,
      shortfall: 0,
      projectedCompletionDate: todayStr.substring(0, 7),
      explanation: 'Mission goal achieved. 100% of target capital deployed.',
    };
  }

  // Safe ceiling: surplus minus safety buffer (e.g. 80% of surplus)
  const safeCeiling = Math.floor(surplus * ((100 - safetyBufferPct) / 100));

  if (isAsap) {
    // ASAP mode: recommends safe contribution ceiling
    const recommended = safeCeiling > 0 ? safeCeiling : surplus;
    const { completionDate } = calculateProjectedCompletionDate(remaining, recommended);
    const status: MissionStatus = surplus > 0 ? 'on_track' : 'not_feasible';

    return {
      status,
      requiredMonthlyContribution: recommended,
      recommendedContribution: recommended,
      availableSurplus: surplus,
      surplusAfterContribution: Math.max(0, surplus - recommended),
      shortfall: surplus <= 0 ? remaining : 0,
      projectedCompletionDate: completionDate,
      explanation:
        surplus > 0
          ? `Allocating safe capacity of ${formatINR(recommended)}/month projects completion by ${formatMonthLabel(completionDate)}.`
          : 'Zero or negative cash flow detected. Cannot initialize ASAP mission without positive surplus.',
    };
  }

  // Check if deadline is in the past
  const monthsRemaining = calculateMonthsBetween(todayStr, targetDate);
  if (monthsRemaining <= 0 && targetDate < todayStr.substring(0, 7)) {
    const required = remaining;
    return {
      status: 'overdue',
      requiredMonthlyContribution: required,
      recommendedContribution: Math.min(surplus, required),
      availableSurplus: surplus,
      surplusAfterContribution: Math.max(0, surplus - required),
      shortfall: Math.max(0, required - surplus),
      projectedCompletionDate: targetDate.substring(0, 7),
      explanation: `Target date (${formatMonthLabel(targetDate.substring(0, 7))}) has lapsed with ${formatINR(remaining)} remaining. Adjust deadline or deploy remaining capital.`,
    };
  }

  // Fixed deadline calculation
  const required = calculateRequiredMonthlyContribution(remaining, targetDate, todayStr);
  const contribution = userSelectedContribution !== undefined && userSelectedContribution > 0
    ? userSelectedContribution
    : required;

  const surplusAfter = surplus - contribution;
  const shortfall = Math.max(0, contribution - surplus);
  const { completionDate } = calculateProjectedCompletionDate(remaining, contribution);

  let status: MissionStatus = 'on_track';
  let explanation = '';

  if (surplus <= 0) {
    status = 'not_feasible';
    explanation = 'Your operational cash flow currently has zero or negative available surplus. Eliminate deficits before allocating capital to new goals.';
  } else if (contribution > surplus) {
    status = 'not_feasible';
    explanation = `Required allocation (${formatINR(contribution)}/month) exceeds your available surplus (${formatINR(surplus)}/month) by ${formatINR(shortfall)}/month.`;
  } else if (contribution > safeCeiling) {
    status = 'tight';
    explanation = `This mission requires ${formatINR(contribution)}/month, leaving only ${formatINR(surplusAfter)} of your monthly surplus (below the ${safetyBufferPct}% safety buffer).`;
  } else if (userSelectedContribution && userSelectedContribution < required) {
    status = 'at_risk';
    explanation = `Selected allocation of ${formatINR(contribution)}/month falls short of the ${formatINR(required)}/month needed to meet the ${formatMonthLabel(targetDate.substring(0, 7))} target.`;
  } else {
    status = 'on_track';
    explanation = `Your required contribution is ${formatINR(contribution)}/month. Your verified monthly surplus of ${formatINR(surplus)} comfortably supports this target.`;
  }

  return {
    status,
    requiredMonthlyContribution: required,
    recommendedContribution: Math.min(safeCeiling > 0 ? safeCeiling : surplus, required),
    availableSurplus: surplus,
    surplusAfterContribution: surplusAfter,
    shortfall,
    projectedCompletionDate: completionDate,
    explanation,
  };
}

/**
 * Detects mission conflicts across all active missions when total required contributions exceed surplus.
 */
export function calculateMissionConflict(
  missions: SavingsMission[],
  availableSurplus: number
): MissionConflictSummary {
  const activeMissions = (missions || []).filter((m) => !m.isArchived && m.status !== 'completed');
  const totalRequiredContribution = activeMissions.reduce(
    (sum, m) => sum + Math.max(0, Number(m.monthlyContribution) || 0),
    0
  );

  const surplus = Math.max(0, Number(availableSurplus) || 0);
  const hasConflict = totalRequiredContribution > surplus && activeMissions.length > 0;
  const shortfall = hasConflict ? totalRequiredContribution - surplus : 0;

  const recommendations: string[] = [];
  if (hasConflict) {
    const highPriority = activeMissions.filter((m) => m.priority === 'high');
    const lowPriority = activeMissions.filter((m) => m.priority === 'low');
    const medPriority = activeMissions.filter((m) => m.priority === 'medium');

    if (highPriority.length > 0) {
      recommendations.push(`Safeguard High Priority targets: ${highPriority.map((m) => m.name).join(', ')}.`);
    }
    if (lowPriority.length > 0) {
      recommendations.push(`Reduce monthly contribution or extend deadlines on Low Priority targets: ${lowPriority.map((m) => m.name).join(', ')}.`);
    } else if (medPriority.length > 0) {
      recommendations.push(`Adjust contributions or stretch timelines on Medium Priority targets: ${medPriority.map((m) => m.name).join(', ')}.`);
    }
  }

  return {
    hasConflict,
    availableSurplus: surplus,
    totalRequiredContribution,
    shortfall,
    recommendations,
  };
}

/**
 * Calculates essential emergency fund requirement.
 */
export function calculateEmergencyFundTarget(
  essentialMonthlyExpenses: number,
  coverageMonths: number
): number {
  const expenses = Math.max(0, Number(essentialMonthlyExpenses) || 0);
  const months = Math.max(1, Number(coverageMonths) || 6);
  return expenses * months;
}

/**
 * Generates up to 4 comparative scenarios for a mission ("What If?").
 */
export function generateSavingsScenarios(
  remainingAmount: number,
  baselineContribution: number,
  targetDateStr: string
): SavingsScenario[] {
  const remaining = Math.max(0, Number(remainingAmount) || 0);
  const base = Math.max(1000, Number(baselineContribution) || 5000);
  const targetMonths = calculateMonthsBetween(getLocalDateString(), targetDateStr);

  const contributionLevels = [
    Math.max(1000, Math.round((base * 0.7) / 500) * 500),
    base,
    Math.round((base * 1.3) / 500) * 500,
    Math.round((base * 1.6) / 500) * 500,
  ];

  // Deduplicate
  const uniqueLevels = Array.from(new Set(contributionLevels));

  return uniqueLevels.map((contrib) => {
    const { completionDate, monthsRequired } = calculateProjectedCompletionDate(remaining, contrib);
    return {
      monthlyContribution: contrib,
      monthsRequired,
      projectedCompletionDate: completionDate,
      totalContribution: remaining,
      diffFromTargetMonths: targetMonths > 0 ? monthsRequired - targetMonths : 0,
    };
  });
}

// ==========================================================================
// PHASE 5: INVESTMENT PLANNER & SIP ENGINE CALCULATIONS
// Pure mathematical functions for investment readiness, capacity, compounding,
// asset allocation, and portfolio tracking.
// ==========================================================================

/**
 * Calculates standard SIP compounding future value using the monthly annuity formula:
 * FV = P * [((1 + r)^n - 1) / r] * (1 + r)
 * where r = annualRate / 12 and n = years * 12.
 * When r = 0, FV = P * n.
 */
export function calculateSIPFutureValue(
  monthlyInvestment: number,
  annualRatePct: number,
  durationYears: number
): SIPCalculationResult {
  const P = Math.max(0, Number(monthlyInvestment) || 0);
  const rawYears = Number(durationYears) || 0;
  const years = Math.min(100, Math.max(0, rawYears));
  const ratePct = Math.max(-100, Math.min(1000, Number(annualRatePct) || 0));
  const n = Math.round(years * 12);

  if (P === 0 || n === 0) {
    return {
      monthlyInvestment: P,
      annualRatePct: ratePct,
      durationYears: years,
      totalInvested: 0,
      estimatedGrowth: 0,
      illustrativeFinalValue: 0,
      wealthMultiplier: 1,
    };
  }

  const totalInvested = Math.round(P * n);

  if (ratePct <= 0) {
    return {
      monthlyInvestment: P,
      annualRatePct: ratePct,
      durationYears: years,
      totalInvested,
      estimatedGrowth: 0,
      illustrativeFinalValue: totalInvested,
      wealthMultiplier: 1,
    };
  }

  const r = ratePct / 100 / 12;
  // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const compoundFactor = Math.pow(1 + r, n);
  const fvRaw = P * ((compoundFactor - 1) / r) * (1 + r);
  const illustrativeFinalValue = Math.round(fvRaw);
  const estimatedGrowth = Math.max(0, illustrativeFinalValue - totalInvested);
  const wealthMultiplier = totalInvested > 0 ? Math.round((illustrativeFinalValue / totalInvested) * 100) / 100 : 1;

  return {
    monthlyInvestment: P,
    annualRatePct: ratePct,
    durationYears: years,
    totalInvested,
    estimatedGrowth,
    illustrativeFinalValue,
    wealthMultiplier,
  };
}

/**
 * Analyzes whether the user is financially prepared to invest.
 * Evaluates operational cash flow, emergency runway vs user target, and debt burden.
 */
export function calculateInvestmentReadiness(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  essentialMonthlyExpenses: number;
  currentEmergencyFund: number;
  emergencyTargetMonths?: number;
  outstandingDebt: number;
  creditCardDebt: number;
  monthlyDebtPayment: number;
  debtToIncomeRatio: number;
}): InvestmentReadinessEvaluation {
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    essentialMonthlyExpenses,
    currentEmergencyFund,
    emergencyTargetMonths = 6,
    outstandingDebt,
    creditCardDebt,
    monthlyDebtPayment,
    debtToIncomeRatio,
  } = params;

  const essentialExpenses = Math.max(0, Number(essentialMonthlyExpenses) || 0);
  const currentReserve = Math.max(0, Number(currentEmergencyFund) || 0);
  const targetMonths = Math.max(1, Number(emergencyTargetMonths) || 6);

  const coverageMonths = essentialExpenses > 0
    ? Math.round((currentReserve / essentialExpenses) * 10) / 10
    : 0;

  const targetRequired = essentialExpenses * targetMonths;
  const emergencyFundShortfall = Math.max(0, targetRequired - currentReserve);
  const hasHighCostDebt = creditCardDebt > 0;
  const isDeficit = monthlySurplus < 0 || monthlyExpenses > monthlyIncome;

  let status: InvestmentReadinessStatus = 'ready';
  let score = 90;
  let title = 'INVESTMENT FOUNDATION SECURED';
  let summary = '';
  const reasons: string[] = [];

  if (isDeficit) {
    status = 'not_ready';
    score = 20;
    title = 'OPERATIONAL DEFICIT DETECTED';
    summary = 'Your current monthly expenses exceed your income. Eliminate cash flow deficits before committing capital to market investments.';
    reasons.push(`Monthly cash flow is running in deficit by ${formatINR(Math.abs(monthlySurplus))}/month.`);
    reasons.push('Committing capital to volatile investments during a cash deficit significantly increases financial risk.');
  } else if (currentReserve <= 0 || coverageMonths < 1.0 || (targetRequired > 0 && emergencyFundShortfall > targetRequired * 0.5)) {
    status = 'building_foundation';
    score = 45;
    title = 'BUILDING EMERGENCY FOUNDATION';
    summary = `You have investable surplus, but your emergency reserve currently covers only ${coverageMonths} months (target: ${targetMonths} months).`;
    reasons.push(`Current emergency reserve of ${formatINR(currentReserve)} leaves a ${formatINR(emergencyFundShortfall)} shortfall toward your ${targetMonths}-month target.`);
    reasons.push('Building adequate liquid cash reserves protects you from having to liquidate market assets during unexpected downturns.');
  } else if (hasHighCostDebt || debtToIncomeRatio > 40) {
    status = 'partially_ready';
    score = 65;
    title = 'DEBT BURDEN REQUIRES PRIORITY';
    summary = hasHighCostDebt
      ? 'High-interest debt detected. Paying off revolving credit debt immediately stops destructive interest compounding.'
      : `Debt payments consume ${debtToIncomeRatio}% of your income, exceeding the recommended 40% threshold.`;
    if (hasHighCostDebt) {
      reasons.push(`High-cost revolving debt of ${formatINR(creditCardDebt)} carries severe compounding interest.`);
    }
    if (debtToIncomeRatio > 40) {
      reasons.push(`Debt service (${formatINR(monthlyDebtPayment)}/mo) represents ${debtToIncomeRatio}% of income.`);
    }
    reasons.push('Directing surplus to eliminate high-interest liabilities halts adverse compounding and frees up future cash flow.');
  } else {
    status = 'ready';
    score = 92;
    title = 'INVESTMENT FOUNDATION SECURED';
    summary = `Your emergency reserve covers ${coverageMonths} months of essential needs, cash flow is positive, and debt is managed. You are well-positioned for long-term investing.`;
    reasons.push(`Operational surplus of ${formatINR(monthlySurplus)}/month provides regular capital deployment capacity.`);
    reasons.push(`Liquid emergency runway meets baseline safety targets (${coverageMonths} months covered).`);
    reasons.push('Debt levels are sustainable, allowing steady long-term compounding.');
  }

  return {
    status,
    score,
    title,
    summary,
    reasons,
    essentialMonthlyExpenses: essentialExpenses,
    currentEmergencyFund: currentReserve,
    emergencyFundCoverageMonths: coverageMonths,
    emergencyFundTargetMonths: targetMonths,
    emergencyFundShortfall,
    outstandingDebt: Math.max(0, Number(outstandingDebt) || 0),
    monthlyDebtPayment: Math.max(0, Number(monthlyDebtPayment) || 0),
    debtToIncomeRatio: Math.max(0, Number(debtToIncomeRatio) || 0),
    hasHighCostDebt,
    monthlySurplus,
    isDeficit,
  };
}

/**
 * Calculates deterministic monthly investment capacity.
 * Surplus - Active Missions - Emergency Fund Allocation - Safety Buffer = Capacity.
 * Never invests 100% of surplus by default.
 */
export function calculateInvestmentCapacity(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  activeMissionsCommitment: number;
  emergencyFundShortfall: number;
  safetyBufferPercent?: number; // default 20%
}): InvestmentCapacityBreakdown {
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    activeMissionsCommitment,
    emergencyFundShortfall,
    safetyBufferPercent = 20,
  } = params;

  const surplus = Math.max(0, Number(monthlySurplus) || 0);
  const missions = Math.max(0, Number(activeMissionsCommitment) || 0);
  const shortfall = Math.max(0, Number(emergencyFundShortfall) || 0);
  const bufferPct = Math.max(5, Math.min(50, Number(safetyBufferPercent) || 20));

  // Buffer is calculated from the surplus
  const safetyBufferAmount = Math.round(surplus * (bufferPct / 100));

  // Flexible surplus remaining after missions
  const flexibleSurplus = Math.max(0, surplus - missions);

  // If emergency fund is incomplete, allocate a portion of flexible surplus (up to 40% or 1/12 of shortfall)
  const emergencyFundAllocation = shortfall > 0
    ? Math.min(Math.round(flexibleSurplus * 0.4), Math.round(shortfall / 12))
    : 0;

  // Potential capacity
  const potentialMonthlyCapacity = Math.max(
    0,
    surplus - missions - emergencyFundAllocation - safetyBufferAmount
  );

  const constraintReasons: string[] = [];
  if (missions > 0) {
    constraintReasons.push(`Active savings missions require ${formatINR(missions)}/month.`);
  }
  if (emergencyFundAllocation > 0) {
    constraintReasons.push(`Emergency fund build receives ${formatINR(emergencyFundAllocation)}/month.`);
  }
  constraintReasons.push(`A ${bufferPct}% flexible safety buffer (${formatINR(safetyBufferAmount)}/month) is preserved.`);

  const isConstrained = potentialMonthlyCapacity < surplus * 0.5;

  return {
    monthlyIncome: Math.max(0, Number(monthlyIncome) || 0),
    monthlyExpenses: Math.max(0, Number(monthlyExpenses) || 0),
    availableSurplus: surplus,
    activeMissionsCommitment: missions,
    emergencyFundAllocation,
    safetyBufferAmount,
    safetyBufferPercent: bufferPct,
    potentialMonthlyCapacity,
    isConstrained,
    constraintReasons,
  };
}

/**
 * Calculates a planning risk profile based on questionnaire answers.
 * Returns 'conservative', 'moderate', or 'aggressive' with factor breakdown.
 */
export function calculateRiskProfile(questionnaire: {
  horizon: InvestmentHorizon;
  riskReaction: RiskReaction;
  experience: InvestmentExperience;
  liquidityPreference: LiquidityPreference;
  investmentGoal: InvestmentGoal;
}): {
  riskProfile: InvestmentRiskProfile;
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  // 1. Horizon scoring (1 - 4)
  switch (questionnaire.horizon) {
    case 'short':
      score += 1;
      factors.push('Short investment horizon (<3 years) prioritizes capital preservation');
      break;
    case 'medium':
      score += 2;
      factors.push('Medium horizon (3-5 years) supports balanced capital growth');
      break;
    case 'long':
      score += 3;
      factors.push('Long horizon (5-10 years) allows weathering market volatility');
      break;
    case 'very_long':
      score += 4;
      factors.push('10+ year horizon provides maximum compounding duration');
      break;
  }

  // 2. Risk Reaction scoring (1 - 4)
  switch (questionnaire.riskReaction) {
    case 'sell_all':
      score += 1;
      factors.push('High sensitivity to temporary portfolio drawdowns');
      break;
    case 'sell_some':
      score += 2;
      factors.push('Moderate caution during market contractions');
      break;
    case 'hold':
      score += 3;
      factors.push('Disciplined willingness to hold through market cycles');
      break;
    case 'buy_more':
      score += 4;
      factors.push('Opportunistic mindset to accumulate during market dips');
      break;
  }

  // 3. Experience scoring (1 - 3)
  switch (questionnaire.experience) {
    case 'beginner':
      score += 1;
      factors.push('Beginner investor benefits from simple, diversified broad-market funds');
      break;
    case 'some_experience':
      score += 2;
      factors.push('Familiarity with market fluctuations');
      break;
    case 'experienced':
      score += 3;
      factors.push('Extensive investing background');
      break;
  }

  // 4. Liquidity Preference (1 - 4)
  switch (questionnaire.liquidityPreference) {
    case 'immediate':
      score += 1;
      factors.push('High liquidity need requires higher allocation to accessible instruments');
      break;
    case 'short_term':
      score += 2;
      factors.push('Anticipated near-term capital needs');
      break;
    case 'flexible':
      score += 3;
      factors.push('Flexible liquidity requirement');
      break;
    case 'locked':
      score += 4;
      factors.push('Capital can remain deployed for long periods without interruption');
      break;
  }

  let riskProfile: InvestmentRiskProfile = 'moderate';
  if (score <= 7) {
    riskProfile = 'conservative';
  } else if (score >= 12) {
    riskProfile = 'aggressive';
  } else {
    riskProfile = 'moderate';
  }

  return { riskProfile, score, factors };
}

/**
 * Generates an illustrative asset allocation plan.
 * Deterministic model matching risk profile, investment horizon, and monthly capacity.
 */
export function calculateAssetAllocation(
  capacity: number,
  riskProfile: InvestmentRiskProfile,
  horizon: InvestmentHorizon,
  readinessStatus: InvestmentReadinessStatus
): AssetAllocationPlan {
  const cap = Math.max(0, Number(capacity) || 0);

  let equityPct = 60;
  let debtPct = 25;
  let goldPct = 10;
  let reservePct = 5;

  // Horizon and readiness adjustments
  if (horizon === 'short' || readinessStatus === 'building_foundation' || readinessStatus === 'not_ready') {
    equityPct = 15;
    debtPct = 55;
    goldPct = 10;
    reservePct = 20;
  } else if (riskProfile === 'conservative') {
    equityPct = 35;
    debtPct = 45;
    goldPct = 10;
    reservePct = 10;
  } else if (riskProfile === 'aggressive') {
    if (horizon === 'very_long') {
      equityPct = 80;
      debtPct = 12;
      goldPct = 5;
      reservePct = 3;
    } else {
      equityPct = 75;
      debtPct = 15;
      goldPct = 7;
      reservePct = 3;
    }
  } else {
    // Moderate
    if (horizon === 'very_long') {
      equityPct = 65;
      debtPct = 20;
      goldPct = 10;
      reservePct = 5;
    } else {
      equityPct = 60;
      debtPct = 25;
      goldPct = 10;
      reservePct = 5;
    }
  }

  // Calculate currency amounts with rounding correction
  const eqAmt = Math.round(cap * (equityPct / 100));
  const debtAmt = Math.round(cap * (debtPct / 100));
  const goldAmt = Math.round(cap * (goldPct / 100));
  const reserveAmt = Math.max(0, cap - eqAmt - debtAmt - goldAmt);

  const items: AssetAllocationItem[] = [
    {
      categoryKey: 'equity',
      label: 'Long-term Equity Growth',
      subCategories: ['Broad-market Index Funds', 'Diversified Equity Mutual Funds'],
      percentage: equityPct,
      monthlyAmount: eqAmt,
      description: 'Core compounding engine aimed at beating inflation over extended horizons.',
      color: '#d4af37', // Gold
    },
    {
      categoryKey: 'debt',
      label: 'Lower-Volatility & Debt',
      subCategories: ['Debt / Fixed-Income Funds', 'Fixed Deposits', 'Govt-backed Instruments'],
      percentage: debtPct,
      monthlyAmount: debtAmt,
      description: 'Capital preservation and regular income that cushions market drawdowns.',
      color: '#3a86ff', // Blue
    },
    {
      categoryKey: 'gold',
      label: 'Gold / Diversification',
      subCategories: ['Sovereign Gold Bonds', 'Gold Mutual Funds / ETFs'],
      percentage: goldPct,
      monthlyAmount: goldAmt,
      description: 'Hedge against currency depreciation and geopolitical volatility.',
      color: '#e0a96d', // Amber Gold
    },
    {
      categoryKey: 'reserve',
      label: 'Strategic Reserve / Cash Buffer',
      subCategories: ['Liquid Funds', 'High-Yield Savings'],
      percentage: reservePct,
      monthlyAmount: reserveAmt,
      description: 'Highly liquid cushion for tactical flexibility and near-term deployment.',
      color: '#2a9d8f', // Teal
    },
  ];

  let explanation = '';
  if (horizon === 'short' || readinessStatus === 'building_foundation') {
    explanation = 'Given your near-term horizon or emergency reserve building phase, the plan prioritizes lower-volatility debt and liquid reserves over volatile equities to protect your capital.';
  } else if (riskProfile === 'aggressive') {
    explanation = 'Your long investment horizon and high risk tolerance support a growth-tilted equity allocation (75%+), with a modest debt and gold sleeve for baseline portfolio stability.';
  } else if (riskProfile === 'conservative') {
    explanation = 'Your allocation focuses primarily on capital stability and fixed income instruments (55%+ combined debt & reserve), with a disciplined 35% equity sleeve to outpace long-term inflation.';
  } else {
    explanation = 'A balanced 60/25/10/5 framework balances long-term compounding in broad-market equities with stability in fixed income and diversification in gold.';
  }

  return {
    riskProfile,
    horizon,
    monthlyCapacity: cap,
    items,
    explanation,
  };
}

/**
 * Evaluates user-tracked manual investment portfolio.
 */
export function calculatePortfolioAllocation(
  holdings: InvestmentHolding[]
): PortfolioAllocationSummary {
  const validHoldings = (holdings || []).filter((h) => h && !isNaN(h.investedAmount));
  const totalInvested = validHoldings.reduce((sum, h) => sum + Math.max(0, Number(h.investedAmount) || 0), 0);
  const currentValue = validHoldings.reduce((sum, h) => sum + Math.max(0, Number(h.currentValue) || 0), 0);
  const unrealizedGain = currentValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? Math.round((unrealizedGain / totalInvested) * 1000) / 10 : 0;

  const categoryMap = new Map<AssetCategory, number>();
  validHoldings.forEach((h) => {
    const val = Math.max(0, Number(h.currentValue) || 0);
    const existing = categoryMap.get(h.category) || 0;
    categoryMap.set(h.category, existing + val);
  });

  const categoryLabels: Record<AssetCategory, string> = {
    cash_savings: 'Cash & Liquid Savings',
    fixed_deposits: 'Fixed Deposits',
    govt_bonds: 'Government Bonds',
    debt_funds: 'Debt Mutual Funds',
    index_funds: 'Broad Index Funds',
    equity_mutual_funds: 'Active Equity Funds',
    gold: 'Gold & SGBs',
    strategic_reserve: 'Strategic Reserve',
  };

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([cat, amount]) => ({
    category: cat,
    label: categoryLabels[cat] || cat,
    amount,
    percentage: currentValue > 0 ? Math.round((amount / currentValue) * 1000) / 10 : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    totalInvested,
    currentValue,
    unrealizedGain,
    gainPercentage,
    holdingsCount: validHoldings.length,
    categoryBreakdown,
  };
}

/**
 * Compares current portfolio asset breakdown against the illustrative model allocation.
 */
export function calculateAllocationComparison(
  holdings: InvestmentHolding[],
  plan: AssetAllocationPlan
): CurrentVsTargetAllocation[] {
  const validHoldings = (holdings || []).filter((h) => h && !isNaN(h.currentValue));
  const totalCurrent = validHoldings.reduce((sum, h) => sum + Math.max(0, Number(h.currentValue) || 0), 0);

  // Group holdings into the 4 target buckets
  let currentEquity = 0;
  let currentDebt = 0;
  let currentGold = 0;
  let currentReserve = 0;

  validHoldings.forEach((h) => {
    const val = Math.max(0, Number(h.currentValue) || 0);
    switch (h.category) {
      case 'index_funds':
      case 'equity_mutual_funds':
        currentEquity += val;
        break;
      case 'fixed_deposits':
      case 'govt_bonds':
      case 'debt_funds':
        currentDebt += val;
        break;
      case 'gold':
        currentGold += val;
        break;
      case 'cash_savings':
      case 'strategic_reserve':
      default:
        currentReserve += val;
        break;
    }
  });

  const targetEquityItem = plan.items.find((i) => i.categoryKey === 'equity');
  const targetDebtItem = plan.items.find((i) => i.categoryKey === 'debt');
  const targetGoldItem = plan.items.find((i) => i.categoryKey === 'gold');
  const targetReserveItem = plan.items.find((i) => i.categoryKey === 'reserve');

  const targetEqPct = targetEquityItem?.percentage || 60;
  const targetDebtPct = targetDebtItem?.percentage || 25;
  const targetGoldPct = targetGoldItem?.percentage || 10;
  const targetReservePct = targetReserveItem?.percentage || 5;

  const currentEqPct = totalCurrent > 0 ? Math.round((currentEquity / totalCurrent) * 100) : 0;
  const currentDebtPct = totalCurrent > 0 ? Math.round((currentDebt / totalCurrent) * 100) : 0;
  const currentGoldPct = totalCurrent > 0 ? Math.round((currentGold / totalCurrent) * 100) : 0;
  const currentReservePct = totalCurrent > 0 ? Math.round((currentReserve / totalCurrent) * 100) : 0;

  return [
    {
      category: 'Long-term Equity',
      currentPct: currentEqPct,
      currentAmount: currentEquity,
      targetPct: targetEqPct,
      targetAmount: Math.round(totalCurrent * (targetEqPct / 100)),
      variancePct: currentEqPct - targetEqPct,
    },
    {
      category: 'Lower-Volatility & Debt',
      currentPct: currentDebtPct,
      currentAmount: currentDebt,
      targetPct: targetDebtPct,
      targetAmount: Math.round(totalCurrent * (targetDebtPct / 100)),
      variancePct: currentDebtPct - targetDebtPct,
    },
    {
      category: 'Gold / Diversification',
      currentPct: currentGoldPct,
      currentAmount: currentGold,
      targetPct: targetGoldPct,
      targetAmount: Math.round(totalCurrent * (targetGoldPct / 100)),
      variancePct: currentGoldPct - targetGoldPct,
    },
    {
      category: 'Strategic Reserve & Cash',
      currentPct: currentReservePct,
      currentAmount: currentReserve,
      targetPct: targetReservePct,
      targetAmount: Math.round(totalCurrent * (targetReservePct / 100)),
      variancePct: currentReservePct - targetReservePct,
    },
  ];
}

/**
 * Generates 3 illustrative projection scenarios: Conservative (8%), Balanced (11%), and Growth (14%).
 */
export function generateProjectionScenarios(
  monthlyContribution: number,
  durationYears: number,
  customRates?: { conservative?: number; balanced?: number; growth?: number }
): ProjectionScenario[] {
  const consRate = customRates?.conservative || 8;
  const balRate = customRates?.balanced || 11;
  const growthRate = customRates?.growth || 14;

  const cons = calculateSIPFutureValue(monthlyContribution, consRate, durationYears);
  const bal = calculateSIPFutureValue(monthlyContribution, balRate, durationYears);
  const growth = calculateSIPFutureValue(monthlyContribution, growthRate, durationYears);

  return [
    {
      id: 'conservative',
      label: 'Conservative',
      annualRatePct: consRate,
      monthlyContribution,
      durationYears,
      totalInvested: cons.totalInvested,
      projectedValue: cons.illustrativeFinalValue,
      projectedGain: cons.estimatedGrowth,
    },
    {
      id: 'balanced',
      label: 'Balanced',
      annualRatePct: balRate,
      monthlyContribution,
      durationYears,
      totalInvested: bal.totalInvested,
      projectedValue: bal.illustrativeFinalValue,
      projectedGain: bal.estimatedGrowth,
    },
    {
      id: 'growth',
      label: 'Growth',
      annualRatePct: growthRate,
      monthlyContribution,
      durationYears,
      totalInvested: growth.totalInvested,
      projectedValue: growth.illustrativeFinalValue,
      projectedGain: growth.estimatedGrowth,
    },
  ];
}

/**
 * Generates contribution comparison steps (₹5,000, ₹10,000, ₹15,000, ₹20,000, etc.)
 * showing the dramatic effect of increasing savings and SIP contributions.
 */
export function generateContributionComparisons(
  durationYears: number,
  annualRatePct: number = 11
): {
  monthlyAmount: number;
  totalInvested: number;
  projectedValue: number;
  estimatedGrowth: number;
}[] {
  const amounts = [5000, 10000, 15000, 20000, 25000, 30000];

  return amounts.map((amt) => {
    const res = calculateSIPFutureValue(amt, annualRatePct, durationYears);
    return {
      monthlyAmount: amt,
      totalInvested: res.totalInvested,
      projectedValue: res.illustrativeFinalValue,
      estimatedGrowth: res.estimatedGrowth,
    };
  });
}

// Re-export Phase 6 Advisor deterministic functions
export {
  calculateAffordability,
  calculateGoalPriorityScore,
  calculateScenarioImpact,
  calculateSavingsVsInvestmentGuidance,
  calculateMonthlyFinancialReview,
} from './advisorFinance';
export type {
  AffordabilityInput,
  PrioritizedMissionItem,
  ScenarioImpactResult,
  SaveVsInvestGuidance,
  MonthlyFinancialReviewData,
} from './advisorFinance';


