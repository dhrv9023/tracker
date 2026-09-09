import {
  UserProfile,
  SavingsMission,
  StructuredAdvisorResponse,
} from '../types/finance';
import { formatINR } from '../utils/finance';

const STORAGE_KEY = 'command_center_gemini_key';

export function getActiveGeminiKey(): string {
  const customKey = localStorage.getItem(STORAGE_KEY);
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function saveActiveGeminiKey(key: string): void {
  if (!key) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

/**
 * Builds minimal, structured financial context without leaking extraneous sensitive info.
 */
export function buildFinancialContext(
  profile: UserProfile,
  missions: SavingsMission[],
  surplus: number,
  savingsRate: number,
  investmentRate: number
): string {
  const totalFixed = Object.values(profile.fixedExpenses).reduce((a, b) => a + b, 0);
  const totalVariable = Object.values(profile.variableExpenses).reduce((a, b) => a + b, 0);
  const totalIncome = profile.monthlySalary + profile.otherIncome;

  const missionsSummary = missions.map((m) => ({
    name: m.name,
    target: m.targetAmount,
    current: m.currentAmount,
    monthlyPlanned: m.monthlyContribution,
    targetDate: m.targetDate,
    priority: m.priority,
    status: m.status,
  }));

  return `
USER_FINANCIAL_CONTEXT:
- Monthly Income: ₹${totalIncome} (Base Salary: ₹${profile.monthlySalary}, Other: ₹${profile.otherIncome})
- Income Stability: ${profile.incomeStability}
- Fixed Monthly Expenses: ₹${totalFixed} (Rent: ₹${profile.fixedExpenses.rent}, EMIs: ₹${profile.fixedExpenses.emi}, Utilities: ₹${profile.fixedExpenses.utilities}, Subscriptions: ₹${profile.fixedExpenses.subscriptions})
- Variable Monthly Expenses: ₹${totalVariable} (Food: ₹${profile.variableExpenses.food}, Leisure/Shopping: ₹${profile.variableExpenses.shopping + profile.variableExpenses.entertainment})
- Calculated Monthly Surplus (Available Capital): ₹${surplus}
- Emergency Fund: ₹${profile.existingPosition.emergencyFund}
- Current Savings Reserves: ₹${profile.existingPosition.currentSavings}
- Existing Investments: ₹${profile.existingPosition.existingInvestments}
- Outstanding Debt: ₹${profile.existingPosition.outstandingLoans + profile.existingPosition.creditCardDebt}
- Current Savings Rate: ${savingsRate}%
- Current Investment Rate: ${investmentRate}%
- Risk Profile: ${profile.riskProfile}
- Active Goals: ${JSON.stringify(missionsSummary)}
- Stated Priorities: ${profile.priorities.join(', ')}
`;
}

const SYSTEM_DIRECTIVE = `
You are THE ADVISOR, the financial planning intelligence core of the Personal Finance Command Center (inspired by high-precision tactical operations).
Role & Protocol:
1. Use the supplied structured financial context strictly. Never fabricate missing values.
2. The application computes all math deterministically. NEVER recalculate or contradict deterministic figures supplied in the context.
3. Clearly distinguish between:
   [FACT] Data provided directly by user.
   [CALCULATION] Deterministic figures computed by the system.
   [ASSUMPTION] Financial planning hypotheses (e.g. inflation, historical market ranges).
   [RECOMMENDATION] Suggested prioritized tactical moves.
4. Distinguish between educational planning recommendations and guaranteed returns. NEVER promise investment returns. Projections are illustrative.
5. Emphasize capital safety, liquidity (emergency reserves), and debt reduction before aggressive risk allocation.
6. Tone: Direct, concise, tactical, serious financial intelligence. Avoid generic cheerleading ("You got this!"). Give actionable intelligence.
`;

/**
 * Direct call to Gemini REST API with fallback models (gemini-2.5-flash -> gemini-1.5-flash)
 */
async function callGeminiApi(prompt: string, jsonMode = false): Promise<string> {
  const apiKey = getActiveGeminiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY: Gemini API Key is required. Please provide it in Settings.');
  }

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_DIRECTIVE }],
        },
      };

      if (jsonMode) {
        payload.generationConfig = {
          responseMimeType: 'application/json',
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('EMPTY_RESPONSE: Gemini returned empty content.');
      }
      return candidateText;
    } catch (err: any) {
      lastError = err;
      // If error is 404 on model name, try next model
      if (err.message && err.message.includes('404')) {
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('Failed to connect to Gemini intelligence API.');
}

/**
 * Ask The Advisor a conversational query with financial context
 */
export async function askAdvisor(
  userQuery: string,
  financialContext: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const historyText = chatHistory
    .slice(-4)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const fullPrompt = `
${financialContext}

CONVERSATION LOG:
${historyText}

USER QUERY:
"${userQuery}"

Provide a tactical, structured, highly clear financial intelligence assessment.
Format your answer with clear bold headers (e.g. **ASSESSMENT**, **TACTICAL ACTIONS**, **RISK FACTOR**) when appropriate. Keep it concise, pragmatic, and grounded in the context numbers.
`;

  try {
    return await callGeminiApi(fullPrompt, false);
  } catch (error: any) {
    // Graceful tactical fallback if API key is missing or network failed
    if (error.message?.includes('MISSING_API_KEY')) {
      return `⚠️ **OPERATIONS NOTICE: GEMINI API KEY REQUIRED**\n\nPlease enter your Gemini API key in **Settings** or specify \`VITE_GEMINI_API_KEY\` to activate conversational intelligence.\n\n*Deterministic calculations and all dashboard modules remain 100% active.*`;
    }
    return `⚠️ **COMMUNICATION RELAY ERROR**: Unable to reach Gemini intelligence network (${error.message || 'Offline'}). Your deterministic calculations remain fully intact.`;
  }
}

/**
 * Structured Advisory Assessment for Goal Creation or Monthly Check
 */
export async function getStructuredAdvice(
  objective: string,
  financialContext: string
): Promise<StructuredAdvisorResponse> {
  const prompt = `
${financialContext}

OBJECTIVE TO EVALUATE:
"${objective}"

Generate a strict JSON response with the following schema:
{
  "summary": "1-2 sentence executive briefing",
  "financial_assessment": "Analysis of feasibility based on cash flow surplus",
  "recommended_monthly_saving": number,
  "recommended_monthly_investment": number,
  "priority_actions": ["Action 1", "Action 2"],
  "warnings": ["Warning 1 if applicable"],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "explanation": "Detailed strategic commentary"
}
`;

  try {
    const rawJson = await callGeminiApi(prompt, true);
    // Sanitize in case markdown fence is returned
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'Tactical evaluation complete.',
      financial_assessment: parsed.financial_assessment || 'Feasibility evaluated based on cash flow.',
      recommended_monthly_saving: Number(parsed.recommended_monthly_saving) || 0,
      recommended_monthly_investment: Number(parsed.recommended_monthly_investment) || 0,
      priority_actions: Array.isArray(parsed.priority_actions) ? parsed.priority_actions : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      explanation: parsed.explanation || '',
    };
  } catch (error: any) {
    return {
      summary: 'Deterministic planning active (AI Offline)',
      financial_assessment: 'Evaluation generated from deterministic cash flow surplus algorithms.',
      recommended_monthly_saving: 0,
      recommended_monthly_investment: 0,
      priority_actions: ['Ensure 3-6 months essential expenses in emergency fund', 'Maintain active cash flow surplus'],
      warnings: ['AI advisor offline. Deterministic calculations are active.'],
      assumptions: ['Returns are illustrative and subject to market volatility.'],
      explanation: 'All calculations are executed locally by client-side deterministic formulas.',
    };
  }
}

/**
 * Dynamic questions generation for Mission Wizard
 */
export async function generateDynamicMissionQuestion(
  goalName: string,
  targetAmount: number,
  financialContext: string
): Promise<string> {
  const prompt = `
${financialContext}

The user wants to save for: "${goalName}" with a target of ₹${targetAmount}.
In 1 crisp, tactical sentence, ask the single most important contextual question to refine this mission (e.g. urgency vs cash flow tradeoff, flexibility of date, or intended purpose).
`;

  try {
    const res = await callGeminiApi(prompt, false);
    return res.trim();
  } catch {
    return `What is your target completion timeline or deadline for acquiring this?`;
  }
}

/**
 * Monthly Review / What Changed debrief
 */
export async function generateMonthlyReviewDebrief(
  financialContext: string,
  metrics: { surplus: number; savingsRate: number; topSpendingCategory: string }
): Promise<string> {
  const prompt = `
${financialContext}

MONTHLY OPERATIONAL SNAPSHOT:
- Monthly Surplus: ₹${metrics.surplus}
- Savings Rate: ${metrics.savingsRate}%
- Highest Outflow Category: ${metrics.topSpendingCategory}

Provide a concise 3-bullet "OPERATIONS DEBRIEF" summarizing financial posture, key risk or leak, and one strategic recommendation for next month.
`;

  try {
    return await callGeminiApi(prompt, false);
  } catch {
    return `• **Cash Flow Stability**: Monthly surplus maintained at ${formatINR(metrics.surplus)}.\n• **Capital Allocation**: Current savings velocity is ${metrics.savingsRate}% of gross income.\n• **Discretionary Watch**: ${metrics.topSpendingCategory} represents your primary expenditure vector.`;
  }
}
