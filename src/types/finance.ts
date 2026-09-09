// ==========================================================================
// FINANCE OS — DOMAIN TYPES & MODELS (PHASE 1, 2 & 3)
// ==========================================================================

export type CurrencyCode = 'INR' | 'USD' | 'EUR';
export type RiskPreference = 'conservative' | 'moderate' | 'aggressive';

export interface UserProfile {
  name: string;
  age: number;
  country: string;
  currency: CurrencyCode;
}

export interface IncomeProfile {
  monthlySalary: number;
  otherIncome: number;
}

export interface FixedExpenses {
  rent: number;
  utilities: number;
  internet: number;
  phone: number;
  insurance: number;
  emi: number;
  subscriptions: number;
  transportation: number;
  education: number;
  other: number;
}

export interface VariableExpenses {
  food: number;
  shopping: number;
  entertainment: number;
  travel: number;
  miscellaneous: number;
}

export interface ExpenseProfile {
  fixed: FixedExpenses;
  variable: VariableExpenses;
}

export interface DebtProfile {
  outstandingLoans: number;
  creditCardDebt: number;
}

export interface InvestmentProfile {
  currentInvestments: number;
}

export interface ExistingPosition {
  currentSavings: number;
  emergencyFund: number;
  existingInvestments: number;
  debt: DebtProfile;
}

export interface FinancialProfile {
  user: UserProfile;
  income: IncomeProfile;
  expenses: ExpenseProfile;
  position: ExistingPosition;
  priorities: string[];
  riskPreference: RiskPreference;
  hasCompletedOnboarding: boolean;
  updatedAt: string;
}

export interface FinancialSnapshot {
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  monthlySurplus: number;
  isDeficit: boolean;
  savingsRate: number;
  investmentRate: number;
  debtToIncomeRatio: number;
  expenseRatio: number;
  emergencyFundMonths: number | null; // null represents "DATA REQUIRED"
}

export interface HealthScoreFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'Strong' | 'Moderate' | 'Vulnerable' | 'Data Required';
  details: string;
}

export interface FinancialHealthEvaluation {
  totalScore: number; // 0 - 100
  tier: 'Critical' | 'Vulnerable' | 'Moderate' | 'Strong' | 'Elite';
  factors: HealthScoreFactor[];
  summary: string;
}

// --------------------------------------------------------------------------
// PHASE 2: TRANSACTION, BUDGET, AND CATEGORY TYPES
// --------------------------------------------------------------------------

export type TransactionType = 'income' | 'expense';
export type ExpenseType = 'fixed' | 'variable';
export type Essentiality = 'essential' | 'discretionary';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  recurring: boolean;
  expenseType?: ExpenseType;
  essentiality?: Essentiality;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// TransactionRecord backwards compatibility
export type TransactionRecord = Transaction;

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  month?: string; // YYYY-MM (if scoped to month, or undefined for recurring template)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
  isArchived: boolean;
}

export type BudgetStatus = 'under_control' | 'approaching_limit' | 'over_budget';

export interface BudgetProgress {
  category: string;
  budgetLimit: number;
  actualSpent: number;
  remaining: number;
  variance: number; // Positive = surplus / under budget, Negative = over budget
  percentUsed: number;
  status: BudgetStatus;
}

export interface CategorySpendingSummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthOverMonthChange {
  previousMonth: string;
  currentMonth: string;
  incomeChange: number;
  expenseChange: number;
  netCashFlowChange: number;
  savingsRateChange: number;
  categoryChanges: {
    category: string;
    currentAmount: number;
    previousAmount: number;
    change: number; // current - previous
  }[];
}

export interface CashFlowInsight {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
}

export interface MonthlyCashFlowSummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  isDeficit: boolean;
  savingsRate: number;
  fixedExpenses: number;
  variableExpenses: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  transactionCount: number;
}

// --------------------------------------------------------------------------
// PHASE 3: SAVINGS MISSIONS & PLANNING TYPES
// --------------------------------------------------------------------------

export type MissionPriority = 'high' | 'medium' | 'low';
export type MissionStatus = 'on_track' | 'tight' | 'at_risk' | 'not_feasible' | 'overdue' | 'completed';
export type SavingsContributionType = 'manual' | 'monthly' | 'bonus' | 'adjustment';

export interface SavingsContribution {
  id: string;
  missionId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  type: SavingsContributionType;
  createdAt: string;
}

export interface SavingsMission {
  id: string;
  missionCode: string; // e.g. "MISSION 0042"
  name: string;
  description?: string;
  category: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number; // Derived: initialAmount + sum(contributions)
  targetDate: string; // YYYY-MM-DD
  isAsap: boolean;
  monthlyContribution: number;
  priority: MissionPriority;
  status: MissionStatus;
  isArchived: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsScenario {
  monthlyContribution: number;
  monthsRequired: number;
  projectedCompletionDate: string;
  totalContribution: number;
  diffFromTargetMonths: number; // e.g. -2 means 2 months earlier
}

export interface MissionFeasibility {
  status: MissionStatus;
  requiredMonthlyContribution: number;
  recommendedContribution: number;
  availableSurplus: number;
  surplusAfterContribution: number;
  shortfall: number;
  projectedCompletionDate: string;
  explanation: string;
}

export interface MissionAheadBehind {
  status: 'ahead' | 'on_schedule' | 'behind';
  expectedAmount: number;
  actualAmount: number;
  variance: number; // actual - expected
}

export interface MissionConflictSummary {
  hasConflict: boolean;
  availableSurplus: number;
  totalRequiredContribution: number;
  shortfall: number;
  recommendations: string[];
}

// --------------------------------------------------------------------------
// PHASE 5: INVESTMENT PLANNER & SIP ENGINE TYPES
// --------------------------------------------------------------------------

export type InvestmentRiskProfile = 'conservative' | 'moderate' | 'aggressive';
export type InvestmentGoal = 'wealth' | 'retirement' | 'home' | 'education' | 'independence' | 'general' | 'custom';
export type InvestmentHorizon = 'short' | 'medium' | 'long' | 'very_long'; // <3 yrs, 3-5 yrs, 5-10 yrs, 10+ yrs
export type InvestmentExperience = 'beginner' | 'some_experience' | 'experienced';
export type LiquidityPreference = 'immediate' | 'short_term' | 'flexible' | 'locked';
export type InvestmentReadinessStatus = 'ready' | 'partially_ready' | 'building_foundation' | 'not_ready';
export type RiskReaction = 'sell_all' | 'sell_some' | 'hold' | 'buy_more';

export interface UserInvestmentProfile {
  riskProfile: InvestmentRiskProfile;
  investmentGoal: InvestmentGoal;
  customGoal?: string;
  horizon: InvestmentHorizon;
  experience: InvestmentExperience;
  liquidityPreference: LiquidityPreference;
  riskReaction: RiskReaction;
  emergencyTargetMonths: number; // e.g. 6 months
  safetyBufferPercent: number; // e.g. 20%
  updatedAt: string;
}

export type AssetCategory =
  | 'cash_savings'
  | 'fixed_deposits'
  | 'govt_bonds'
  | 'debt_funds'
  | 'index_funds'
  | 'equity_mutual_funds'
  | 'gold'
  | 'strategic_reserve';

export interface InvestmentHolding {
  id: string;
  name: string;
  category: AssetCategory;
  investedAmount: number;
  currentValue: number; // Value manually entered by user; not live market data
  purchaseDate: string; // YYYY-MM-DD
  notes?: string;
  expectedReturnPct?: number; // Optional planning assumption
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentCapacityBreakdown {
  monthlyIncome: number;
  monthlyExpenses: number;
  availableSurplus: number;
  activeMissionsCommitment: number;
  emergencyFundAllocation: number;
  safetyBufferAmount: number;
  safetyBufferPercent: number;
  potentialMonthlyCapacity: number;
  isConstrained: boolean;
  constraintReasons: string[];
}

export interface InvestmentReadinessEvaluation {
  status: InvestmentReadinessStatus;
  score: number; // 0 - 100
  title: string;
  summary: string;
  reasons: string[];
  essentialMonthlyExpenses: number;
  currentEmergencyFund: number;
  emergencyFundCoverageMonths: number;
  emergencyFundTargetMonths: number;
  emergencyFundShortfall: number;
  outstandingDebt: number;
  monthlyDebtPayment: number;
  debtToIncomeRatio: number;
  hasHighCostDebt: boolean;
  monthlySurplus: number;
  isDeficit: boolean;
}

export interface AssetAllocationItem {
  categoryKey: 'equity' | 'debt' | 'gold' | 'reserve';
  label: string;
  subCategories: string[];
  percentage: number;
  monthlyAmount: number;
  description: string;
  color: string;
}

export interface AssetAllocationPlan {
  riskProfile: InvestmentRiskProfile;
  horizon: InvestmentHorizon;
  monthlyCapacity: number;
  items: AssetAllocationItem[];
  explanation: string;
}

export interface SIPCalculationResult {
  monthlyInvestment: number;
  annualRatePct: number;
  durationYears: number;
  totalInvested: number;
  estimatedGrowth: number;
  illustrativeFinalValue: number;
  wealthMultiplier: number;
}

export interface ProjectionScenario {
  id: 'conservative' | 'balanced' | 'growth';
  label: string;
  annualRatePct: number;
  monthlyContribution: number;
  durationYears: number;
  totalInvested: number;
  projectedValue: number;
  projectedGain: number;
}

export interface CurrentVsTargetAllocation {
  category: string;
  currentPct: number;
  currentAmount: number;
  targetPct: number;
  targetAmount: number;
  variancePct: number; // positive = over target, negative = under target
}

export interface PortfolioAllocationSummary {
  totalInvested: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercentage: number;
  holdingsCount: number;
  categoryBreakdown: {
    category: AssetCategory;
    label: string;
    amount: number;
    percentage: number;
  }[];
}

// --------------------------------------------------------------------------
// PHASE 6: THE ADVISOR (GENERAL FINANCIAL INTELLIGENCE LAYER) TYPES
// --------------------------------------------------------------------------

export type AdvisorIntent =
  | 'budget_analysis'
  | 'spending_analysis'
  | 'affordability'
  | 'savings_goal'
  | 'goal_prioritization'
  | 'savings_vs_investing'
  | 'investment_planning'
  | 'investment_review'
  | 'emergency_fund'
  | 'debt_planning'
  | 'monthly_review'
  | 'financial_health'
  | 'explain_metric'
  | 'scenario_analysis'
  | 'general_finance_question'
  | 'unsupported_request';

export type AffordabilityStatus = 'COMFORTABLE' | 'MANAGEABLE' | 'TIGHT' | 'NOT_RECOMMENDED';

export interface AffordabilityAssessment {
  purchaseAmount: number;
  recurringMonthlyCost: number;
  monthlySurplus: number;
  committedMonthlyAllocations: number;
  safetyBuffer: number;
  remainingCapacity: number;
  affordabilityStatus: AffordabilityStatus;
  shortfall: number;
  impactOnGoalCompletion: string;
  keyFactors: string[];
}

export type AdvisorActionType =
  | 'NAVIGATE'
  | 'CREATE_MISSION'
  | 'EDIT_MISSION'
  | 'OPEN_MISSION'
  | 'OPEN_CASH_FLOW'
  | 'OPEN_INVESTMENTS'
  | 'OPEN_BUDGET'
  | 'RUN_SCENARIO'
  | 'ADJUST_SIP'
  | 'EXPLAIN_METRIC';


export interface AdvisorAction {
  type: AdvisorActionType;
  targetId?: string;
  label: string;
  payload?: Record<string, any>;
}

export interface AdvisorScenarioOption {
  label: string;
  description: string;
}

export interface AdvisorCalculationItem {
  label: string;
  value: string | number;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'advisor' | 'system';
  content: string;
  timestamp: string;
  intent?: AdvisorIntent;
  status?: 'READY' | 'NEEDS_CLARIFICATION' | 'FALLBACK' | 'ERROR';
  keyFacts?: string[];
  calculations?: AdvisorCalculationItem[];
  recommendations?: string[];
  warnings?: string[];
  scenarioOptions?: AdvisorScenarioOption[];
  actions?: AdvisorAction[];
}

export interface AdvisorScreenContext {
  page: 'dashboard' | 'cashflow' | 'missions' | 'assets' | 'settings' | 'advisor' | 'insights';
  selectedMission?: SavingsMission;
  selectedCategory?: string;
  selectedProjection?: any;
  metricToExplain?: string;
  metricValue?: string | number;
  initialQuery?: string;
}

export interface CompactAdvisorFinancialContext {
  financial_profile: {
    monthly_income: number;
    other_income: number;
    monthly_expenses: number;
    fixed_expenses: number;
    variable_expenses: number;
    essential_expenses: number;
    discretionary_expenses: number;
    monthly_surplus: number;
    savings_rate: number;
    investment_rate: number;
    debt: number;
    debt_to_income_ratio: number;
    emergency_fund: number;
    emergency_fund_months: number | null;
    current_investments: number;
  };
  savings: {
    active_missions_count: number;
    total_target: number;
    total_saved: number;
    total_remaining: number;
    monthly_requirement: number;
    has_conflicts: boolean;
    at_risk_missions: string[];
    active_missions: Array<{
      id: string;
      name: string;
      target: number;
      current: number;
      remaining: number;
      monthly: number;
      deadline: string;
      priority: string;
      feasibility: string;
    }>;
  };
  investments: {
    readiness: string;
    risk_profile: string;
    investment_capacity: number;
    current_allocation: Array<{ category: string; amount: number; percentage: number }>;
    recommended_allocation: Array<{ category: string; amount: number; percentage: number }>;
    current_holdings_count: number;
    total_portfolio_value: number;
  };
  budgets: {
    monthly_budgets_count: number;
    category_spending: Array<{ category: string; amount: number; percentage: number }>;
    overspending_categories: string[];
    budget_variances: Array<{ category: string; budget: number; spent: number; variance: number }>;
  };
  screen_context?: AdvisorScreenContext;
}

// --------------------------------------------------------------------------
// PHASE 7: INSIGHTS + MONTHLY REVIEW TYPES
// --------------------------------------------------------------------------

export type InsightCategory =
  | 'CASH_FLOW'
  | 'SPENDING'
  | 'BUDGET'
  | 'SAVINGS'
  | 'MISSIONS'
  | 'INVESTMENTS'
  | 'DEBT'
  | 'EMERGENCY_FUND'
  | 'FINANCIAL_HEALTH'
  | 'MILESTONE';

export type InsightSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface FinancialInsight {
  id: string; // Unique deduplication key e.g. "CASH_FLOW:SURPLUS_EXPANDED:2026-09"
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  summary: string;
  evidence: string;
  metric?: string;
  comparison?: string;
  recommendation: string;
  actionLabel?: string;
  actionTarget?: {
    tab: string;
    subTargetId?: string;
    query?: string;
  };
  priorityScore: number; // For deterministic ranking (0-100)
  createdAt: string;
  dismissed?: boolean;
  resolved?: boolean;
}

export interface DataSufficiency {
  totalRecordedMonths: number;
  availableMonths: string[]; // Sorted descending: ['2026-09', '2026-08', ...]
  hasMoMComparison: boolean; // true if >= 2 distinct months
  hasTrendAnalysis: boolean; // true if >= 3 distinct months
  explanation: string;
}

export interface MonthlyReviewReport {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  netCashFlow: number;
  savingsRate: number;
  investmentContribution: number;
  previousMonth?: string;
  incomeChange?: { absolute: number; percent: number };
  expensesChange?: { absolute: number; percent: number };
  netCashFlowChange?: { absolute: number; percent: number };
  savingsRateChange?: { absolute: number };
  topSpendingCategories: Array<{ category: string; amount: number; percentage: number; changeVsPrev?: number }>;
  budgetPerformance: {
    totalBudget: number;
    totalSpent: number;
    variance: number;
    underControlCount: number;
    approachingCount: number;
    overbudgetCount: number;
    overbudgetCategories: string[];
  };
  missionProgress: {
    activeCount: number;
    onTrackCount: number;
    atRiskCount: number;
    completedThisMonthCount: number;
    totalSavedThisMonth: number;
  };
  investmentProgress: {
    monthlyCapacity: number;
    readinessStatus: string;
    totalPortfolioValue: number;
  };
  healthScore: {
    totalScore: number;
    tier: string;
    factors: HealthScoreFactor[];
  };
  keyHighlights: string[];
  areasOfConcern: string[];
  recommendedFocus: string;
}

export interface MonthlyReviewAIOutput {
  headline: string;
  executiveSummary: string;
  topStrength: string;
  primaryVulnerability: string;
  strategicNextSteps: string[];
  coachAdvice: string;
}



