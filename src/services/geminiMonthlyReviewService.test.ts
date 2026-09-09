import { describe, it, expect } from 'vitest';
import {
  buildDeterministicReviewFallback,
  sanitizeMonthlyReviewOutput,
  generateMonthlyReviewExplanation,
} from './geminiMonthlyReviewService';
import { MonthlyReviewReport } from '../types/finance';

const mockReport: MonthlyReviewReport = {
  month: '2026-09',
  income: 80000,
  expenses: 50000,
  netCashFlow: 30000,
  savingsRate: 38,
  investmentContribution: 10000,
  previousMonth: '2026-08',
  incomeChange: { absolute: 5000, percent: 7 },
  expensesChange: { absolute: 2000, percent: 4 },
  netCashFlowChange: { absolute: 3000, percent: 11 },
  savingsRateChange: { absolute: 2 },
  topSpendingCategories: [
    { category: 'Housing', amount: 25000, percentage: 50, changeVsPrev: 0 },
    { category: 'Food', amount: 15000, percentage: 30, changeVsPrev: 2000 },
  ],
  budgetPerformance: {
    totalBudget: 45000,
    totalSpent: 40000,
    variance: 5000,
    underControlCount: 3,
    approachingCount: 1,
    overbudgetCount: 0,
    overbudgetCategories: [],
  },
  missionProgress: {
    activeCount: 2,
    onTrackCount: 2,
    atRiskCount: 0,
    completedThisMonthCount: 0,
    totalSavedThisMonth: 15000,
  },
  investmentProgress: {
    monthlyCapacity: 15000,
    readinessStatus: 'ready',
    totalPortfolioValue: 150000,
  },
  healthScore: {
    totalScore: 82,
    tier: 'STRONG',
    factors: [
      { name: 'Cash Flow Stability', score: 20, maxScore: 20, status: 'Strong', details: 'Healthy surplus' },
      { name: 'Savings Pacing', score: 18, maxScore: 20, status: 'Strong', details: 'Strong savings rate' },
      { name: 'Emergency Liquidity', score: 16, maxScore: 20, status: 'Strong', details: 'Adequate liquidity' },
      { name: 'Debt Burden', score: 20, maxScore: 20, status: 'Strong', details: 'No high-cost debt' },
      { name: 'Budget & Goal Discipline', score: 8, maxScore: 20, status: 'Moderate', details: 'Good discipline' },
    ],
  },
  keyHighlights: ['Generated a positive net surplus of ₹30,000.', 'All 4 category budgets respected.'],
  areasOfConcern: ['Ensure liquid cash reserves remain protected.'],
  recommendedFocus: 'Deploy ₹15,000/mo into diversified asset allocation.',
};

describe('geminiMonthlyReviewService - Fallback & Sanitization', () => {
  it('builds a high-quality deterministic fallback for positive surplus', () => {
    const fallback = buildDeterministicReviewFallback(mockReport);
    expect(fallback.headline).toContain('2026-09');
    expect(fallback.executiveSummary).toContain('₹80,000');
    expect(fallback.executiveSummary).toContain('₹50,000');
    expect(fallback.executiveSummary).toContain('₹30,000');
    expect(fallback.topStrength).toBe('Generated a positive net surplus of ₹30,000.');
    expect(fallback.strategicNextSteps.length).toBeGreaterThan(0);
    expect(fallback.coachAdvice).toContain('Capital preservation');
  });

  it('builds an appropriate fallback for an operating deficit', () => {
    const deficitReport: MonthlyReviewReport = {
      ...mockReport,
      netCashFlow: -5000,
      savingsRate: 0,
      healthScore: { ...mockReport.healthScore, totalScore: 35, tier: 'CRITICAL' },
    };
    const fallback = buildDeterministicReviewFallback(deficitReport);
    expect(fallback.headline).toContain('DEFICIT DETECTED');
    expect(fallback.coachAdvice).toContain('defense is paramount');
  });

  it('sanitizes valid markdown-wrapped JSON output from Gemini', () => {
    const fallback = buildDeterministicReviewFallback(mockReport);
    const rawAiText = `\`\`\`json
{
  "headline": "STRATEGIC EXPANSION CONFIRMED",
  "executiveSummary": "Outstanding execution in September. Cash flows remain resilient.",
  "topStrength": "High savings rate discipline.",
  "primaryVulnerability": "Discretionary spending creeping up in Food.",
  "strategicNextSteps": ["Cap Dining at ₹12k", "Increase Nifty SIP"],
  "coachAdvice": "Stay the course and do not let lifestyle creep compromise your timeline."
}
\`\`\``;
    const sanitized = sanitizeMonthlyReviewOutput(rawAiText, fallback);
    expect(sanitized.headline).toBe('STRATEGIC EXPANSION CONFIRMED');
    expect(sanitized.executiveSummary).toBe('Outstanding execution in September. Cash flows remain resilient.');
    expect(sanitized.topStrength).toBe('High savings rate discipline.');
    expect(sanitized.strategicNextSteps).toEqual(['Cap Dining at ₹12k', 'Increase Nifty SIP']);
  });

  it('returns fallback gracefully on invalid JSON', () => {
    const fallback = buildDeterministicReviewFallback(mockReport);
    const invalidText = "I'm sorry, I cannot format this right now.";
    const sanitized = sanitizeMonthlyReviewOutput(invalidText, fallback);
    expect(sanitized).toEqual(fallback);
  });

  it('generateMonthlyReviewExplanation returns fallback if no API key is available', async () => {
    const output = await generateMonthlyReviewExplanation(mockReport, '');
    expect(output).toBeDefined();
    expect(output.headline).toContain('2026-09');
    expect(output.executiveSummary).toContain('₹80,000');
  });
});
