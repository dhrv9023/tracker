// ==========================================================================
// FINANCE OS — PHASE 7: TRANSPARENT FINANCIAL HEALTH SCORE ENGINE
// 100-Point Deterministic Score broken into 5 transparent 20-point pillars.
// Zero black-box AI math. 100% explainable to the user.
// ==========================================================================

import { FinancialHealthEvaluation, HealthScoreFactor } from '../types/finance';
import { formatINR } from './finance';

export interface HealthScoreEngineParams {
  totalIncome: number;
  totalExpenses: number;
  monthlySurplus: number;
  savingsRate: number;
  emergencyFundMonths: number | null;
  monthlyDebt: number;
  hasHighCostDebt?: boolean;
  budgetOverrunCount?: number;
  totalBudgetsCount?: number;
  activeMissionsCount?: number;
  atRiskMissionsCount?: number;
  hasMissionConflict?: boolean;
}

/**
 * Calculates a transparent, deterministic 100-point Personal Financial Health Score
 * distributed evenly across 5 foundational planning pillars (20 points each).
 */
export function calculateTransparentHealthScore(params: HealthScoreEngineParams): FinancialHealthEvaluation {
  const {
    totalIncome,
    totalExpenses,
    monthlySurplus,
    savingsRate,
    emergencyFundMonths,
    monthlyDebt,
    hasHighCostDebt = false,
    budgetOverrunCount = 0,
    totalBudgetsCount = 0,
    activeMissionsCount = 0,
    atRiskMissionsCount = 0,
    hasMissionConflict = false,
  } = params;

  const factors: HealthScoreFactor[] = [];

  // --------------------------------------------------------------------------
  // PILLAR 1: CASH FLOW STABILITY (Max 20 pts)
  // --------------------------------------------------------------------------
  let cashFlowScore = 0;
  let cashFlowStatus: HealthScoreFactor['status'] = 'Vulnerable';
  let cashFlowDetails = '';

  if (totalIncome === 0) {
    cashFlowScore = 0;
    cashFlowStatus = 'Data Required';
    cashFlowDetails = 'Income baseline required to evaluate cash flow stability.';
  } else if (monthlySurplus < 0) {
    cashFlowScore = 0;
    cashFlowStatus = 'Vulnerable';
    cashFlowDetails = `Operating in deficit (-${formatINR(Math.abs(monthlySurplus))}/mo). Expenses exceed income.`;
  } else if (monthlySurplus >= totalIncome * 0.3) {
    cashFlowScore = 20;
    cashFlowStatus = 'Strong';
    cashFlowDetails = `Exceptional cash flow cushion. Surplus represents ${Math.round((monthlySurplus / totalIncome) * 100)}% of monthly income.`;
  } else if (monthlySurplus >= totalIncome * 0.15) {
    cashFlowScore = 16;
    cashFlowStatus = 'Strong';
    cashFlowDetails = `Comfortable cash flow surplus of ${formatINR(monthlySurplus)}/month.`;
  } else {
    cashFlowScore = 8;
    cashFlowStatus = 'Moderate';
    cashFlowDetails = `Thin monthly buffer of ${formatINR(monthlySurplus)}/mo. Unforeseen expenses may trigger deficits.`;
  }

  factors.push({
    name: 'Cash Flow Stability',
    score: cashFlowScore,
    maxScore: 20,
    status: cashFlowStatus,
    details: cashFlowDetails,
  });

  // --------------------------------------------------------------------------
  // PILLAR 2: SAVINGS & PACING (Max 20 pts)
  // --------------------------------------------------------------------------
  let savingsScore = 0;
  let savingsStatus: HealthScoreFactor['status'] = 'Vulnerable';
  let savingsDetails = '';

  if (totalIncome === 0) {
    savingsScore = 0;
    savingsStatus = 'Data Required';
    savingsDetails = 'Income data required to compute savings rate.';
  } else if (monthlySurplus < 0) {
    savingsScore = 0;
    savingsStatus = 'Vulnerable';
    savingsDetails = '0% savings rate due to operating deficit.';
  } else if (savingsRate >= 35) {
    savingsScore = 20;
    savingsStatus = 'Strong';
    savingsDetails = `Elite savings rate (${savingsRate}% preserved). Accelerates financial velocity.`;
  } else if (savingsRate >= 20) {
    savingsScore = 16;
    savingsStatus = 'Strong';
    savingsDetails = `Target benchmark met (${savingsRate}% preserved). Aligns with standard planning principles.`;
  } else if (savingsRate >= 10) {
    savingsScore = 10;
    savingsStatus = 'Moderate';
    savingsDetails = `Moderate savings rate (${savingsRate}% preserved). Potential to optimize discretionary spending.`;
  } else {
    savingsScore = 4;
    savingsStatus = 'Vulnerable';
    savingsDetails = `Sub-optimal savings rate (${savingsRate}%). High proportion of income consumed by expenses.`;
  }

  factors.push({
    name: 'Savings & Capital Retention',
    score: savingsScore,
    maxScore: 20,
    status: savingsStatus,
    details: savingsDetails,
  });

  // --------------------------------------------------------------------------
  // PILLAR 3: EMERGENCY LIQUIDITY (Max 20 pts)
  // --------------------------------------------------------------------------
  let emergencyScore = 0;
  let emergencyStatus: HealthScoreFactor['status'] = 'Vulnerable';
  let emergencyDetails = '';

  if (emergencyFundMonths === null) {
    emergencyScore = 5;
    emergencyStatus = 'Data Required';
    emergencyDetails = 'Essential expense baseline needed for precise runway calculation.';
  } else if (emergencyFundMonths >= 6) {
    emergencyScore = 20;
    emergencyStatus = 'Strong';
    emergencyDetails = `Fortified liquidity reserve (${emergencyFundMonths.toFixed(1)} months essential expenses covered).`;
  } else if (emergencyFundMonths >= 3) {
    emergencyScore = 14;
    emergencyStatus = 'Moderate';
    emergencyDetails = `Functional foundation (${emergencyFundMonths.toFixed(1)} months buffer). Target 6 months for complete safety.`;
  } else if (emergencyFundMonths >= 1) {
    emergencyScore = 8;
    emergencyStatus = 'Vulnerable';
    emergencyDetails = `Fragile cushion (${emergencyFundMonths.toFixed(1)} months buffer). Medical or income shocks carry high risk.`;
  } else {
    emergencyScore = 2;
    emergencyStatus = 'Vulnerable';
    emergencyDetails = `Critically exposed (< 1 month buffer). Building an initial cash buffer is paramount.`;
  }

  factors.push({
    name: 'Emergency Liquidity Runway',
    score: emergencyScore,
    maxScore: 20,
    status: emergencyStatus,
    details: emergencyDetails,
  });

  // --------------------------------------------------------------------------
  // PILLAR 4: DEBT OVERHEAD (Max 20 pts)
  // --------------------------------------------------------------------------
  let debtScore = 0;
  let debtStatus: HealthScoreFactor['status'] = 'Strong';
  let debtDetails = '';

  const dti = totalIncome > 0 ? (monthlyDebt / totalIncome) * 100 : 0;

  if (monthlyDebt === 0 && !hasHighCostDebt) {
    debtScore = 20;
    debtStatus = 'Strong';
    debtDetails = 'Zero debt obligations. 100% of income is free of fixed financing drags.';
  } else if (hasHighCostDebt) {
    debtScore = 4;
    debtStatus = 'Vulnerable';
    debtDetails = 'High-cost revolving debt detected. Guaranteed negative compounding erodes financial health.';
  } else if (dti <= 20) {
    debtScore = 16;
    debtStatus = 'Strong';
    debtDetails = `Low debt load (DTI: ${dti.toFixed(0)}%). Well within prudent borrowing guidelines (< 25%).`;
  } else if (dti <= 35) {
    debtScore = 10;
    debtStatus = 'Moderate';
    debtDetails = `Moderate debt burden (DTI: ${dti.toFixed(0)}%). Keep fixed loan commitments from rising further.`;
  } else {
    debtScore = 4;
    debtStatus = 'Vulnerable';
    debtDetails = `Elevated debt load (DTI: ${dti.toFixed(0)}%). More than one-third of gross income committed to EMIs.`;
  }

  factors.push({
    name: 'Debt & Liability Burden',
    score: debtScore,
    maxScore: 20,
    status: debtStatus,
    details: debtDetails,
  });

  // --------------------------------------------------------------------------
  // PILLAR 5: BUDGET & GOAL DISCIPLINE (Max 20 pts)
  // --------------------------------------------------------------------------
  let disciplineScore = 20;
  let disciplineStatus: HealthScoreFactor['status'] = 'Strong';
  const disciplineReasons: string[] = [];

  if (totalBudgetsCount > 0) {
    if (budgetOverrunCount === 0) {
      disciplineReasons.push(`All ${totalBudgetsCount} category budgets strictly respected`);
    } else {
      const deduction = Math.min(10, budgetOverrunCount * 4);
      disciplineScore -= deduction;
      disciplineReasons.push(`${budgetOverrunCount} budget cap(s) exceeded`);
    }
  } else {
    disciplineReasons.push('Baseline budget caps not yet configured');
  }

  if (activeMissionsCount > 0) {
    if (hasMissionConflict) {
      disciplineScore -= 6;
      disciplineReasons.push('Active mission requirements exceed monthly surplus capacity');
    }
    if (atRiskMissionsCount > 0) {
      disciplineScore -= Math.min(6, atRiskMissionsCount * 3);
      disciplineReasons.push(`${atRiskMissionsCount} savings mission(s) currently at risk`);
    }
    if (!hasMissionConflict && atRiskMissionsCount === 0) {
      disciplineReasons.push(`${activeMissionsCount} savings mission(s) executing on schedule`);
    }
  }

  disciplineScore = Math.max(0, Math.min(20, disciplineScore));
  if (disciplineScore >= 16) {
    disciplineStatus = 'Strong';
  } else if (disciplineScore >= 10) {
    disciplineStatus = 'Moderate';
  } else {
    disciplineStatus = 'Vulnerable';
  }

  factors.push({
    name: 'Budget & Mission Discipline',
    score: disciplineScore,
    maxScore: 20,
    status: disciplineStatus,
    details: disciplineReasons.join(' • ') || 'Operational planning execution parameters normal.',
  });

  // --------------------------------------------------------------------------
  // TOTAL COMPOSITE SCORE (0 - 100)
  // --------------------------------------------------------------------------
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);

  let tier: FinancialHealthEvaluation['tier'] = 'Moderate';
  let summary = '';

  if (totalScore >= 85) {
    tier = 'Elite';
    summary = 'Exceptional financial resilience. Robust surplus, strong emergency coverage, and controlled liabilities.';
  } else if (totalScore >= 70) {
    tier = 'Strong';
    summary = 'Solid financial posture. Systematic capital retention and healthy planning discipline.';
  } else if (totalScore >= 50) {
    tier = 'Moderate';
    summary = 'Functional foundation with clear improvement opportunities in savings pacing or reserve buffers.';
  } else if (totalScore >= 30) {
    tier = 'Vulnerable';
    summary = 'Financial tension detected. Prioritize cash flow defense and emergency liquidity building.';
  } else {
    tier = 'Critical';
    summary = 'Operating under high financial strain. Immediate focus required on deficit reduction and debt restructuring.';
  }

  return {
    totalScore,
    tier,
    factors,
    summary,
  };
}
