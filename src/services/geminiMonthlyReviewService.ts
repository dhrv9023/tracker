// ==========================================================================
// FINANCE OS — PHASE 7: GEMINI MONTHLY REVIEW INTELLIGENCE SERVICE
// Authoritative deterministic report -> Gemini Strategic Interpretation -> User Decision
// Zero invented figures. Zero fabricated historical comparisons.
// ==========================================================================

import { DEFAULT_GEMINI_MODEL, getActiveGeminiApiKey, generateGeminiContent } from './geminiConfig';
import { MonthlyReviewReport, MonthlyReviewAIOutput } from '../types/finance';
import { formatINR } from '../utils/finance';

const MONTHLY_REVIEW_SYSTEM_INSTRUCTION = `You are "The Professor", the strategic financial intelligence commander inside Finance OS.
You are reviewing the user's monthly financial execution report.
The application code is the sole authoritative source of truth for financial numbers, percentages, and delta metrics.

CRITICAL RULES:
1. NEVER invent numbers, percentages, deltas, or dates.
2. Rely strictly and solely on the provided Monthly Review Report metrics.
3. If previousMonth or month-over-month deltas are not provided, DO NOT fabricate any historical comparison. Emphasize establishing baseline discipline.
4. Tone: Strategic, commanding, analytical, encouraging yet vigilant (Money-Heist command center style).
5. Output format: Return ONLY a raw JSON object matching this schema, with no markdown backticks or commentary outside the JSON:
{
  "headline": "Brief strategic status summary (under 12 words)",
  "executiveSummary": "2-3 concise sentences summarizing income, spending discipline, surplus, and health score tier.",
  "topStrength": "The single most commendable financial behavior observed this month.",
  "primaryVulnerability": "The most significant risk or leak requiring defensive intervention.",
  "strategicNextSteps": [
    "Concrete tactical action 1",
    "Concrete tactical action 2"
  ],
  "coachAdvice": "1-2 sentences of forward-looking financial discipline guidance."
}`;

/**
 * Deterministic fallback generator when Gemini API is offline or unconfigured.
 * Guarantees zero downtime and perfectly accurate numbers based on pure application code.
 */
export function buildDeterministicReviewFallback(report: MonthlyReviewReport): MonthlyReviewAIOutput {
  let headline = `OPERATIONS REVIEW — ${report.month}`;
  if (report.netCashFlow < 0) {
    headline = `DEFICIT DETECTED — DEFENSIVE ACTION REQUIRED (${report.month})`;
  } else if (report.savingsRate >= 35) {
    headline = `STRONG EXECUTION — ${report.savingsRate}% CAPITAL RETENTION (${report.month})`;
  } else if (report.healthScore.tier === 'EXCELLENT' || report.healthScore.tier === 'STRONG') {
    headline = `SOLID POSTURE — HEALTH SCORE ${report.healthScore.totalScore}/100 (${report.month})`;
  }

  const topCategory = report.topSpendingCategories[0];
  const topCatSummary = topCategory
    ? `Highest expenditure occurred in ${topCategory.category} (${formatINR(topCategory.amount)}, ${topCategory.percentage}% of total expenses).`
    : '';

  const deltaText = report.expensesChange
    ? ` Spending shifted by ${report.expensesChange.percent >= 0 ? '+' : ''}${report.expensesChange.percent}% vs previous month.`
    : ' Baseline historical telemetry established.';

  const executiveSummary = `In ${report.month}, you generated ${formatINR(report.income)} in cash inflows and recorded ${formatINR(report.expenses)} in total outflows, resulting in a net monthly surplus of ${formatINR(report.netCashFlow)} (${report.savingsRate}% savings rate). ${topCatSummary}${deltaText} Overall financial health score stands at ${report.healthScore.totalScore}/100 (${report.healthScore.tier}).`;

  const topStrength = report.keyHighlights[0] || 'Maintained baseline financial tracking and awareness.';
  const primaryVulnerability = report.areasOfConcern[0] || 'Ensure liquid cash reserves remain protected against sudden shocks.';

  const strategicNextSteps: string[] = [];
  if (report.recommendedFocus) {
    strategicNextSteps.push(report.recommendedFocus);
  }
  if (report.budgetPerformance.overbudgetCount > 0) {
    strategicNextSteps.push(`Adjust or constrain spending in overbudget categories: ${report.budgetPerformance.overbudgetCategories.join(', ')}.`);
  } else if (report.missionProgress.atRiskCount > 0) {
    strategicNextSteps.push('Recalibrate deadlines or boost allocations for at-risk savings missions.');
  } else if (report.investmentProgress.monthlyCapacity > 0) {
    strategicNextSteps.push(`Deploy ${formatINR(report.investmentProgress.monthlyCapacity)} monthly surplus capacity into diversified asset allocation.`);
  } else {
    strategicNextSteps.push('Keep logging daily transactions to deepen analytical trend fidelity.');
  }

  const coachAdvice = report.netCashFlow >= 0
    ? 'Capital preservation precedes capital growth. Continue protecting your surplus and directing savings toward funded reserves.'
    : 'When expenses outpace income, defense is paramount. Pause discretionary outlays until operating cash flow returns to positive territory.';

  return {
    headline,
    executiveSummary,
    topStrength,
    primaryVulnerability,
    strategicNextSteps,
    coachAdvice,
  };
}

/**
 * Strips markdown and parses Gemini JSON response safely.
 */
export function sanitizeMonthlyReviewOutput(rawText: string, fallback: MonthlyReviewAIOutput): MonthlyReviewAIOutput {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    return {
      headline: typeof parsed.headline === 'string' && parsed.headline.trim().length > 0
        ? parsed.headline.trim()
        : fallback.headline,
      executiveSummary: typeof parsed.executiveSummary === 'string' && parsed.executiveSummary.trim().length > 0
        ? parsed.executiveSummary.trim()
        : fallback.executiveSummary,
      topStrength: typeof parsed.topStrength === 'string' && parsed.topStrength.trim().length > 0
        ? parsed.topStrength.trim()
        : fallback.topStrength,
      primaryVulnerability: typeof parsed.primaryVulnerability === 'string' && parsed.primaryVulnerability.trim().length > 0
        ? parsed.primaryVulnerability.trim()
        : fallback.primaryVulnerability,
      strategicNextSteps: Array.isArray(parsed.strategicNextSteps) && parsed.strategicNextSteps.length > 0
        ? parsed.strategicNextSteps
        : fallback.strategicNextSteps,
      coachAdvice: typeof parsed.coachAdvice === 'string' && parsed.coachAdvice.trim().length > 0
        ? parsed.coachAdvice.trim()
        : fallback.coachAdvice,
    };
  } catch (err) {
    console.warn('Failed to parse Gemini Monthly Review JSON, using deterministic fallback:', err, rawText);
    return fallback;
  }
}

/**
 * Generate intelligent Monthly Review explanation via Gemini or deterministic fallback.
 */
export async function generateMonthlyReviewExplanation(
  report: MonthlyReviewReport,
  customApiKey?: string
): Promise<MonthlyReviewAIOutput> {
  const fallback = buildDeterministicReviewFallback(report);

  if (customApiKey !== undefined && !customApiKey.trim()) {
    return fallback;
  }

  const prompt = `
[SYSTEM CONTEXT]
Review Period: ${report.month}
Authoritative Application Calculation Report:
${JSON.stringify(report, null, 2)}

Provide your strategic executive interpretation in pure JSON matching the specified schema.
`;

  try {
    const rawText = await generateGeminiContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      apiKey: customApiKey,
      config: {
        systemInstruction: MONTHLY_REVIEW_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for deterministic, factual rigor
        responseMimeType: 'application/json',
      },
    });

    return sanitizeMonthlyReviewOutput(rawText, fallback);
  } catch (error) {
    console.warn('Gemini Monthly Review generation error, using fallback:', error);
    return fallback;
  }
}
