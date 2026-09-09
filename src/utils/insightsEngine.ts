// ==========================================================================
// FINANCE OS — PHASE 7: DETERMINISTIC INSIGHT & MONTHLY REVIEW ENGINE
// Pure, deterministic analytics detecting meaningful financial changes,
// spending anomalies, budget overruns, mission pacing, and milestones.
// Zero AI dependencies — 100% authoritative mathematics.
// ==========================================================================

import {
  Transaction,
  Budget,
  SavingsMission,
  FinancialSnapshot,
  FinancialInsight,
  InsightCategory,
  InsightSeverity,
  DataSufficiency,
  MonthlyReviewReport,
  InvestmentReadinessEvaluation,
  InvestmentCapacityBreakdown,
  AssetAllocationPlan,
  PortfolioAllocationSummary,
} from '../types/finance';
import { formatINR, getAdjacentMonth } from './finance';
import { calculateTransparentHealthScore } from './healthScoreEngine';

/**
 * Deterministically checks how many distinct historical calendar months exist in user transactions.
 * Strictly prevents hallucinating month-over-month comparisons when insufficient data exists.
 */
export function evaluateDataSufficiency(transactions: Transaction[]): DataSufficiency {
  const monthSet = new Set<string>();
  transactions.forEach((t) => {
    if (t.date && t.date.length >= 7) {
      monthSet.add(t.date.substring(0, 7));
    }
  });

  const availableMonths = Array.from(monthSet).sort().reverse();
  const totalRecordedMonths = availableMonths.length;
  const hasMoMComparison = totalRecordedMonths >= 2;
  const hasTrendAnalysis = totalRecordedMonths >= 3;

  let explanation = '';
  if (totalRecordedMonths === 0) {
    explanation = 'No transaction telemetry recorded yet. Record transactions to activate intelligence.';
  } else if (totalRecordedMonths === 1) {
    explanation = 'Baseline telemetry established (1 month recorded). Month-over-month deltas will unlock once a second month of records exists.';
  } else if (totalRecordedMonths === 2) {
    explanation = '2 months of verified records available. Month-over-month comparisons are active. Multi-month trend analysis unlocks with 3+ months.';
  } else {
    explanation = `Comprehensive historical dataset verified (${totalRecordedMonths} months). Multi-month trend tracking and spending anomaly detection active.`;
  }

  return {
    totalRecordedMonths,
    availableMonths,
    hasMoMComparison,
    hasTrendAnalysis,
    explanation,
  };
}

/**
 * Helper to safely compute percentage change without NaN or Infinity.
 */
export function safePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : current < 0 ? -100 : 0;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

// --------------------------------------------------------------------------
// 1. CASH FLOW INSIGHTS
// --------------------------------------------------------------------------
export function generateCashFlowInsights(
  currentSnapshot: FinancialSnapshot,
  previousSnapshot: FinancialSnapshot | null,
  monthKey: string,
  sufficiency: DataSufficiency
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  // Severe Deficit
  if (currentSnapshot.isDeficit) {
    insights.push({
      id: `CASH_FLOW:DEFICIT:${monthKey}`,
      category: 'CASH_FLOW',
      severity: 'CRITICAL',
      title: 'Operating Cash Flow Deficit',
      summary: `Your committed monthly expenses exceed income by ${formatINR(Math.abs(currentSnapshot.monthlySurplus))}.`,
      evidence: `Inflow: ${formatINR(currentSnapshot.totalIncome)} vs Outflow: ${formatINR(currentSnapshot.totalExpenses)}.`,
      metric: `-${formatINR(Math.abs(currentSnapshot.monthlySurplus))}`,
      recommendation: 'Pause non-essential discretionary expenditures immediately to prevent debt accumulation or liquidity depletion.',
      actionLabel: 'Review Cash Flow',
      actionTarget: { tab: 'cashflow' },
      priorityScore: 98,
      createdAt: new Date().toISOString(),
    });
  }

  // MoM Surplus Changes (Only if 2+ months exist)
  if (sufficiency.hasMoMComparison && previousSnapshot) {
    const surplusDelta = currentSnapshot.monthlySurplus - previousSnapshot.monthlySurplus;
    const surplusPct = safePercentageChange(currentSnapshot.monthlySurplus, previousSnapshot.monthlySurplus);

    if (surplusDelta > 3000 && !currentSnapshot.isDeficit) {
      insights.push({
        id: `CASH_FLOW:SURPLUS_EXPANDED:${monthKey}`,
        category: 'CASH_FLOW',
        severity: 'INFO',
        title: 'Monthly Cash Surplus Expanded',
        summary: `Your monthly surplus increased by ${formatINR(surplusDelta)} (+${surplusPct}%) compared to last month.`,
        evidence: `Previous: ${formatINR(previousSnapshot.monthlySurplus)} → Current: ${formatINR(currentSnapshot.monthlySurplus)}.`,
        metric: `+${formatINR(surplusDelta)}`,
        comparison: `+${surplusPct}% vs ${previousSnapshot ? 'prev month' : 'baseline'}`,
        recommendation: 'Consider allocating a portion of this liberated surplus toward your highest priority savings mission or SIP.',
        actionLabel: 'Deploy Surplus',
        actionTarget: { tab: 'missions' },
        priorityScore: 45,
        createdAt: new Date().toISOString(),
      });
    } else if (surplusDelta < -3000 && !currentSnapshot.isDeficit) {
      insights.push({
        id: `CASH_FLOW:SURPLUS_COMPRESSED:${monthKey}`,
        category: 'CASH_FLOW',
        severity: 'WATCH',
        title: 'Monthly Cash Surplus Compressed',
        summary: `Your flexible monthly surplus narrowed by ${formatINR(Math.abs(surplusDelta))} (${surplusPct}%) vs last month.`,
        evidence: `Previous: ${formatINR(previousSnapshot.monthlySurplus)} → Current: ${formatINR(currentSnapshot.monthlySurplus)}.`,
        metric: `${formatINR(surplusDelta)}`,
        comparison: `${surplusPct}% vs prev month`,
        recommendation: 'Inspect variable category spending to verify whether this compression was planned or driven by discretionary leakage.',
        actionLabel: 'Inspect Outflows',
        actionTarget: { tab: 'cashflow' },
        priorityScore: 65,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return insights;
}

// --------------------------------------------------------------------------
// 2. SPENDING & ANOMALY INSIGHTS
// --------------------------------------------------------------------------
export function generateSpendingInsights(
  currentMonthTxs: Transaction[],
  allTxs: Transaction[],
  monthKey: string,
  sufficiency: DataSufficiency
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const expenseTxs = currentMonthTxs.filter((t) => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpense === 0) return insights;

  // Category totals for current month
  const currentCatMap = new Map<string, number>();
  expenseTxs.forEach((t) => {
    currentCatMap.set(t.category, (currentCatMap.get(t.category) || 0) + t.amount);
  });

  // Top spending category concentration
  let topCat = '';
  let topAmt = 0;
  currentCatMap.forEach((amt, cat) => {
    if (amt > topAmt) {
      topAmt = amt;
      topCat = cat;
    }
  });

  const topPct = Math.round((topAmt / totalExpense) * 100);
  if (topPct >= 35 && topCat !== 'Housing') {
    insights.push({
      id: `SPENDING:CONCENTRATION:${monthKey}:${topCat}`,
      category: 'SPENDING',
      severity: 'WATCH',
      title: `High Spending Concentration in ${topCat}`,
      summary: `${topCat} represents ${topPct}% of your total outflow this month (${formatINR(topAmt)} of ${formatINR(totalExpense)}).`,
      evidence: `${topCat} consumed ${formatINR(topAmt)} across ${expenseTxs.filter((t) => t.category === topCat).length} transactions.`,
      metric: `${topPct}% of expenses`,
      recommendation: `Evaluate if ${topCat} expenses can be trimmed to release flexible capital for savings goals.`,
      actionLabel: `Review ${topCat}`,
      actionTarget: { tab: 'cashflow' },
      priorityScore: 60,
      createdAt: new Date().toISOString(),
    });
  }

  // Statistical Spending Anomaly (Requires >= 3 months history)
  if (sufficiency.hasTrendAnalysis) {
    const pastMonths = sufficiency.availableMonths.filter((m) => m !== monthKey).slice(0, 3);
    if (pastMonths.length >= 2) {
      currentCatMap.forEach((currentAmt, cat) => {
        let historicalTotal = 0;
        let monthsCounted = 0;

        pastMonths.forEach((pm) => {
          const pmExpenses = allTxs
            .filter((t) => t.type === 'expense' && t.category === cat && t.date.startsWith(pm))
            .reduce((s, t) => s + t.amount, 0);
          historicalTotal += pmExpenses;
          monthsCounted++;
        });

        const historicalAvg = monthsCounted > 0 ? historicalTotal / monthsCounted : 0;
        const diff = currentAmt - historicalAvg;

        if (historicalAvg > 2000 && diff >= 3000 && currentAmt >= historicalAvg * 1.35) {
          insights.push({
            id: `SPENDING:ANOMALY:${monthKey}:${cat}`,
            category: 'SPENDING',
            severity: 'WATCH',
            title: `Spending Anomaly Detected in ${cat}`,
            summary: `${cat} spending (${formatINR(currentAmt)}) is ${Math.round((diff / historicalAvg) * 100)}% higher than your recent average (${formatINR(Math.round(historicalAvg))}).`,
            evidence: `Current: ${formatINR(currentAmt)} vs Baseline Average: ${formatINR(Math.round(historicalAvg))} (+${formatINR(diff)} spike).`,
            metric: `+${formatINR(diff)} vs average`,
            comparison: `+${Math.round((diff / historicalAvg) * 100)}% above 3-month baseline`,
            recommendation: `Check whether this spike was a one-off expenditure or an ongoing cost increase.`,
            actionLabel: `Inspect ${cat}`,
            actionTarget: { tab: 'cashflow' },
            priorityScore: 72,
            createdAt: new Date().toISOString(),
          });
        }
      });
    }
  }

  return insights;
}

// --------------------------------------------------------------------------
// 3. BUDGET INSIGHTS
// --------------------------------------------------------------------------
export function generateBudgetInsights(
  budgets: Budget[],
  currentMonthTxs: Transaction[],
  allTxs: Transaction[],
  monthKey: string,
  sufficiency: DataSufficiency
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  if (budgets.length === 0) return insights;

  const currentCatMap = new Map<string, number>();
  currentMonthTxs
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      currentCatMap.set(t.category, (currentCatMap.get(t.category) || 0) + t.amount);
    });

  budgets.forEach((b) => {
    const spent = currentCatMap.get(b.category) || 0;
    const limit = b.monthlyLimit;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    if (spent > limit) {
      const overrun = spent - limit;

      // Check repeated overspending if multiple months exist
      let isRepeated = false;
      if (sufficiency.hasMoMComparison) {
        const prevMonth = sufficiency.availableMonths.find((m) => m !== monthKey);
        if (prevMonth) {
          const prevSpent = allTxs
            .filter((t) => t.type === 'expense' && t.category === b.category && t.date.startsWith(prevMonth))
            .reduce((sum, t) => sum + t.amount, 0);
          if (prevSpent > limit) {
            isRepeated = true;
          }
        }
      }

      insights.push({
        id: `BUDGET:${isRepeated ? 'REPEATED_OVERRUN' : 'OVERRUN'}:${monthKey}:${b.category}`,
        category: 'BUDGET',
        severity: 'WARNING',
        title: isRepeated ? `Repeated Budget Overrun: ${b.category}` : `Budget Cap Exceeded: ${b.category}`,
        summary: `You have spent ${formatINR(spent)} against the ${formatINR(limit)} monthly ceiling (${pct}% used, ${formatINR(overrun)} overrun).`,
        evidence: isRepeated
          ? `Ceiling exceeded in multiple consecutive recorded months.`
          : `Actual: ${formatINR(spent)} vs Budget Ceiling: ${formatINR(limit)}.`,
        metric: `+${formatINR(overrun)} over limit`,
        recommendation: isRepeated
          ? `Consider recalibrating the baseline budget limit for ${b.category} if costs have structurally shifted, or implement stricter controls.`
          : `Halt further discretionary spending in ${b.category} for the remainder of ${monthKey}.`,
        actionLabel: `Adjust ${b.category} Budget`,
        actionTarget: { tab: 'cashflow' },
        priorityScore: isRepeated ? 88 : 78,
        createdAt: new Date().toISOString(),
      });
    } else if (pct >= 85 && pct <= 100) {
      insights.push({
        id: `BUDGET:APPROACHING:${monthKey}:${b.category}`,
        category: 'BUDGET',
        severity: 'WATCH',
        title: `Budget Approaching Ceiling: ${b.category}`,
        summary: `You have used ${pct}% of your ${b.category} budget (${formatINR(spent)} of ${formatINR(limit)}). Remaining buffer: ${formatINR(limit - spent)}.`,
        evidence: `${formatINR(limit - spent)} buffer remaining.`,
        metric: `${pct}% used`,
        recommendation: `Pace upcoming ${b.category} purchases to avoid overrunning your ceiling before month-end.`,
        actionLabel: 'View Budget Status',
        actionTarget: { tab: 'cashflow' },
        priorityScore: 55,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return insights;
}

// --------------------------------------------------------------------------
// 4. SAVINGS MISSIONS & CONFLICT INSIGHTS
// --------------------------------------------------------------------------
export function generateMissionInsights(
  missions: SavingsMission[],
  monthlySurplus: number,
  monthKey: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const activeMissions = missions.filter((m) => !m.isArchived && m.status !== 'completed');

  if (activeMissions.length === 0) return insights;

  const totalMonthlyRequirement = activeMissions.reduce((acc, m) => acc + m.monthlyContribution, 0);

  // Critical Mission Conflict: Total requirements exceed surplus
  if (monthlySurplus > 0 && totalMonthlyRequirement > monthlySurplus) {
    const shortfall = totalMonthlyRequirement - monthlySurplus;
    insights.push({
      id: `MISSIONS:ALLOCATION_CONFLICT:${monthKey}`,
      category: 'MISSIONS',
      severity: 'WARNING',
      title: 'Mission Capital Allocation Conflict',
      summary: `Your ${activeMissions.length} active missions require ${formatINR(totalMonthlyRequirement)}/month, exceeding your verified monthly surplus (${formatINR(monthlySurplus)}) by ${formatINR(shortfall)}/month.`,
      evidence: `Required: ${formatINR(totalMonthlyRequirement)}/mo vs Available Surplus: ${formatINR(monthlySurplus)}/mo.`,
      metric: `-${formatINR(shortfall)}/mo deficit`,
      recommendation: 'Prioritize essential missions (like Emergency Fund) and extend the deadlines on secondary goals to prevent cash flow dilution.',
      actionLabel: 'Resolve Conflict in Advisor',
      actionTarget: { tab: 'advisor', query: 'Help me prioritize my conflicting savings missions.' },
      priorityScore: 85,
      createdAt: new Date().toISOString(),
    });
  }

  // At-risk missions
  activeMissions.forEach((m) => {
    if (m.status === 'at_risk' || m.status === 'not_feasible') {
      const remaining = Math.max(0, m.targetAmount - m.currentAmount);
      insights.push({
        id: `MISSIONS:AT_RISK:${m.id}:${monthKey}`,
        category: 'MISSIONS',
        severity: 'WATCH',
        title: `Mission At Risk: ${m.name}`,
        summary: `Mission "${m.name}" is falling behind the required contribution pacing needed to hit target by ${m.targetDate || 'deadline'}.`,
        evidence: `Current: ${formatINR(m.currentAmount)} of ${formatINR(m.targetAmount)} (${Math.round((m.currentAmount / m.targetAmount) * 100)}%). Required: ${formatINR(m.monthlyContribution)}/mo.`,
        metric: `${formatINR(remaining)} remaining`,
        recommendation: 'Use the Mission Simulator to test extending the deadline or adjusting monthly allocations.',
        actionLabel: `Inspect ${m.name}`,
        actionTarget: { tab: 'missions', subTargetId: m.id },
        priorityScore: 68,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return insights;
}

// --------------------------------------------------------------------------
// 5. EMERGENCY FUND INSIGHTS
// --------------------------------------------------------------------------
export function generateEmergencyFundInsights(
  snapshot: FinancialSnapshot,
  monthKey: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const runway = snapshot.emergencyFundMonths;

  if (runway === null) {
    insights.push({
      id: `EMERGENCY:DATA_REQUIRED:${monthKey}`,
      category: 'EMERGENCY_FUND',
      severity: 'INFO',
      title: 'Emergency Runway Baseline Needed',
      summary: 'Record your essential living expenses to calculate your precise liquidity runway in months.',
      evidence: 'Essential expense profile incomplete.',
      recommendation: 'Update your fixed essential expenses in Command Center or Settings.',
      actionLabel: 'Configure Profile',
      actionTarget: { tab: 'settings' },
      priorityScore: 30,
      createdAt: new Date().toISOString(),
    });
  } else if (runway < 1.0) {
    insights.push({
      id: `EMERGENCY:CRITICAL:${monthKey}`,
      category: 'EMERGENCY_FUND',
      severity: 'CRITICAL',
      title: 'Emergency Liquidity Severely Exposed',
      summary: `Your cash reserve covers only ${runway.toFixed(1)} months of essential living expenses (< 1.0 month buffer).`,
      evidence: `Current reserve: ${formatINR(snapshot.monthlySurplus * runway || 0)} (${runway.toFixed(1)} mo). Standard target: 3.0 - 6.0 months.`,
      metric: `${runway.toFixed(1)} months`,
      recommendation: 'Prioritize building an immediate 3-month cash buffer before scaling market investments or non-essential goals.',
      actionLabel: 'Create Emergency Mission',
      actionTarget: { tab: 'missions' },
      priorityScore: 92,
      createdAt: new Date().toISOString(),
    });
  } else if (runway < 3.0) {
    insights.push({
      id: `EMERGENCY:UNDER_TARGET:${monthKey}`,
      category: 'EMERGENCY_FUND',
      severity: 'WATCH',
      title: 'Emergency Buffer Below Target',
      summary: `Your emergency fund covers ${runway.toFixed(1)} months of essential expenses, below the recommended 3-6 month safety threshold.`,
      evidence: `Current runway: ${runway.toFixed(1)} months. Target: 6.0 months.`,
      metric: `${runway.toFixed(1)} mo covered`,
      recommendation: 'Direct a disciplined portion of your monthly surplus toward your liquid cash reserve.',
      actionLabel: 'Review Emergency Goal',
      actionTarget: { tab: 'missions' },
      priorityScore: 62,
      createdAt: new Date().toISOString(),
    });
  } else if (runway >= 6.0) {
    insights.push({
      id: `EMERGENCY:FORTRESS:${monthKey}`,
      category: 'MILESTONE',
      severity: 'INFO',
      title: 'Fortress Emergency Reserve Maintained',
      summary: `Outstanding liquidity resilience: Your cash buffer covers ${runway.toFixed(1)} months of essential living costs.`,
      evidence: `${runway.toFixed(1)} months fully funded. Liquidity risk is low.`,
      metric: `${runway.toFixed(1)} mo buffer`,
      recommendation: 'With your foundation fully secured, you can comfortably deploy surplus capital into long-term SIP compounding.',
      actionLabel: 'Inspect Investment Plan',
      actionTarget: { tab: 'assets' },
      priorityScore: 35,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// --------------------------------------------------------------------------
// 6. DEBT INSIGHTS
// --------------------------------------------------------------------------
export function generateDebtInsights(
  totalDebt: number,
  snapshot: FinancialSnapshot,
  hasHighCostDebt: boolean,
  monthKey: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (hasHighCostDebt) {
    insights.push({
      id: `DEBT:HIGH_COST_ALERT:${monthKey}`,
      category: 'DEBT',
      severity: 'WARNING',
      title: 'High-Cost Debt Drag Detected',
      summary: 'Revolving or high-interest debt compounds faster than long-term expected market returns.',
      evidence: `Active high-cost debt identified in financial position.`,
      metric: formatINR(totalDebt),
      recommendation: 'Prioritize aggressive repayment of high-cost debt before deploying fresh capital into market instruments.',
      actionLabel: 'Ask Advisor on Debt Payoff',
      actionTarget: { tab: 'advisor', query: 'Should I pay off my high cost debt before investing?' },
      priorityScore: 82,
      createdAt: new Date().toISOString(),
    });
  } else if (totalDebt === 0) {
    insights.push({
      id: `DEBT:ZERO_DEBT:${monthKey}`,
      category: 'MILESTONE',
      severity: 'INFO',
      title: 'Debt-Free Operational Posture',
      summary: 'You have zero recorded debt obligations. 100% of your earned cash flow is free of interest drag.',
      evidence: 'Total Liabilities: ₹0.',
      metric: '₹0 Debt',
      recommendation: 'Maintain disciplined spending to avoid taking on non-asset-backed personal liabilities.',
      priorityScore: 25,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// --------------------------------------------------------------------------
// 7. INVESTMENT INSIGHTS
// --------------------------------------------------------------------------
export function generateInvestmentInsights(
  readiness: InvestmentReadinessEvaluation,
  capacity: InvestmentCapacityBreakdown,
  monthKey: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (capacity.potentialMonthlyCapacity > 0 && readiness.status === 'ready') {
    insights.push({
      id: `INVESTMENTS:CAPACITY_ACTIVE:${monthKey}`,
      category: 'INVESTMENTS',
      severity: 'INFO',
      title: 'Monthly Investment Capacity Active',
      summary: `You have ${formatINR(capacity.potentialMonthlyCapacity)}/month in verified investment capacity after protecting mission allocations and safety reserves.`,
      evidence: `Surplus: ${formatINR(capacity.availableSurplus)} - Missions: ${formatINR(capacity.activeMissionsCommitment)} - Buffer: ${formatINR(capacity.safetyBufferAmount)} = ${formatINR(capacity.potentialMonthlyCapacity)}/mo.`,
      metric: `${formatINR(capacity.potentialMonthlyCapacity)}/mo`,
      recommendation: 'Set up disciplined recurring SIPs aligned with your illustrative asset allocation plan.',
      actionLabel: 'Review Asset Allocation',
      actionTarget: { tab: 'assets' },
      priorityScore: 40,
      createdAt: new Date().toISOString(),
    });
  } else if (readiness.status === 'building_foundation') {
    insights.push({
      id: `INVESTMENTS:FOUNDATION_PHASE:${monthKey}`,
      category: 'INVESTMENTS',
      severity: 'WATCH',
      title: 'Focus on Financial Foundation First',
      summary: 'Your investment readiness is in the foundation phase. Strengthening liquid cash reserves and clearing liabilities takes priority.',
      evidence: readiness.summary,
      recommendation: 'Ensure your emergency reserve covers at least 3 months before deploying significant capital into equity instruments.',
      actionLabel: 'Check Readiness Analysis',
      actionTarget: { tab: 'assets' },
      priorityScore: 50,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

// --------------------------------------------------------------------------
// MASTER GENERATE ALL INSIGHTS (WITH DEDUPLICATION & DISMISSAL)
// --------------------------------------------------------------------------
export function generateAllInsights(params: {
  snapshot: FinancialSnapshot;
  previousSnapshot: FinancialSnapshot | null;
  transactions: Transaction[];
  budgets: Budget[];
  missions: SavingsMission[];
  totalDebt: number;
  hasHighCostDebt: boolean;
  investmentReadiness: InvestmentReadinessEvaluation;
  investmentCapacity: InvestmentCapacityBreakdown;
  selectedMonth: string;
  dismissedIds?: string[];
}): FinancialInsight[] {
  const {
    snapshot,
    previousSnapshot,
    transactions,
    budgets,
    missions,
    totalDebt,
    hasHighCostDebt,
    investmentReadiness,
    investmentCapacity,
    selectedMonth,
    dismissedIds = [],
  } = params;

  const sufficiency = evaluateDataSufficiency(transactions);
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));

  const rawInsights: FinancialInsight[] = [
    ...generateCashFlowInsights(snapshot, previousSnapshot, selectedMonth, sufficiency),
    ...generateSpendingInsights(currentMonthTxs, transactions, selectedMonth, sufficiency),
    ...generateBudgetInsights(budgets, currentMonthTxs, transactions, selectedMonth, sufficiency),
    ...generateMissionInsights(missions, snapshot.monthlySurplus, selectedMonth),
    ...generateEmergencyFundInsights(snapshot, selectedMonth),
    ...generateDebtInsights(totalDebt, snapshot, hasHighCostDebt, selectedMonth),
    ...generateInvestmentInsights(investmentReadiness, investmentCapacity, selectedMonth),
  ];

  // Deduplicate by ID
  const uniqueMap = new Map<string, FinancialInsight>();
  rawInsights.forEach((item) => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });

  // Filter out dismissed insights and sort by priorityScore descending
  const dismissedSet = new Set(dismissedIds);
  const activeInsights = Array.from(uniqueMap.values())
    .filter((ins) => !dismissedSet.has(ins.id))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return activeInsights;
}

// --------------------------------------------------------------------------
// MONTHLY FINANCIAL REVIEW DETERMINISTIC CALCULATOR
// --------------------------------------------------------------------------
export function generateMonthlyReviewReport(params: {
  selectedMonth: string;
  transactions: Transaction[];
  budgets: Budget[];
  missions: SavingsMission[];
  snapshot: FinancialSnapshot;
  investmentReadiness: InvestmentReadinessEvaluation;
  investmentCapacity: InvestmentCapacityBreakdown;
  portfolioSummary: PortfolioAllocationSummary;
  totalDebt: number;
  hasHighCostDebt: boolean;
}): MonthlyReviewReport {
  const {
    selectedMonth,
    transactions,
    budgets,
    missions,
    snapshot,
    investmentReadiness,
    investmentCapacity,
    portfolioSummary,
    totalDebt,
    hasHighCostDebt,
  } = params;

  const sufficiency = evaluateDataSufficiency(transactions);
  const currentTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const currentExpenseTxs = currentTxs.filter((t) => t.type === 'expense');
  const currentIncomeTxs = currentTxs.filter((t) => t.type === 'income');

  const income = currentIncomeTxs.reduce((sum, t) => sum + t.amount, 0) || snapshot.totalIncome;
  const expenses = currentExpenseTxs.reduce((sum, t) => sum + t.amount, 0) || snapshot.totalExpenses;
  const netCashFlow = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round((netCashFlow / income) * 100)) : 0;

  // Previous month data if available
  const prevMonthKey = getAdjacentMonth(selectedMonth, -1);
  const prevTxs = transactions.filter((t) => t.date.startsWith(prevMonthKey));
  const prevExists = prevTxs.length > 0;

  let incomeChange: MonthlyReviewReport['incomeChange'] = undefined;
  let expensesChange: MonthlyReviewReport['expensesChange'] = undefined;
  let netCashFlowChange: MonthlyReviewReport['netCashFlowChange'] = undefined;
  let savingsRateChange: MonthlyReviewReport['savingsRateChange'] = undefined;

  const prevCategoryMap = new Map<string, number>();

  if (prevExists) {
    const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const prevExpenses = prevTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const prevNet = prevIncome - prevExpenses;
    const prevSavingsRate = prevIncome > 0 ? Math.max(0, Math.round((prevNet / prevIncome) * 100)) : 0;

    incomeChange = {
      absolute: income - prevIncome,
      percent: safePercentageChange(income, prevIncome),
    };
    expensesChange = {
      absolute: expenses - prevExpenses,
      percent: safePercentageChange(expenses, prevExpenses),
    };
    netCashFlowChange = {
      absolute: netCashFlow - prevNet,
      percent: safePercentageChange(netCashFlow, prevNet),
    };
    savingsRateChange = {
      absolute: savingsRate - prevSavingsRate,
    };

    prevTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        prevCategoryMap.set(t.category, (prevCategoryMap.get(t.category) || 0) + t.amount);
      });
  }

  // Top spending categories
  const currentCategoryMap = new Map<string, number>();
  currentExpenseTxs.forEach((t) => {
    currentCategoryMap.set(t.category, (currentCategoryMap.get(t.category) || 0) + t.amount);
  });

  const topSpendingCategories = Array.from(currentCategoryMap.entries())
    .map(([category, amount]) => {
      const prevAmt = prevCategoryMap.get(category) || 0;
      return {
        category,
        amount,
        percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
        changeVsPrev: prevExists ? amount - prevAmt : undefined,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Budget performance
  let totalBudget = 0;
  let totalSpent = 0;
  let underControlCount = 0;
  let approachingCount = 0;
  let overbudgetCount = 0;
  const overbudgetCategories: string[] = [];

  budgets.forEach((b) => {
    totalBudget += b.monthlyLimit;
    const spent = currentCategoryMap.get(b.category) || 0;
    totalSpent += spent;
    const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;

    if (spent > b.monthlyLimit) {
      overbudgetCount++;
      overbudgetCategories.push(b.category);
    } else if (pct >= 85) {
      approachingCount++;
    } else {
      underControlCount++;
    }
  });

  // Missions
  const activeMissions = missions.filter((m) => !m.isArchived && m.status !== 'completed');
  const onTrackCount = activeMissions.filter((m) => m.status === 'on_track').length;
  const atRiskCount = activeMissions.filter((m) => m.status === 'at_risk' || m.status === 'not_feasible').length;
  const completedThisMonth = missions.filter(
    (m) => m.status === 'completed' && m.completedAt && m.completedAt.startsWith(selectedMonth)
  ).length;

  // Transparent Health Score
  const healthScore = calculateTransparentHealthScore({
    totalIncome: income,
    totalExpenses: expenses,
    monthlySurplus: netCashFlow,
    savingsRate,
    emergencyFundMonths: snapshot.emergencyFundMonths,
    monthlyDebt: totalDebt > 0 ? Math.round(totalDebt * 0.03) : 0,
    hasHighCostDebt,
    totalBudgetsCount: budgets.length,
    budgetOverrunCount: overbudgetCount,
    activeMissionsCount: activeMissions.length,
    atRiskMissionsCount: atRiskCount,
    hasMissionConflict: activeMissions.reduce((acc, m) => acc + m.monthlyContribution, 0) > netCashFlow,
  });

  const highlights: string[] = [];
  const concerns: string[] = [];

  if (netCashFlow > 0) {
    highlights.push(`Generated a positive net surplus of ${formatINR(netCashFlow)}.`);
  }
  if (savingsRate >= 20) {
    highlights.push(`Disciplined capital retention rate of ${savingsRate}%.`);
  }
  if (onTrackCount > 0) {
    highlights.push(`${onTrackCount} mission(s) executing on schedule.`);
  }
  if (overbudgetCount === 0 && budgets.length > 0) {
    highlights.push(`All ${budgets.length} category budgets respected.`);
  }

  if (netCashFlow < 0) {
    concerns.push(`Net monthly cash flow deficit of ${formatINR(Math.abs(netCashFlow))}.`);
  }
  if (overbudgetCount > 0) {
    concerns.push(`Budget caps exceeded in: ${overbudgetCategories.join(', ')}.`);
  }
  if (atRiskCount > 0) {
    concerns.push(`${atRiskCount} savings mission(s) currently at risk.`);
  }
  if (hasHighCostDebt) {
    concerns.push('High-cost debt drag requires systematic liquidation.');
  }

  let recommendedFocus = 'Maintain consistent cash flow tracking and preserve current surplus.';
  if (concerns.length > 0) {
    if (netCashFlow < 0) {
      recommendedFocus = 'Eliminate discretionary spending to restore positive operational cash flow.';
    } else if (overbudgetCount > 0) {
      recommendedFocus = `Re-align spending in ${overbudgetCategories[0]} back within defined budget limit.`;
    } else if (atRiskCount > 0) {
      recommendedFocus = 'Recalibrate deadlines on at-risk savings missions.';
    }
  } else if (investmentCapacity.potentialMonthlyCapacity > 0) {
    recommendedFocus = `Deploy ${formatINR(investmentCapacity.potentialMonthlyCapacity)}/mo into diversified asset allocation.`;
  }

  return {
    month: selectedMonth,
    income,
    expenses,
    netCashFlow,
    savingsRate,
    investmentContribution: investmentCapacity.potentialMonthlyCapacity,
    previousMonth: prevExists ? prevMonthKey : undefined,
    incomeChange,
    expensesChange,
    netCashFlowChange,
    savingsRateChange,
    topSpendingCategories,
    budgetPerformance: {
      totalBudget,
      totalSpent,
      variance: totalBudget - totalSpent,
      underControlCount,
      approachingCount,
      overbudgetCount,
      overbudgetCategories,
    },
    missionProgress: {
      activeCount: activeMissions.length,
      onTrackCount,
      atRiskCount,
      completedThisMonthCount: completedThisMonth,
      totalSavedThisMonth: activeMissions.reduce((acc, m) => acc + m.monthlyContribution, 0),
    },
    investmentProgress: {
      monthlyCapacity: investmentCapacity.potentialMonthlyCapacity,
      readinessStatus: investmentReadiness.status,
      totalPortfolioValue: portfolioSummary.currentValue,
    },
    healthScore: {
      totalScore: healthScore.totalScore,
      tier: healthScore.tier,
      factors: healthScore.factors,
    },
    keyHighlights: highlights.length > 0 ? highlights : ['Baseline operations maintained.'],
    areasOfConcern: concerns.length > 0 ? concerns : ['No critical vulnerabilities detected.'],
    recommendedFocus,
  };
}
