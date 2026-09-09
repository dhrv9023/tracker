import { describe, it, expect } from 'vitest';
import {
  filterTransactionsByMonth,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
  calculateCategorySpending,
  calculateSIPFutureValue,
  calculateMonthsBetween,
  getLocalDateString,
  calculateInvestmentReadiness,
} from './finance';
import {
  validateAndParseBackup,
  exportFullFinancialData,
  safeGetItem,
  safeRemoveItem,
  CURRENT_SCHEMA_VERSION,
} from './persistenceManager';
import { Transaction, FinancialProfile, UserInvestmentProfile } from '../types/finance';

describe('Phase 8 — Performance & Large Data Telemetry', () => {
  it('processes 1,000 transactions in under 20 milliseconds', () => {
    const transactions: Transaction[] = [];
    const categories = ['Food', 'Rent', 'Utilities', 'Transportation', 'Healthcare', 'Salary'];

    for (let i = 0; i < 1000; i++) {
      const isIncome = i % 10 === 0;
      transactions.push({
        id: `tx-${i}`,
        type: isIncome ? 'income' : 'expense',
        amount: Math.floor(Math.random() * 5000) + 100,
        category: isIncome ? 'Salary' : categories[i % (categories.length - 1)],
        date: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
        description: `Synthetic Transaction ${i}`,
        recurring: i % 5 === 0,
        expenseType: i % 3 === 0 ? 'fixed' : 'variable',
        essentiality: i % 2 === 0 ? 'essential' : 'discretionary',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      });
    }

    const t0 = performance.now();

    const filtered = filterTransactionsByMonth(transactions, '2026-09');
    const income = calculateMonthlyIncome(filtered);
    const expenses = calculateMonthlyExpenses(filtered);
    const netCashFlow = calculateNetCashFlow(income, expenses);
    const categoryBreakdown = calculateCategorySpending(filtered);

    const elapsed = performance.now() - t0;

    expect(filtered.length).toBe(1000);
    expect(income).toBeGreaterThan(0);
    expect(expenses).toBeGreaterThan(0);
    expect(netCashFlow).toBe(income - expenses);
    expect(categoryBreakdown.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(20); // Sub-20ms benchmark
  });

  it('aggregates 5,000 multi-month transactions under 40 milliseconds', () => {
    const transactions: Transaction[] = [];
    for (let i = 0; i < 5000; i++) {
      const month = String((i % 12) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      transactions.push({
        id: `tx-${i}`,
        description: `Transaction ${i}`,
        type: i % 4 === 0 ? 'income' : 'expense',
        amount: 2500,
        category: 'Food',
        date: `2026-${month}-${day}`,
        recurring: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      });
    }

    const t0 = performance.now();

    const septTxs = filterTransactionsByMonth(transactions, '2026-09');
    const septIncome = calculateMonthlyIncome(septTxs);
    const septExpenses = calculateMonthlyExpenses(septTxs);
    const net = calculateNetCashFlow(septIncome, septExpenses);

    const elapsed = performance.now() - t0;

    expect(septTxs.length).toBeGreaterThan(300);
    expect(net).toBe(septIncome - septExpenses);
    expect(elapsed).toBeLessThan(40);
  });
});

describe('Phase 8 — Mathematical & Edge Case Rigor', () => {
  it('calculateSIPFutureValue correctly handles zero contribution, zero rate, and boundary duration', () => {
    // Zero monthly investment
    const zeroP = calculateSIPFutureValue(0, 12, 10);
    expect(zeroP.totalInvested).toBe(0);
    expect(zeroP.illustrativeFinalValue).toBe(0);
    expect(zeroP.estimatedGrowth).toBe(0);

    // Zero duration
    const zeroN = calculateSIPFutureValue(10000, 12, 0);
    expect(zeroN.totalInvested).toBe(0);
    expect(zeroN.illustrativeFinalValue).toBe(0);

    // Zero annual rate (pure savings accumulation without growth)
    const zeroR = calculateSIPFutureValue(10000, 0, 5);
    expect(zeroR.totalInvested).toBe(600000); // 10,000 * 60 months
    expect(zeroR.illustrativeFinalValue).toBe(600000);
    expect(zeroR.estimatedGrowth).toBe(0);
    expect(zeroR.wealthMultiplier).toBe(1);

    // Negative annual rate (capital decay fallback)
    const negR = calculateSIPFutureValue(5000, -5, 2);
    expect(negR.totalInvested).toBe(120000);
    expect(negR.illustrativeFinalValue).toBe(120000);

    // Decimal contribution precision
    const decP = calculateSIPFutureValue(15500.5, 12, 1);
    expect(decP.totalInvested).toBe(Math.round(15500.5 * 12));
    expect(decP.illustrativeFinalValue).toBeGreaterThan(decP.totalInvested);
    expect(Number.isFinite(decP.illustrativeFinalValue)).toBe(true);

    // Extreme duration clamped to 100 years without Infinity
    const ultraLong = calculateSIPFutureValue(1000, 12, 250);
    expect(ultraLong.durationYears).toBe(100);
    expect(Number.isFinite(ultraLong.illustrativeFinalValue)).toBe(true);
    expect(Number.isFinite(ultraLong.estimatedGrowth)).toBe(true);
  });

  it('handles date calculations without UTC midnight drift across boundaries', () => {
    // Local date string format
    const local = getLocalDateString(new Date(2026, 8, 9)); // Sept 9 2026
    expect(local).toBe('2026-09-09');

    // Leap year date
    const leapDay = getLocalDateString(new Date(2028, 1, 29)); // Feb 29 2028
    expect(leapDay).toBe('2028-02-29');

    // Months between across year turnover
    const months = calculateMonthsBetween('2026-11-15', '2027-03-15');
    expect(months).toBe(4);

    // Months between identical month
    const zeroMonths = calculateMonthsBetween('2026-09-01', '2026-09-28');
    expect(zeroMonths).toBe(0);

    // Past deadline yields 0
    const pastMonths = calculateMonthsBetween('2026-09-01', '2025-09-01');
    expect(pastMonths).toBe(0);
  });

  it('calculateInvestmentReadiness provides responsible, non-guaranteed planning language', () => {
    const debtBurden = calculateInvestmentReadiness({
      monthlyIncome: 100000,
      monthlyExpenses: 60000,
      monthlySurplus: 40000,
      essentialMonthlyExpenses: 30000,
      currentEmergencyFund: 200000,
      outstandingDebt: 150000,
      creditCardDebt: 50000,
      monthlyDebtPayment: 15000,
      debtToIncomeRatio: 15,
    });

    expect(debtBurden.status).toBe('partially_ready');
    expect(debtBurden.summary).not.toContain('guaranteed');
    expect(debtBurden.summary).not.toContain('risk-free return');
    expect(debtBurden.reasons.some((r) => r.includes('compounding'))).toBe(true);
  });
});

describe('Phase 8 — Persistence Manager & Backup Security', () => {
  it('exports sanitized financial backup without leaking credentials', () => {
    const mockProfile: FinancialProfile = {
      user: { name: 'Operative', age: 30, country: 'India', currency: 'INR' },
      income: { monthlySalary: 100000, otherIncome: 0 },
      expenses: {
        fixed: { rent: 20000, utilities: 3000, internet: 1000, phone: 500, insurance: 2000, emi: 0, subscriptions: 500, transportation: 2000, education: 0, other: 0 },
        variable: { food: 5000, shopping: 2000, entertainment: 1000, travel: 1000, miscellaneous: 2000 },
      },
      position: { currentSavings: 150000, emergencyFund: 150000, existingInvestments: 500000, debt: { outstandingLoans: 0, creditCardDebt: 0 } },
      priorities: ['Wealth creation'],
      riskPreference: 'moderate',
      hasCompletedOnboarding: true,
      updatedAt: '2026-09-09T00:00:00Z',
    };

    const backup = exportFullFinancialData({
      profile: mockProfile,
      transactions: [],
      budgets: [],
      categories: [],
      missions: [],
      contributions: [],
      investmentProfile: {} as UserInvestmentProfile,
      investmentHoldings: [],
      dismissedInsightIds: [],
    });

    expect(backup.meta.app).toBe('Finance OS');
    expect(backup.meta.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(backup.data.profile.user.name).toBe('Operative');

    // Verify no API keys are present in backup
    const jsonStr = JSON.stringify(backup);
    expect(jsonStr).not.toContain('gemini_api_key');
    expect(jsonStr).not.toContain('apiKey');
  });

  it('validates incoming JSON backups with strict schema checking', () => {
    // 1. Invalid JSON string
    const invalidJson = validateAndParseBackup('{ bad json ');
    expect(invalidJson.success).toBe(false);
    expect(invalidJson.error).toContain('JSON Parse error');

    // 2. Missing data root
    const missingData = validateAndParseBackup(JSON.stringify({ meta: {} }));
    expect(missingData.success).toBe(false);
    expect(missingData.error).toContain('missing the core "data" root');

    // 3. Missing profile
    const missingProfile = validateAndParseBackup(JSON.stringify({ data: { transactions: [] } }));
    expect(missingProfile.success).toBe(false);
    expect(missingProfile.error).toContain('valid financial profile');

    // 4. Valid backup succeeds and normalizes
    const validRaw = JSON.stringify({
      meta: { app: 'Finance OS', schemaVersion: 3 },
      data: {
        profile: { user: { name: 'Test User' } },
        transactions: [],
        budgets: [],
        missions: [],
      },
    });
    const parsed = validateAndParseBackup(validRaw);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.profile.user.name).toBe('Test User');
    expect(parsed.data?.categories).toEqual([]);
    expect(parsed.data?.contributions).toEqual([]);
  });

  it('safeGetItem recovers safely from corrupt localStorage payloads', () => {
    const memoryStore: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => memoryStore[k] ?? null,
      setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
      removeItem: (k: string) => { delete memoryStore[k]; },
      clear: () => { Object.keys(memoryStore).forEach((k) => delete memoryStore[k]); },
    };

    const key = 'test_corrupt_key';
    localStorage.setItem(key, '{ invalid json payload ...');

    const fallback = { status: 'safe_fallback' };
    const recovered = safeGetItem(key, fallback);

    expect(recovered).toEqual(fallback);
    safeRemoveItem(key);
  });
});
