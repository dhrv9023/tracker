// ==========================================================================
// FINANCE OS — PHASE 8: PERSISTENCE & DATA MIGRATION MANAGER
// Centralizes localStorage operations, schema versioning, corrupt data recovery,
// sanitized JSON data export, and schema-validated atomic import.
// ==========================================================================

import {
  FinancialProfile,
  Transaction,
  Budget,
  Category,
  SavingsMission,
  SavingsContribution,
  UserInvestmentProfile,
  InvestmentHolding,
} from '../types/finance';

export const CURRENT_SCHEMA_VERSION = 3;

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'finance_os_schema_version',
  PROFILE: 'finance_os_profile_v1',
  TRANSACTIONS: 'finance_os_transactions_v2',
  TRANSACTIONS_LEGACY: 'finance_os_transactions_v1',
  BUDGETS: 'finance_os_budgets_v1',
  CATEGORIES: 'finance_os_categories_v1',
  MISSIONS: 'finance_os_missions_v1',
  CONTRIBUTIONS: 'finance_os_contributions_v1',
  INVESTMENT_PROFILE: 'finance_os_investment_profile_v1',
  INVESTMENT_HOLDINGS: 'finance_os_investment_holdings_v1',
  ADVISOR_MESSAGES: 'finance_os_advisor_messages_v1',
  DISMISSED_INSIGHTS: 'finance_os_dismissed_insights_v1',
  DEMO_MODE: 'finance_os_demo_mode_v1',
  TUTORIAL_COMPLETED: 'finance_tutorial_completed_v1',
  ONBOARDING_DISMISSED: 'finance_onboarding_dismissed',
} as const;

export interface ExportedFinancialBackup {
  meta: {
    app: 'Finance OS';
    version: string;
    schemaVersion: number;
    exportedAt: string;
  };
  data: {
    profile: FinancialProfile;
    transactions: Transaction[];
    budgets: Budget[];
    categories: Category[];
    missions: SavingsMission[];
    contributions: SavingsContribution[];
    investmentProfile: UserInvestmentProfile;
    investmentHoldings: InvestmentHolding[];
    dismissedInsightIds: string[];
  };
}

/**
 * Safely parses a JSON string from localStorage with type guard and fallback.
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[PersistenceManager] Failed to parse key "${key}", falling back to default:`, error);
    return fallback;
  }
}

/**
 * Safely serializes an item to localStorage, handling quota exceptions.
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[PersistenceManager] Failed to persist key "${key}":`, error);
    return false;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[PersistenceManager] Failed to remove key "${key}":`, error);
  }
}

/**
 * Runs lightweight, non-destructive schema migrations on load.
 */
export function runSchemaMigrations(): void {
  try {
    const rawVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    const storedVersion = rawVersion ? parseInt(rawVersion, 10) : 1;

    if (storedVersion < 2) {
      // Migration 1 -> 2: Migrate legacy transactions_v1 into transactions_v2
      const legacy = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS_LEGACY);
      const current = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (legacy && !current) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map((t: any) => ({
              ...t,
              recurring: Boolean(t.recurring),
              expenseType: t.expenseType || 'variable',
              essentiality: t.essentiality || 'essential',
              createdAt: t.createdAt || new Date().toISOString(),
              updatedAt: t.updatedAt || new Date().toISOString(),
            }));
            safeSetItem(STORAGE_KEYS.TRANSACTIONS, migrated);
          }
        } catch (err) {
          console.warn('[PersistenceManager] Migration 1->2 failed to parse legacy transactions:', err);
        }
      }
    }

    if (storedVersion < 3) {
      // Migration 2 -> 3: Normalize mission priority values
      const missionsRaw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (missionsRaw) {
        try {
          const missions = JSON.parse(missionsRaw);
          if (Array.isArray(missions)) {
            const migrated = missions.map((m: any) => {
              let priority = m.priority;
              if (priority === 'critical') priority = 'high';
              if (!['high', 'medium', 'low'].includes(priority)) priority = 'medium';
              return {
                ...m,
                priority,
                updatedAt: m.updatedAt || new Date().toISOString(),
              };
            });
            safeSetItem(STORAGE_KEYS.MISSIONS, migrated);
          }
        } catch (err) {
          console.warn('[PersistenceManager] Migration 2->3 failed:', err);
        }
      }
    }

    // Update to current schema version
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
  } catch (error) {
    console.warn('[PersistenceManager] Schema migration check encountered an error:', error);
  }
}

/**
 * Exports all user financial records into a sanitized JSON backup.
 * Strictly excludes any API keys, credentials, or private prompts.
 */
export function exportFullFinancialData(payload: {
  profile: FinancialProfile;
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  missions: SavingsMission[];
  contributions: SavingsContribution[];
  investmentProfile: UserInvestmentProfile;
  investmentHoldings: InvestmentHolding[];
  dismissedInsightIds: string[];
}): ExportedFinancialBackup {
  return {
    meta: {
      app: 'Finance OS',
      version: '1.0.0',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
    },
    data: {
      profile: payload.profile,
      transactions: payload.transactions,
      budgets: payload.budgets,
      categories: payload.categories,
      missions: payload.missions,
      contributions: payload.contributions,
      investmentProfile: payload.investmentProfile,
      investmentHoldings: payload.investmentHoldings,
      dismissedInsightIds: payload.dismissedInsightIds,
    },
  };
}

/**
 * Validates and restores a financial backup from a JSON string.
 */
export function validateAndParseBackup(jsonString: string): {
  success: boolean;
  data?: ExportedFinancialBackup['data'];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File content is not a valid JSON object.' };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      return { success: false, error: 'Backup is missing the core "data" root property.' };
    }

    const { data } = parsed;

    // Validate required structural collections
    if (!data.profile || typeof data.profile !== 'object') {
      return { success: false, error: 'Backup does not contain a valid financial profile.' };
    }

    if (!Array.isArray(data.transactions)) {
      return { success: false, error: 'Backup transactions must be an array.' };
    }

    if (!Array.isArray(data.budgets)) {
      return { success: false, error: 'Backup budgets must be an array.' };
    }

    if (!Array.isArray(data.missions)) {
      return { success: false, error: 'Backup missions must be an array.' };
    }

    return {
      success: true,
      data: {
        profile: data.profile,
        transactions: data.transactions,
        budgets: data.budgets,
        categories: Array.isArray(data.categories) ? data.categories : [],
        missions: data.missions,
        contributions: Array.isArray(data.contributions) ? data.contributions : [],
        investmentProfile: data.investmentProfile || {},
        investmentHoldings: Array.isArray(data.investmentHoldings) ? data.investmentHoldings : [],
        dismissedInsightIds: Array.isArray(data.dismissedInsightIds) ? data.dismissedInsightIds : [],
      },
    };
  } catch (err: any) {
    return { success: false, error: `JSON Parse error: ${err?.message || 'Invalid format'}` };
  }
}

/**
 * Safely purges all financial application stores from local storage.
 * Leaves unrelated browser items intact.
 */
export function safePurgeAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    safeRemoveItem(key);
  });
}
