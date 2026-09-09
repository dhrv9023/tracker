// ==========================================================================
// FINANCE OS — PHASE 6: DETERMINISTIC ADVISOR CALCULATION ENGINE
// Authoritative calculation layer for affordability, scenario modeling,
// goal prioritization, and monthly diagnostic reviews.
// Zero AI dependencies — pure deterministic mathematics.
// ==========================================================================

import {
  AffordabilityAssessment,
  AffordabilityStatus,
  SavingsMission,
  FinancialSnapshot,
  Transaction,
  Budget,
  InvestmentReadinessEvaluation,
  InvestmentCapacityBreakdown,
} from '../types/finance';
import { formatINR } from './finance';

export interface AffordabilityInput {
  purchaseAmount: number;
  recurringMonthlyCost?: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  activeMissionRequirement: number;
  investmentCapacity: number;
  debtObligation?: number;
  safetyBuffer?: number;
  currentSavings?: number;
  emergencyFundMonths?: number | null;
}

/**
 * Calculates deterministic affordability for a proposed purchase or recurring expense commitment.
 * Formula:
 * committed = activeMissionRequirement + investmentCapacity + debtObligation
 * uncommittedSurplus = monthlySurplus - committed
 * discretionaryCapacity = Math.max(0, uncommittedSurplus - safetyBuffer)
 */
export function calculateAffordability(input: AffordabilityInput): AffordabilityAssessment {
  const purchaseAmount = Math.max(0, input.purchaseAmount);
  const recurringMonthlyCost = Math.max(0, input.recurringMonthlyCost || 0);
  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const monthlySurplus = input.monthlySurplus;

  const debtObligation = Math.max(0, input.debtObligation || 0);
  const committedMonthlyAllocations = Math.max(
    0,
    input.activeMissionRequirement + input.investmentCapacity + debtObligation
  );

  // Safety buffer default is 10% of monthly income or 20% of surplus, whichever is conservative
  const defaultSafetyBuffer = Math.round(
    monthlyIncome > 0 ? Math.min(monthlyIncome * 0.1, Math.max(2000, monthlySurplus * 0.2)) : 2000
  );
  const safetyBuffer = input.safetyBuffer !== undefined ? Math.max(0, input.safetyBuffer) : defaultSafetyBuffer;

  const uncommittedSurplus = monthlySurplus - committedMonthlyAllocations;
  const availableDiscretionaryCapacity = Math.max(0, uncommittedSurplus - safetyBuffer);

  let affordabilityStatus: AffordabilityStatus = 'NOT_RECOMMENDED';
  let shortfall = 0;
  let remainingCapacity = 0;
  let impactOnGoalCompletion = '';
  const keyFactors: string[] = [];

  if (recurringMonthlyCost > 0) {
    // Evaluating a recurring commitment (e.g. higher rent, expensive subscription, new loan EMI)
    remainingCapacity = availableDiscretionaryCapacity - recurringMonthlyCost;

    if (recurringMonthlyCost <= availableDiscretionaryCapacity * 0.5) {
      affordabilityStatus = 'COMFORTABLE';
      impactOnGoalCompletion = 'Zero negative impact on existing savings missions and investment plans.';
    } else if (recurringMonthlyCost <= availableDiscretionaryCapacity) {
      affordabilityStatus = 'MANAGEABLE';
      impactOnGoalCompletion = 'Feasible within surplus, but limits future unallocated cash flow buffer.';
    } else if (recurringMonthlyCost <= uncommittedSurplus) {
      affordabilityStatus = 'TIGHT';
      shortfall = recurringMonthlyCost - availableDiscretionaryCapacity;
      impactOnGoalCompletion = 'Eats into your safety buffer. Unexpected expenses may create cash flow tension.';
    } else {
      affordabilityStatus = 'NOT_RECOMMENDED';
      shortfall = recurringMonthlyCost - uncommittedSurplus;
      impactOnGoalCompletion = `Exceeds available monthly capacity by ${formatINR(shortfall)}/mo. Would require pausing active missions or running a deficit.`;
    }

    keyFactors.push(`Recurring monthly impact: ${formatINR(recurringMonthlyCost)}/month`);
    keyFactors.push(`Committed monthly missions & SIPs: ${formatINR(committedMonthlyAllocations)}/month`);
    keyFactors.push(`Safety buffer reserved: ${formatINR(safetyBuffer)}/month`);
  } else {
    // Evaluating a one-time purchase (e.g. ₹20,000 phone, ₹80,000 laptop)
    remainingCapacity = availableDiscretionaryCapacity - purchaseAmount;

    if (monthlySurplus <= 0) {
      affordabilityStatus = 'NOT_RECOMMENDED';
      shortfall = purchaseAmount;
      impactOnGoalCompletion = 'Cash flow is currently in deficit or breakeven. Discretionary capital expenditure is not advised.';
    } else if (purchaseAmount <= availableDiscretionaryCapacity) {
      // Can be completely absorbed from a single month's flexible unallocated surplus
      affordabilityStatus = 'COMFORTABLE';
      impactOnGoalCompletion = `Can be completely absorbed from this month's flexible capacity (${formatINR(availableDiscretionaryCapacity)}) without disturbing goals.`;
    } else if (availableDiscretionaryCapacity > 0 && purchaseAmount <= availableDiscretionaryCapacity * 3) {
      // Can be financed/saved within 2-3 months of flexible surplus
      const monthsNeeded = Math.ceil(purchaseAmount / availableDiscretionaryCapacity);
      affordabilityStatus = 'MANAGEABLE';
      impactOnGoalCompletion = `Can be accumulated in ~${monthsNeeded} months of discretionary savings (${formatINR(availableDiscretionaryCapacity)}/mo) without slowing current missions.`;
    } else if (uncommittedSurplus > 0 && purchaseAmount <= uncommittedSurplus * 3) {
      // Possible if safety buffer is compressed
      affordabilityStatus = 'TIGHT';
      shortfall = purchaseAmount - availableDiscretionaryCapacity;
      impactOnGoalCompletion = 'Achievable only by reducing emergency safety buffers or temporarily scaling back investment contributions.';
    } else {
      affordabilityStatus = 'NOT_RECOMMENDED';
      shortfall = Math.max(0, purchaseAmount - availableDiscretionaryCapacity);
      impactOnGoalCompletion = `Purchase amount (${formatINR(purchaseAmount)}) significantly exceeds current discretionary capacity (${formatINR(availableDiscretionaryCapacity)}). High risk of derailing active missions.`;
    }

    keyFactors.push(`Target purchase cost: ${formatINR(purchaseAmount)}`);
    keyFactors.push(`Immediate flexible monthly capacity: ${formatINR(availableDiscretionaryCapacity)}`);
    keyFactors.push(`Active mission allocations: ${formatINR(committedMonthlyAllocations)}/month`);
  }

  return {
    purchaseAmount,
    recurringMonthlyCost,
    monthlySurplus,
    committedMonthlyAllocations,
    safetyBuffer,
    remainingCapacity,
    affordabilityStatus,
    shortfall: Math.max(0, shortfall),
    impactOnGoalCompletion,
    keyFactors,
  };
}

export interface PrioritizedMissionItem {
  mission: SavingsMission;
  priorityScore: number;
  rank: number;
  urgencyDays: number;
  remainingAmount: number;
  feasibilityBadge: string;
  rationale: string;
}

/**
 * Deterministically calculates priority scores and ranking for active savings missions.
 * Evaluates category criticality (emergency fund = priority), deadline proximity,
 * progress momentum, and feasibility status.
 */
export function calculateGoalPriorityScore(
  missions: SavingsMission[],
  _monthlySurplus: number,
  emergencyCoverageMonths: number | null
): PrioritizedMissionItem[] {
  const activeMissions = missions.filter((m) => !m.isArchived && m.status !== 'completed');
  if (activeMissions.length === 0) return [];

  const now = new Date();

  const scored = activeMissions.map((m) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Emergency Fund weighting
    const isEmergencyCategory =
      m.category.toLowerCase().includes('emergency') || m.name.toLowerCase().includes('emergency');
    if (isEmergencyCategory) {
      score += 40;
      reasons.push('Vital liquidity shield for financial survival');
      if (emergencyCoverageMonths === null || emergencyCoverageMonths < 3) {
        score += 20; // Critical priority if runway is below 3 months
        reasons.push('Emergency runway is critically under target');
      }
    }

    // 2. Explicit User Priority
    if (m.priority === 'high') {
      score += 20;
      reasons.push('Marked as high priority by operative');
    } else if (m.priority === 'medium') {
      score += 10;
    }

    // 3. Deadline Urgency
    const deadline = new Date(m.targetDate);
    const diffTime = deadline.getTime() - now.getTime();
    const urgencyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (urgencyDays <= 90 && urgencyDays > 0) {
      score += 20;
      reasons.push(`Target deadline is within ${urgencyDays} days`);
    } else if (urgencyDays <= 180 && urgencyDays > 0) {
      score += 10;
      reasons.push(`Target deadline in ~${Math.ceil(urgencyDays / 30)} months`);
    } else if (urgencyDays <= 0) {
      score += 15;
      reasons.push('Mission is overdue / immediate action required');
    }

    // 4. Progress Momentum (close to finish line gets boost to clear cognitive load)
    const remainingAmount = Math.max(0, m.targetAmount - m.currentAmount);
    const progressPct = m.targetAmount > 0 ? (m.currentAmount / m.targetAmount) * 100 : 0;
    if (progressPct >= 80) {
      score += 15;
      reasons.push(`Close to completion (${progressPct.toFixed(0)}% funded) — quick win`);
    } else if (progressPct >= 50) {
      score += 8;
    }

    // 5. Feasibility safeguard
    let feasibilityBadge = 'ON TRACK';
    if (m.status === 'at_risk' || m.status === 'not_feasible') {
      feasibilityBadge = 'AT RISK';
      score += 5; // Needs attention
      reasons.push('Requires allocation recalibration to avoid failure');
    } else if (m.status === 'tight') {
      feasibilityBadge = 'TIGHT';
    }

    return {
      mission: m,
      priorityScore: Math.min(100, score),
      rank: 0,
      urgencyDays: Math.max(0, urgencyDays),
      remainingAmount,
      feasibilityBadge,
      rationale: reasons.join(' • ') || 'Standard progression pacing',
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

export interface ScenarioImpactResult {
  scenarioType: string;
  label: string;
  baselineSurplus: number;
  newSurplus: number;
  surplusDelta: number;
  baselineSavingsRate: number;
  newSavingsRate: number;
  impactSummary: string;
  tradeoffs: string[];
}

/**
 * Calculates exact mathematical impact of hypothetical financial what-if scenarios.
 * E.g. "+₹10k salary", "+₹5k rent", "+₹5k savings", "pause investing for 3 months".
 */
export function calculateScenarioImpact(
  scenarioType: 'income_change' | 'expense_change' | 'savings_boost' | 'pause_investing',
  delta: number,
  snapshot: FinancialSnapshot,
  investmentCapacity: number
): ScenarioImpactResult {
  const currentIncome = snapshot.totalIncome;
  const currentExpenses = snapshot.totalExpenses;
  const currentSurplus = snapshot.monthlySurplus;
  const currentSavingsRate = snapshot.savingsRate;

  let newIncome = currentIncome;
  let newExpenses = currentExpenses;
  let newSurplus = currentSurplus;
  let label = '';
  let impactSummary = '';
  const tradeoffs: string[] = [];

  switch (scenarioType) {
    case 'income_change': {
      newIncome = Math.max(0, currentIncome + delta);
      newSurplus = newIncome - newExpenses;
      label = `${delta >= 0 ? '+' : ''}${formatINR(delta)} Monthly Income`;
      if (delta >= 0) {
        impactSummary = `Your monthly surplus expands from ${formatINR(currentSurplus)} to ${formatINR(newSurplus)} (+${formatINR(delta)}/mo).`;
        tradeoffs.push(`Enables deploying up to ${formatINR(delta * 0.7)} into long-term SIPs while preserving ${formatINR(delta * 0.3)} as additional cash cushion.`);
        tradeoffs.push('Avoid lifestyle creep: keep fixed expenses anchored to current levels.');
      } else {
        impactSummary = `Your monthly surplus compresses from ${formatINR(currentSurplus)} to ${formatINR(newSurplus)} (${formatINR(delta)}/mo).`;
        tradeoffs.push('Requires scaling back discretionary spending or pausing low-priority savings missions to prevent deficit.');
      }
      break;
    }
    case 'expense_change': {
      newExpenses = Math.max(0, currentExpenses + delta);
      newSurplus = newIncome - newExpenses;
      label = `${delta >= 0 ? '+' : ''}${formatINR(delta)} Monthly Expenses`;
      if (delta > 0) {
        impactSummary = `Expenses increase to ${formatINR(newExpenses)}, shrinking surplus to ${formatINR(newSurplus)} (-${formatINR(delta)}/mo).`;
        tradeoffs.push(`Directly reduces monthly uncommitted capacity by ${formatINR(delta)}.`);
        tradeoffs.push('May require extending target dates for non-essential savings missions.');
      } else {
        impactSummary = `Cutting expenses by ${formatINR(Math.abs(delta))} boosts monthly surplus to ${formatINR(newSurplus)}.`;
        tradeoffs.push(`Accelerates mission completion timelines by liberating ${formatINR(Math.abs(delta))}/mo in fresh capital.`);
      }
      break;
    }
    case 'savings_boost': {
      label = `+${formatINR(delta)} Additional Monthly Savings`;
      newSurplus = currentSurplus;
      impactSummary = `Committing an extra ${formatINR(delta)}/mo accelerates savings missions. In 1 year, this accumulates ${formatINR(delta * 12)} in additional capital.`;
      tradeoffs.push(`Reduces unallocated monthly discretionary cushion by ${formatINR(delta)}.`);
      tradeoffs.push(`Shortens goal horizons across active missions significantly.`);
      break;
    }
    case 'pause_investing': {
      label = `Pause Monthly SIPs (${formatINR(investmentCapacity)}/mo)`;
      newSurplus = currentSurplus;
      const pausedAmount = investmentCapacity * (delta || 3);
      impactSummary = `Pausing SIPs for ${delta || 3} months frees ${formatINR(investmentCapacity)}/mo (${formatINR(pausedAmount)} total) for urgent liquidity or high-cost debt clearance.`;
      tradeoffs.push('Provides immediate cash relief for emergency reserve buildup or debt payoff.');
      tradeoffs.push('Sacrifices 3 months of dollar-cost averaging and long-term compounding growth.');
      break;
    }
  }

  const newSavingsRate = newIncome > 0 ? Math.max(0, Math.round((newSurplus / newIncome) * 100)) : 0;
  const surplusDelta = newSurplus - currentSurplus;

  return {
    scenarioType,
    label,
    baselineSurplus: currentSurplus,
    newSurplus,
    surplusDelta,
    baselineSavingsRate: currentSavingsRate,
    newSavingsRate,
    impactSummary,
    tradeoffs,
  };
}

export interface SaveVsInvestGuidance {
  primaryRecommendation: 'BUILD_EMERGENCY_RESERVE' | 'PAY_OFF_HIGH_COST_DEBT' | 'SPLIT_BALANCED' | 'MAXIMIZE_INVESTMENTS';
  headline: string;
  rationale: string;
  recommendedSplit: {
    savingsPct: number;
    investmentPct: number;
    savingsAmount: number;
    investmentAmount: number;
  };
  keyFactors: string[];
  rulesApplied: string[];
}

/**
 * Deterministically evaluates whether new or surplus capital should be directed toward
 * cash savings (liquidity/missions) vs market investments (SIPs/growth).
 */
export function calculateSavingsVsInvestmentGuidance(
  surplus: number,
  emergencyMonths: number | null,
  hasHighCostDebt: boolean,
  activeMissionsCommitment: number,
  investmentCapacity: number,
  readinessStatus: string
): SaveVsInvestGuidance {
  const safeSurplus = Math.max(0, surplus);
  const safeEmergencyMonths = emergencyMonths ?? 0;

  // Rule 1: High cost debt exists
  if (hasHighCostDebt) {
    return {
      primaryRecommendation: 'PAY_OFF_HIGH_COST_DEBT',
      headline: 'Clear High-Cost Debt Before Expanding Market Exposure',
      rationale: 'High-interest debt (e.g. credit cards or personal loans) compounds at 18-40% APR, exceeding long-term expected market returns.',
      recommendedSplit: {
        savingsPct: 80,
        investmentPct: 20,
        savingsAmount: Math.round(safeSurplus * 0.8),
        investmentAmount: Math.round(safeSurplus * 0.2),
      },
      keyFactors: [
        'High-cost debt detected in financial profile',
        'Guaranteed negative interest drag outpaces investment CAGR',
      ],
      rulesApplied: ['High-Cost Debt Clearance Priority Rule'],
    };
  }

  // Rule 2: Emergency fund inadequate (< 3 months)
  if (safeEmergencyMonths < 3) {
    return {
      primaryRecommendation: 'BUILD_EMERGENCY_RESERVE',
      headline: 'Prioritize Emergency Reserve Foundation',
      rationale: `Your emergency reserve covers ${safeEmergencyMonths.toFixed(1)} months of expenses. Without a 3-6 month cash buffer, unforeseen expenses may force premature liquidation of investments.`,
      recommendedSplit: {
        savingsPct: 75,
        investmentPct: 25,
        savingsAmount: Math.round(safeSurplus * 0.75),
        investmentAmount: Math.round(safeSurplus * 0.25),
      },
      keyFactors: [
        `Emergency buffer currently at ${safeEmergencyMonths.toFixed(1)} months (target: 6.0 months)`,
        'Liquidity risk is high if unexpected job or medical shocks occur',
      ],
      rulesApplied: ['Liquidity Foundation First Rule'],
    };
  }

  // Rule 3: Balanced phase (emergency fund 3-6 months, active missions exist)
  if (safeEmergencyMonths < 6 || activeMissionsCommitment > 0) {
    const investShare = readinessStatus === 'ready' ? 0.6 : 0.4;
    const saveShare = 1 - investShare;
    return {
      primaryRecommendation: 'SPLIT_BALANCED',
      headline: 'Balanced Hybrid: Fund Near-Term Missions & SIP Compounding',
      rationale: 'Your financial foundation is solid. Balance liquidity for scheduled savings missions with systematic long-term wealth compounding.',
      recommendedSplit: {
        savingsPct: Math.round(saveShare * 100),
        investmentPct: Math.round(investShare * 100),
        savingsAmount: Math.round(safeSurplus * saveShare),
        investmentAmount: Math.round(safeSurplus * investShare),
      },
      keyFactors: [
        `Emergency runway is functional (${safeEmergencyMonths.toFixed(1)} months)`,
        `Active savings missions require ${formatINR(activeMissionsCommitment)}/month`,
        `Calculated monthly investment capacity is ${formatINR(investmentCapacity)}`,
      ],
      rulesApplied: ['Balanced Goal Pacing & Wealth Accumulation Rule'],
    };
  }

  // Rule 4: Fortress foundation (6+ months emergency fund, ready to invest)
  return {
    primaryRecommendation: 'MAXIMIZE_INVESTMENTS',
    headline: 'Deploy Capital into Long-Term Disciplined Investing',
    rationale: `Emergency reserves are fully stocked at ${safeEmergencyMonths.toFixed(1)} months. Excess cash sitting idle in savings accounts loses purchasing power to inflation.`,
    recommendedSplit: {
      savingsPct: 20,
      investmentPct: 80,
      savingsAmount: Math.round(safeSurplus * 0.2),
      investmentAmount: Math.round(safeSurplus * 0.8),
    },
    keyFactors: [
      `Fortress emergency fund: ${safeEmergencyMonths.toFixed(1)} months covered`,
      'No high-cost debt drag',
      'Maximum compounding horizon can be unlocked',
    ],
    rulesApplied: ['Long-Term Wealth Maximization Rule'],
  };
}

export interface MonthlyFinancialReviewData {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  savingsRate: number;
  budgetPerformance: {
    totalBudget: number;
    totalSpent: number;
    variance: number;
    overbudgetCount: number;
    overbudgetCategories: string[];
  };
  topSpendingCategories: Array<{ category: string; amount: number; percentage: number }>;
  missionProgress: {
    activeCount: number;
    onTrackCount: number;
    atRiskCount: number;
    totalSavedThisMonth: number;
  };
  investmentProgress: {
    monthlyCapacity: number;
    readinessStatus: string;
  };
  financialRisks: string[];
  positiveHighlights: string[];
  recommendedFocus: string;
}

/**
 * Deterministically aggregates a monthly financial review from verified transaction data,
 * budgets, missions, and snapshots.
 */
export function calculateMonthlyFinancialReview(
  month: string,
  snapshot: FinancialSnapshot,
  transactions: Transaction[],
  budgets: Budget[],
  missions: SavingsMission[],
  investmentReadiness: InvestmentReadinessEvaluation,
  investmentCapacity: InvestmentCapacityBreakdown
): MonthlyFinancialReviewData {
  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  const expenseTx = monthTx.filter((t) => t.type === 'expense');

  // Category totals
  const categoryMap = new Map<string, number>();
  expenseTx.forEach((t) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });

  const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0) || snapshot.totalExpenses;
  const incomeTx = monthTx.filter((t) => t.type === 'income');
  const totalIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0) || snapshot.totalIncome;
  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

  // Top spending categories
  const topSpendingCategories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Budget performance
  const overbudgetCategories: string[] = [];
  let totalBudget = 0;
  let totalSpentInBudgeted = 0;

  budgets.forEach((b) => {
    totalBudget += b.monthlyLimit;
    const spent = categoryMap.get(b.category) || 0;
    totalSpentInBudgeted += spent;
    if (spent > b.monthlyLimit) {
      overbudgetCategories.push(b.category);
    }
  });

  // Mission diagnostics
  const activeMissions = missions.filter((m) => !m.isArchived && m.status !== 'completed');
  const onTrackCount = activeMissions.filter((m) => m.status === 'on_track').length;
  const atRiskCount = activeMissions.filter((m) => m.status === 'at_risk' || m.status === 'not_feasible').length;

  const risks: string[] = [];
  const highlights: string[] = [];

  if (netCashFlow < 0) {
    risks.push(`Net monthly cash flow is negative (${formatINR(netCashFlow)} deficit).`);
  } else if (savingsRate < 20) {
    risks.push(`Savings rate (${savingsRate}%) is below the healthy 20% benchmark.`);
  }

  if (overbudgetCategories.length > 0) {
    risks.push(`Budget caps exceeded in: ${overbudgetCategories.join(', ')}.`);
  }

  if (atRiskCount > 0) {
    risks.push(`${atRiskCount} active savings mission(s) currently flagged as at-risk.`);
  }

  if (investmentReadiness.hasHighCostDebt) {
    risks.push('High-cost debt requires structured aggressive elimination.');
  }

  if (netCashFlow > 0) {
    highlights.push(`Positive monthly net cash flow generated: ${formatINR(netCashFlow)}.`);
  }

  if (savingsRate >= 30) {
    highlights.push(`Disciplined savings rate achieved: ${savingsRate}%.`);
  }

  if (onTrackCount > 0) {
    highlights.push(`${onTrackCount} mission(s) executing on schedule.`);
  }

  if (investmentCapacity.potentialMonthlyCapacity > 0) {
    highlights.push(`Verified monthly investment capacity of ${formatINR(investmentCapacity.potentialMonthlyCapacity)}.`);
  }

  let recommendedFocus = 'Maintain current pacing and monitor upcoming recurring commitments.';
  if (risks.length > 0) {
    if (netCashFlow < 0) {
      recommendedFocus = 'Eliminate non-essential discretionary expenses to stop cash flow deficit immediately.';
    } else if (overbudgetCategories.length > 0) {
      recommendedFocus = `Re-anchor spending in ${overbudgetCategories[0]} back within defined budget limits.`;
    } else if (atRiskCount > 0) {
      recommendedFocus = 'Recalibrate deadlines or contribution rates on at-risk savings missions.';
    }
  } else if (investmentCapacity.potentialMonthlyCapacity > 0) {
    recommendedFocus = 'Deploy unallocated monthly surplus into diversified long-term index and debt SIPs.';
  }

  return {
    month,
    income: totalIncome,
    expenses: totalExpense,
    netCashFlow,
    savingsRate,
    budgetPerformance: {
      totalBudget,
      totalSpent: totalSpentInBudgeted,
      variance: totalBudget - totalSpentInBudgeted,
      overbudgetCount: overbudgetCategories.length,
      overbudgetCategories,
    },
    topSpendingCategories,
    missionProgress: {
      activeCount: activeMissions.length,
      onTrackCount,
      atRiskCount,
      totalSavedThisMonth: activeMissions.reduce((acc, m) => acc + m.monthlyContribution, 0),
    },
    investmentProgress: {
      monthlyCapacity: investmentCapacity.potentialMonthlyCapacity,
      readinessStatus: investmentReadiness.status,
    },
    financialRisks: risks.length > 0 ? risks : ['No critical vulnerabilities detected this month.'],
    positiveHighlights: highlights.length > 0 ? highlights : ['Baseline financial parameters maintained.'],
    recommendedFocus,
  };
}
