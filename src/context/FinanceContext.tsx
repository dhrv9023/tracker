// ==========================================================================
// FINANCE OS — STATE MANAGEMENT & PERSISTENCE (PHASE 1, 2 & 3)
// Single source of truth connecting baseline profile, cash flow telemetry,
// and tactical savings missions.
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  FinancialProfile,
  FinancialSnapshot,
  FinancialHealthEvaluation,
  Transaction,
  Budget,
  Category,
  UserProfile,
  TransactionType,
  MonthlyCashFlowSummary,
  SavingsMission,
  SavingsContribution,
  SavingsContributionType,
  MissionConflictSummary,
  MissionStatus,
  UserInvestmentProfile,
  InvestmentHolding,
  InvestmentCapacityBreakdown,
  InvestmentReadinessEvaluation,
  AssetAllocationPlan,
  PortfolioAllocationSummary,
  CurrentVsTargetAllocation,
  AdvisorMessage,
  AdvisorScreenContext,
  AdvisorAction,
  CompactAdvisorFinancialContext,
  FinancialInsight,
  DataSufficiency,
  MonthlyReviewReport,
} from '../types/finance';
import { askAdvisor } from '../services/geminiAdvisorService';
import {
  evaluateDataSufficiency,
  generateAllInsights,
  generateMonthlyReviewReport,
} from '../utils/insightsEngine';

import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateFixedExpenses,
  calculateVariableExpenses,
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateInvestmentRate,
  calculateDebtToIncomeRatio,
  calculateExpenseRatio,
  calculateEmergencyFundMonths,
  calculateFinancialHealthScore,
  getCurrentMonthKey,
  filterTransactionsByMonth,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
  calculateFixedExpensesFromTransactions,
  calculateVariableExpensesFromTransactions,
  calculateEssentialExpensesFromTransactions,
  calculateDiscretionaryExpensesFromTransactions,
  getAdjacentMonth,
  calculateMissionProgress,
  calculateMissionConflict,
  calculateMissionFeasibility,
  calculateInvestmentReadiness,
  calculateInvestmentCapacity,
  calculateAssetAllocation,
  calculatePortfolioAllocation,
  calculateAllocationComparison,
  getLocalDateString,
} from '../utils/finance';
import {
  runSchemaMigrations,
  safePurgeAllData,
  exportFullFinancialData,
  validateAndParseBackup,
} from '../utils/persistenceManager';

const STORAGE_KEY_PROFILE = 'finance_os_profile_v1';
const STORAGE_KEY_TRANSACTIONS = 'finance_os_transactions_v2';
const STORAGE_KEY_TRANSACTIONS_LEGACY = 'finance_os_transactions_v1';
const STORAGE_KEY_BUDGETS = 'finance_os_budgets_v1';
const STORAGE_KEY_CATEGORIES = 'finance_os_categories_v1';
const STORAGE_KEY_MISSIONS = 'finance_os_missions_v1';
const STORAGE_KEY_CONTRIBUTIONS = 'finance_os_contributions_v1';
const STORAGE_KEY_INVESTMENT_PROFILE = 'finance_os_investment_profile_v1';
const STORAGE_KEY_INVESTMENT_HOLDINGS = 'finance_os_investment_holdings_v1';
const STORAGE_KEY_ADVISOR_MESSAGES = 'finance_os_advisor_messages_v1';
const STORAGE_KEY_DISMISSED_INSIGHTS = 'finance_os_dismissed_insights_v1';

export const INITIAL_ADVISOR_WELCOME_MESSAGE: AdvisorMessage = {
  id: 'msg-welcome-0',
  role: 'advisor',
  content:
    'FINANCIAL INTELLIGENCE TERMINAL ONLINE.\nI analyze your verified income, expenses, savings missions, and investments to provide tactical guidance. How can I assist your financial planning today?',
  timestamp: new Date().toISOString(),
  status: 'READY',
  intent: 'general_finance_question',
  keyFacts: ['Live context synchronized from verified database telemetry'],
  recommendations: ['Select a quick intelligence prompt below or submit a custom financial inquiry.'],
};


export const INITIAL_DEFAULT_INVESTMENT_PROFILE: UserInvestmentProfile = {
  riskProfile: 'moderate',
  investmentGoal: 'wealth',
  horizon: 'long',
  experience: 'some_experience',
  liquidityPreference: 'flexible',
  riskReaction: 'hold',
  emergencyTargetMonths: 6,
  safetyBufferPercent: 20,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_DEMO_HOLDINGS: InvestmentHolding[] = [
  {
    id: 'hold-1',
    name: 'Nifty 50 Index Fund',
    category: 'index_funds',
    investedAmount: 120000,
    currentValue: 142000,
    purchaseDate: '2025-01-15',
    notes: 'Core large-cap indexing',
    expectedReturnPct: 12,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'hold-2',
    name: 'Parag Parikh Flexi Cap',
    category: 'equity_mutual_funds',
    investedAmount: 60000,
    currentValue: 71500,
    purchaseDate: '2025-03-20',
    notes: 'Diversified multi-cap exposure',
    expectedReturnPct: 13,
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'hold-3',
    name: 'Bharat Bond ETF / Govt Bonds',
    category: 'govt_bonds',
    investedAmount: 40000,
    currentValue: 43200,
    purchaseDate: '2025-02-10',
    notes: 'Sovereign-backed fixed income',
    expectedReturnPct: 7.5,
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'hold-4',
    name: 'Sovereign Gold Bond (SGB)',
    category: 'gold',
    investedAmount: 30000,
    currentValue: 36000,
    purchaseDate: '2024-11-05',
    notes: 'Gold hedge with 2.5% annual interest',
    expectedReturnPct: 9,
    createdAt: '2024-11-05T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
];

export const INITIAL_EMPTY_PROFILE: FinancialProfile = {
  user: {
    name: '',
    age: 26,
    country: 'India',
    currency: 'INR',
  },
  income: {
    monthlySalary: 0,
    otherIncome: 0,
  },
  expenses: {
    fixed: {
      rent: 0,
      utilities: 0,
      internet: 0,
      phone: 0,
      insurance: 0,
      emi: 0,
      subscriptions: 0,
      transportation: 0,
      education: 0,
      other: 0,
    },
    variable: {
      food: 0,
      shopping: 0,
      entertainment: 0,
      travel: 0,
      miscellaneous: 0,
    },
  },
  position: {
    currentSavings: 0,
    emergencyFund: 0,
    existingInvestments: 0,
    debt: {
      outstandingLoans: 0,
      creditCardDebt: 0,
    },
  },
  priorities: [],
  riskPreference: 'moderate',
  hasCompletedOnboarding: false,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'cat-inc-1', name: 'Salary', type: 'income', isDefault: true, isArchived: false },
  { id: 'cat-inc-2', name: 'Freelance', type: 'income', isDefault: true, isArchived: false },
  { id: 'cat-inc-3', name: 'Business', type: 'income', isDefault: true, isArchived: false },
  { id: 'cat-inc-4', name: 'Interest', type: 'income', isDefault: true, isArchived: false },
  { id: 'cat-inc-5', name: 'Bonus', type: 'income', isDefault: true, isArchived: false },
  { id: 'cat-inc-6', name: 'Other', type: 'income', isDefault: true, isArchived: false },
  // Expense
  { id: 'cat-exp-1', name: 'Housing', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-2', name: 'Food', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-3', name: 'Transportation', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-4', name: 'Utilities', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-5', name: 'Healthcare', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-6', name: 'Education', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-7', name: 'Entertainment', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-8', name: 'Shopping', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-9', name: 'Travel', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-10', name: 'Subscriptions', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-11', name: 'Debt', type: 'expense', isDefault: true, isArchived: false },
  { id: 'cat-exp-12', name: 'Other', type: 'expense', isDefault: true, isArchived: false },
];

export const DEMO_PROFILE: FinancialProfile = {
  user: {
    name: 'Operative Demo',
    age: 28,
    country: 'India',
    currency: 'INR',
  },
  income: {
    monthlySalary: 75000,
    otherIncome: 0,
  },
  expenses: {
    fixed: {
      rent: 18000,
      utilities: 3500,
      internet: 1200,
      phone: 800,
      insurance: 2500,
      emi: 5000,
      subscriptions: 1000,
      transportation: 3000,
      education: 0,
      other: 0,
    },
    variable: {
      food: 4500,
      shopping: 1500,
      entertainment: 1000,
      travel: 0,
      miscellaneous: 0,
    },
  },
  position: {
    currentSavings: 150000,
    emergencyFund: 80000,
    existingInvestments: 200000,
    debt: {
      outstandingLoans: 0,
      creditCardDebt: 0,
    },
  },
  priorities: ['Emergency fund', 'Short-term purchases', 'Long-term wealth creation'],
  riskPreference: 'moderate',
  hasCompletedOnboarding: true,
  updatedAt: new Date().toISOString(),
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Current Month (2026-09)
  {
    id: 'demo-tx-1',
    type: 'income',
    amount: 75000,
    category: 'Salary',
    date: '2026-09-01',
    description: 'Tech Lead Monthly Salary',
    recurring: true,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'demo-tx-2',
    type: 'expense',
    amount: 18000,
    category: 'Housing',
    date: '2026-09-02',
    description: 'Apartment Lease Payment',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'essential',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'demo-tx-3',
    type: 'expense',
    amount: 5000,
    category: 'Debt',
    date: '2026-09-03',
    description: 'Vehicle Loan EMI',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'essential',
    createdAt: '2026-09-03T11:00:00Z',
    updatedAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'demo-tx-4',
    type: 'expense',
    amount: 4500,
    category: 'Food',
    date: '2026-09-05',
    description: 'Supermarket Provisions',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'essential',
    createdAt: '2026-09-05T14:30:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
  },
  {
    id: 'demo-tx-5',
    type: 'expense',
    amount: 3500,
    category: 'Utilities',
    date: '2026-09-06',
    description: 'Power & Water Bills',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'essential',
    createdAt: '2026-09-06T15:00:00Z',
    updatedAt: '2026-09-06T15:00:00Z',
  },
  {
    id: 'demo-tx-6',
    type: 'expense',
    amount: 3000,
    category: 'Transportation',
    date: '2026-09-07',
    description: 'Fuel & Metro card refill',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'essential',
    createdAt: '2026-09-07T16:00:00Z',
    updatedAt: '2026-09-07T16:00:00Z',
  },
  {
    id: 'demo-tx-7',
    type: 'expense',
    amount: 2500,
    category: 'Subscriptions',
    date: '2026-09-08',
    description: 'Cloud storage & streaming services',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'discretionary',
    createdAt: '2026-09-08T12:00:00Z',
    updatedAt: '2026-09-08T12:00:00Z',
  },
  {
    id: 'demo-tx-8',
    type: 'expense',
    amount: 2500,
    category: 'Food',
    date: '2026-09-09',
    description: 'Team dinner & coffee',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'discretionary',
    createdAt: '2026-09-09T20:00:00Z',
    updatedAt: '2026-09-09T20:00:00Z',
  },
  {
    id: 'demo-tx-9',
    type: 'expense',
    amount: 3000,
    category: 'Shopping',
    date: '2026-09-09',
    description: 'Ergonomic keyboard accessories',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'discretionary',
    createdAt: '2026-09-09T21:00:00Z',
    updatedAt: '2026-09-09T21:00:00Z',
  },

  // Prior Month (2026-08) for MoM comparisons
  {
    id: 'demo-tx-prev-1',
    type: 'income',
    amount: 75000,
    category: 'Salary',
    date: '2026-08-01',
    description: 'Tech Lead Monthly Salary',
    recurring: true,
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'demo-tx-prev-2',
    type: 'expense',
    amount: 18000,
    category: 'Housing',
    date: '2026-08-02',
    description: 'Apartment Lease Payment',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'essential',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'demo-tx-prev-3',
    type: 'expense',
    amount: 8000,
    category: 'Food',
    date: '2026-08-10',
    description: 'August Food & Dining',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'essential',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'demo-tx-prev-4',
    type: 'expense',
    amount: 6000,
    category: 'Shopping',
    date: '2026-08-20',
    description: 'Apparel & Tech gear',
    recurring: false,
    expenseType: 'variable',
    essentiality: 'discretionary',
    createdAt: '2026-08-20T14:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z',
  },
  {
    id: 'demo-tx-prev-5',
    type: 'expense',
    amount: 5000,
    category: 'Debt',
    date: '2026-08-05',
    description: 'Vehicle Loan EMI',
    recurring: true,
    expenseType: 'fixed',
    essentiality: 'essential',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  },
];

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'demo-b-1',
    category: 'Housing',
    monthlyLimit: 20000,
    notes: 'Fixed lease ceiling',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'demo-b-2',
    category: 'Food',
    monthlyLimit: 8000,
    notes: 'Groceries & social dining',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'demo-b-3',
    category: 'Transportation',
    monthlyLimit: 4000,
    notes: 'Fuel and transit budget',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'demo-b-4',
    category: 'Shopping',
    monthlyLimit: 5000,
    notes: 'Discretionary retail limit',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'demo-b-5',
    category: 'Entertainment',
    monthlyLimit: 3000,
    notes: 'Leisure cap',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const DEMO_MISSIONS: SavingsMission[] = [
  {
    id: 'demo-m-1',
    missionCode: 'MISSION 0042',
    name: 'MacBook Pro M-Series',
    description: 'Workstation upgrade for software engineering and design missions',
    category: 'Technology',
    targetAmount: 120000,
    initialAmount: 25000,
    currentAmount: 62000,
    targetDate: '2027-03-01',
    isAsap: false,
    monthlyContribution: 10000,
    priority: 'high',
    status: 'on_track',
    isArchived: false,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-09T12:00:00Z',
  },
  {
    id: 'demo-m-2',
    missionCode: 'MISSION 0010',
    name: 'Emergency Reserve Fortress',
    description: '6 months of liquid essential expense buffer',
    category: 'Emergency Fund',
    targetAmount: 180000,
    initialAmount: 60000,
    currentAmount: 80000,
    targetDate: '2027-06-01',
    isAsap: false,
    monthlyContribution: 10000,
    priority: 'high',
    status: 'on_track',
    isArchived: false,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'demo-m-3',
    missionCode: 'MISSION 0088',
    name: 'Tokyo & Kyoto Expedition',
    description: 'Autumn exploration and photography trip',
    category: 'Travel',
    targetAmount: 250000,
    initialAmount: 20000,
    currentAmount: 40000,
    targetDate: '2027-10-01',
    isAsap: false,
    monthlyContribution: 15000,
    priority: 'medium',
    status: 'tight',
    isArchived: false,
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'demo-m-4',
    missionCode: 'MISSION 0005',
    name: 'Ergonomic Desk Setup',
    description: 'Standing desk and ergonomic chair for home terminal',
    category: 'Technology',
    targetAmount: 45000,
    initialAmount: 15000,
    currentAmount: 45000,
    targetDate: '2026-08-01',
    isAsap: false,
    monthlyContribution: 10000,
    priority: 'low',
    status: 'completed',
    isArchived: false,
    completedAt: '2026-08-25T16:00:00Z',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-25T16:00:00Z',
  },
];

export const DEMO_CONTRIBUTIONS: SavingsContribution[] = [
  {
    id: 'demo-c-1',
    missionId: 'demo-m-1',
    amount: 12000,
    date: '2026-08-05',
    note: 'Salary allocation',
    type: 'monthly',
    createdAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'demo-c-2',
    missionId: 'demo-m-1',
    amount: 15000,
    date: '2026-08-25',
    note: 'Consulting bonus',
    type: 'bonus',
    createdAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'demo-c-3',
    missionId: 'demo-m-1',
    amount: 10000,
    date: '2026-09-02',
    note: 'September monthly savings',
    type: 'monthly',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'demo-c-4',
    missionId: 'demo-m-2',
    amount: 20000,
    date: '2026-08-10',
    note: 'Emergency buffer allocation',
    type: 'manual',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'demo-c-5',
    missionId: 'demo-m-3',
    amount: 20000,
    date: '2026-09-01',
    note: 'Vacation seed capital',
    type: 'manual',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'demo-c-6',
    missionId: 'demo-m-4',
    amount: 30000,
    date: '2026-08-25',
    note: 'Final deployment to complete goal',
    type: 'manual',
    createdAt: '2026-08-25T15:00:00Z',
  },
];

interface FinanceContextType {
  profile: FinancialProfile;
  isDemoMode: boolean;
  activeTab: string;
  showOnboardingModal: boolean;
  selectedMonth: string; // YYYY-MM
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  snapshot: FinancialSnapshot;
  monthlySummary: MonthlyCashFlowSummary;
  healthEvaluation: FinancialHealthEvaluation;
  hasTransactionsForSelectedMonth: boolean;
  // Missions
  missions: SavingsMission[];
  activeMissions: SavingsMission[];
  completedMissions: SavingsMission[];
  contributions: SavingsContribution[];
  missionConflict: MissionConflictSummary;
  totalMissionTargetCapital: number;
  totalMissionCapitalDeployed: number;
  overallMissionProgress: number;
  topPriorityMission: SavingsMission | null;
  totalMonthlyMissionRequirement: number;
  remainingFlexibleSurplus: number;
  // Navigation History
  tabHistory: string[];
  previousTab: string | null;
  goBack: () => void;
  canGoBack: boolean;
  dismissOnboarding: () => void;
  // Actions
  setActiveTab: (tab: string) => void;
  setShowOnboardingModal: (show: boolean) => void;
  setSelectedMonth: (month: string) => void;
  saveFinancialProfile: (updatedProfile: FinancialProfile) => void;
  updateUserProfile: (partial: Partial<UserProfile>) => void;
  toggleDemoMode: () => void;
  clearAllData: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (cat: { name: string; type: TransactionType }) => void;
  renameCategory: (id: string, newName: string) => void;
  archiveCategory: (id: string) => void;
  applyRecurringTransactions: (targetMonth: string) => void;
  // Mission Actions
  createMission: (mission: Omit<SavingsMission, 'id' | 'missionCode' | 'currentAmount' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt'>) => SavingsMission;
  updateMission: (mission: SavingsMission) => void;
  deleteMission: (id: string) => void;
  archiveMission: (id: string) => void;
  deployCapital: (data: { missionId: string; amount: number; date?: string; note?: string; type?: SavingsContributionType }) => void;
  updateContribution: (contribution: SavingsContribution) => void;
  deleteContribution: (id: string) => void;
  // Phase 5 Investment Planner
  investmentProfile: UserInvestmentProfile;
  investmentHoldings: InvestmentHolding[];
  investmentReadiness: InvestmentReadinessEvaluation;
  investmentCapacity: InvestmentCapacityBreakdown;
  assetAllocationPlan: AssetAllocationPlan;
  portfolioSummary: PortfolioAllocationSummary;
  allocationComparison: CurrentVsTargetAllocation[];
  saveInvestmentProfile: (profile: Partial<UserInvestmentProfile>) => void;
  addInvestmentHolding: (holding: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestmentHolding: (holding: InvestmentHolding) => void;
  deleteInvestmentHolding: (id: string) => void;
  // Phase 6 The Advisor
  advisorMessages: AdvisorMessage[];
  advisorScreenContext: AdvisorScreenContext | null;
  advisorLoading: boolean;
  pendingAutoPrompt: string | null;
  sendAdvisorMessage: (query: string) => Promise<void>;
  openAdvisorWithContext: (context: AdvisorScreenContext, autoPrompt?: string) => void;
  clearAdvisorHistory: () => void;
  clearPendingAutoPrompt: () => void;
  executeAdvisorAction: (action: AdvisorAction) => void;
  // Phase 7 Insights + Monthly Review
  insights: FinancialInsight[];
  dataSufficiency: DataSufficiency;
  dismissedInsightIds: string[];
  dismissInsight: (id: string) => void;
  resolveInsight: (id: string) => void;
  restoreDismissedInsights: () => void;
  getMonthlyReviewReport: (month?: string) => MonthlyReviewReport;
  // Phase 8 Persistence & Backup Management
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => { success: boolean; error?: string };
  purgeAllDataSecurely: () => void;
}


const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const RESET_DATA_VERSION_KEY = 'finance_os_reset_uptill_now_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear all previous/legacy saved user data once to ensure a clean slate
  if (typeof window !== 'undefined' && !localStorage.getItem(RESET_DATA_VERSION_KEY)) {
    try {
      safePurgeAllData();
      localStorage.setItem(RESET_DATA_VERSION_KEY, 'true');
    } catch {
      // ignore in SSR or restricted storage environments
    }
  }

  const [realProfile, setRealProfile] = useState<FinancialProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall through
      }
    }
    return INITIAL_EMPTY_PROFILE;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>([]);

  // Navigation History & Back Handler
  const setActiveTab = useCallback((nextTab: string) => {
    setActiveTabState((currentTab) => {
      if (currentTab !== nextTab) {
        setTabHistory((prev) => [...prev, currentTab]);
        try {
          window.history.pushState({ tab: nextTab }, '', '#' + nextTab);
        } catch {
          // ignore in restricted environments
        }
      }
      return nextTab;
    });
  }, []);

  const goBack = useCallback(() => {
    setTabHistory((prev) => {
      if (prev.length === 0) {
        setActiveTabState('dashboard');
        return [];
      }
      const newHistory = [...prev];
      const previous = newHistory.pop() || 'dashboard';
      setActiveTabState(previous);
      return newHistory;
    });
  }, []);

  const previousTab = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : (activeTab !== 'dashboard' ? 'dashboard' : null);
  const canGoBack = tabHistory.length > 0 || activeTab !== 'dashboard';

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTabState(e.state.tab);
      } else if (window.location.hash) {
        const hashTab = window.location.hash.replace('#', '');
        if (hashTab) {
          setActiveTabState(hashTab);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Safe Onboarding Modal state: never trap the user or ask on reload if dismissed or completed
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('finance_onboarding_dismissed') === 'true') {
        return false;
      }
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hasCompletedOnboarding) {
          return false;
        }
      }
    } catch {
      // Fall through
    }
    return false; // Default to false so user is NEVER blocked unexpectedly!
  });

  const dismissOnboarding = useCallback(() => {
    try {
      localStorage.setItem('finance_onboarding_dismissed', 'true');
    } catch {}
    setRealProfile((prev) => {
      const updated = {
        ...prev,
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setShowOnboardingModal(false);
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  // Real transactions persistence
  const [realTransactions, setRealTransactions] = useState<Transaction[]>(() => {
    const savedV2 = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (savedV2) {
      try {
        return JSON.parse(savedV2);
      } catch (e) {
        // ignore
      }
    }
    const savedV1 = localStorage.getItem(STORAGE_KEY_TRANSACTIONS_LEGACY);
    if (savedV1) {
      try {
        const parsed = JSON.parse(savedV1);
        return parsed.map((t: any) => ({
          ...t,
          recurring: false,
          expenseType: 'variable',
          essentiality: 'discretionary',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Real budgets persistence
  const [realBudgets, setRealBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Real categories persistence
  const [realCategories, setRealCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_DEFAULT_CATEGORIES;
  });

  // Real missions persistence
  const [realMissions, setRealMissions] = useState<SavingsMission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MISSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Real contributions persistence
  const [realContributions, setRealContributions] = useState<SavingsContribution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONTRIBUTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Real investment profile persistence
  const [realInvestmentProfile, setRealInvestmentProfile] = useState<UserInvestmentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INVESTMENT_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_DEFAULT_INVESTMENT_PROFILE;
  });

  // Real investment holdings persistence
  const [realHoldings, setRealHoldings] = useState<InvestmentHolding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INVESTMENT_HOLDINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Phase 6 Advisor state
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADVISOR_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [INITIAL_ADVISOR_WELCOME_MESSAGE];
  });

  const [advisorScreenContext, setAdvisorScreenContext] = useState<AdvisorScreenContext | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState<boolean>(false);
  const [pendingAutoPrompt, setPendingAutoPrompt] = useState<string | null>(null);
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISMISSED_INSIGHTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Run schema migrations and integrity check on mount
  useEffect(() => {
    runSchemaMigrations();
  }, []);

  // Effective data depending on demo mode
  const effectiveProfile = useMemo(() => (isDemoMode ? DEMO_PROFILE : realProfile), [isDemoMode, realProfile]);
  const effectiveTransactions = useMemo(() => (isDemoMode ? DEMO_TRANSACTIONS : realTransactions), [isDemoMode, realTransactions]);
  const effectiveBudgets = useMemo(() => (isDemoMode ? DEMO_BUDGETS : realBudgets), [isDemoMode, realBudgets]);
  const effectiveCategories = useMemo(() => realCategories, [realCategories]);
  const rawMissions = useMemo(() => (isDemoMode ? DEMO_MISSIONS : realMissions), [isDemoMode, realMissions]);
  const rawContributions = useMemo(() => (isDemoMode ? DEMO_CONTRIBUTIONS : realContributions), [isDemoMode, realContributions]);
  const effectiveInvestmentProfile = useMemo(() => realInvestmentProfile, [realInvestmentProfile]);
  const effectiveHoldings = useMemo(() => {
    if (isDemoMode && realHoldings.length === 0) {
      return INITIAL_DEMO_HOLDINGS;
    }
    return realHoldings;
  }, [isDemoMode, realHoldings]);

  // Sync real profile to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(realProfile));
    }
  }, [realProfile, isDemoMode]);

  // Sync transactions to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(realTransactions));
    }
  }, [realTransactions, isDemoMode]);

  // Sync budgets to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(realBudgets));
    }
  }, [realBudgets, isDemoMode]);

  // Sync categories to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(realCategories));
  }, [realCategories]);

  // Sync missions to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(realMissions));
    }
  }, [realMissions, isDemoMode]);

  // Sync contributions to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(realContributions));
    }
  }, [realContributions, isDemoMode]);

  // Sync investment profile to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_INVESTMENT_PROFILE, JSON.stringify(realInvestmentProfile));
    }
  }, [realInvestmentProfile, isDemoMode]);

  // Sync investment holdings to localStorage
  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY_INVESTMENT_HOLDINGS, JSON.stringify(realHoldings));
    }
  }, [realHoldings, isDemoMode]);

  // Filtered transactions for selected month and previous month
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(effectiveTransactions, selectedMonth);
  }, [effectiveTransactions, selectedMonth]);

  const previousMonthKey = useMemo(() => getAdjacentMonth(selectedMonth, -1), [selectedMonth]);

  const previousMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(effectiveTransactions, previousMonthKey);
  }, [effectiveTransactions, previousMonthKey]);

  const hasTransactionsForSelectedMonth = currentMonthTransactions.length > 0;

  // Monthly summary for selected month
  const monthlySummary = useMemo<MonthlyCashFlowSummary>(() => {
    const totalIncome = calculateMonthlyIncome(currentMonthTransactions);
    const totalExpenses = calculateMonthlyExpenses(currentMonthTransactions);
    const netCashFlow = calculateNetCashFlow(totalIncome, totalExpenses);
    const isDeficit = netCashFlow < 0;
    const savingsRate = calculateSavingsRate(Math.max(0, netCashFlow), totalIncome);
    const fixedExpenses = calculateFixedExpensesFromTransactions(currentMonthTransactions);
    const variableExpenses = calculateVariableExpensesFromTransactions(currentMonthTransactions);
    const essentialExpenses = calculateEssentialExpensesFromTransactions(currentMonthTransactions);
    const discretionaryExpenses = calculateDiscretionaryExpensesFromTransactions(currentMonthTransactions);

    return {
      month: selectedMonth,
      totalIncome,
      totalExpenses,
      netCashFlow,
      isDeficit,
      savingsRate,
      fixedExpenses,
      variableExpenses,
      essentialExpenses,
      discretionaryExpenses,
      transactionCount: currentMonthTransactions.length,
    };
  }, [currentMonthTransactions, selectedMonth]);

  // Single Source of Truth Snapshot for Dashboard
  const snapshot = useMemo<FinancialSnapshot>(() => {
    if (hasTransactionsForSelectedMonth) {
      const totalIncome = monthlySummary.totalIncome;
      const totalExpenses = monthlySummary.totalExpenses;
      const fixedExpenses = monthlySummary.fixedExpenses;
      const variableExpenses = monthlySummary.variableExpenses;
      const monthlySurplus = monthlySummary.netCashFlow;
      const isDeficit = monthlySummary.isDeficit;
      const savingsRate = monthlySummary.savingsRate;
      const investmentRate = calculateInvestmentRate(effectiveProfile.position.existingInvestments, totalIncome);
      const debtToIncomeRatio = calculateDebtToIncomeRatio(effectiveProfile.expenses.fixed.emi || 0, totalIncome);
      const expenseRatio = calculateExpenseRatio(totalExpenses, totalIncome);

      const essentialMonthlyExpenses = monthlySummary.essentialExpenses > 0
        ? monthlySummary.essentialExpenses
        : (fixedExpenses + 5000);

      const emergencyFundMonths = calculateEmergencyFundMonths(
        effectiveProfile.position.emergencyFund,
        essentialMonthlyExpenses
      );

      return {
        totalIncome,
        totalExpenses,
        fixedExpenses,
        variableExpenses,
        monthlySurplus,
        isDeficit,
        savingsRate,
        investmentRate,
        debtToIncomeRatio,
        expenseRatio,
        emergencyFundMonths,
      };
    }

    const totalIncome = calculateTotalIncome(effectiveProfile.income);
    const fixedExpenses = calculateFixedExpenses(effectiveProfile.expenses.fixed);
    const variableExpenses = calculateVariableExpenses(effectiveProfile.expenses.variable);
    const totalExpenses = fixedExpenses + variableExpenses;
    const monthlySurplus = calculateMonthlySurplus(totalIncome, totalExpenses);
    const isDeficit = monthlySurplus < 0;
    const savingsRate = calculateSavingsRate(Math.max(0, monthlySurplus), totalIncome);
    const investmentRate = calculateInvestmentRate(effectiveProfile.position.existingInvestments, totalIncome);
    const debtToIncomeRatio = calculateDebtToIncomeRatio(effectiveProfile.expenses.fixed.emi || 0, totalIncome);
    const expenseRatio = calculateExpenseRatio(totalExpenses, totalIncome);

    const essentialExpenses =
      effectiveProfile.expenses.fixed.rent +
      effectiveProfile.expenses.fixed.utilities +
      effectiveProfile.expenses.fixed.phone +
      effectiveProfile.expenses.fixed.internet +
      effectiveProfile.expenses.fixed.insurance +
      effectiveProfile.expenses.fixed.emi +
      effectiveProfile.expenses.variable.food;

    const emergencyFundMonths = calculateEmergencyFundMonths(
      effectiveProfile.position.emergencyFund,
      essentialExpenses
    );

    return {
      totalIncome,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      monthlySurplus,
      isDeficit,
      savingsRate,
      investmentRate,
      debtToIncomeRatio,
      expenseRatio,
      emergencyFundMonths,
    };
  }, [hasTransactionsForSelectedMonth, monthlySummary, effectiveProfile]);

  // Synchronize Missions with Contribution Logs (Single Source of Truth)
  const synchronizedMissions = useMemo<SavingsMission[]>(() => {
    const todayStr = getLocalDateString();
    return rawMissions.map((m) => {
      const missionContribs = rawContributions.filter((c) => c.missionId === m.id);
      const totalContributed = missionContribs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
      const currentAmount = Math.min(m.targetAmount, (Number(m.initialAmount) || 0) + totalContributed);

      let status = m.status;
      let completedAt = m.completedAt;

      if (currentAmount >= m.targetAmount) {
        status = 'completed';
        if (!completedAt) completedAt = new Date().toISOString();
      } else if (m.targetDate && m.targetDate < todayStr.substring(0, 7) && status !== 'completed') {
        status = 'overdue';
      }

      return {
        ...m,
        currentAmount,
        status,
        completedAt,
      };
    });
  }, [rawMissions, rawContributions]);

  // Active vs Completed Missions
  const activeMissions = useMemo(() => {
    return synchronizedMissions.filter((m) => !m.isArchived && m.status !== 'completed');
  }, [synchronizedMissions]);

  const completedMissions = useMemo(() => {
    return synchronizedMissions.filter((m) => m.status === 'completed' || m.isArchived);
  }, [synchronizedMissions]);

  // Mission Summary Metrics
  const totalMissionTargetCapital = useMemo(() => {
    return activeMissions.reduce((sum, m) => sum + (Number(m.targetAmount) || 0), 0);
  }, [activeMissions]);

  const totalMissionCapitalDeployed = useMemo(() => {
    return activeMissions.reduce((sum, m) => sum + (Number(m.currentAmount) || 0), 0);
  }, [activeMissions]);

  const overallMissionProgress = useMemo(() => {
    return calculateMissionProgress(totalMissionCapitalDeployed, totalMissionTargetCapital);
  }, [totalMissionCapitalDeployed, totalMissionTargetCapital]);

  // Top Priority Mission (high > medium > low)
  const topPriorityMission = useMemo(() => {
    if (activeMissions.length === 0) return null;
    const sorted = [...activeMissions].sort((a, b) => {
      const pWeight = { high: 3, medium: 2, low: 1 };
      return pWeight[b.priority] - pWeight[a.priority];
    });
    return sorted[0];
  }, [activeMissions]);

  // Total monthly contribution committed across all active missions
  const totalMonthlyMissionRequirement = useMemo(() => {
    return activeMissions.reduce((sum, m) => sum + (Number(m.monthlyContribution) || 0), 0);
  }, [activeMissions]);

  // Mission Conflict Detection
  const missionConflict = useMemo(() => {
    return calculateMissionConflict(activeMissions, snapshot.monthlySurplus);
  }, [activeMissions, snapshot.monthlySurplus]);

  // Remaining flexible surplus after active mission allocations
  const remainingFlexibleSurplus = useMemo(() => {
    return Math.max(0, snapshot.monthlySurplus - totalMonthlyMissionRequirement);
  }, [snapshot.monthlySurplus, totalMonthlyMissionRequirement]);

  // Financial Health Evaluation
  const healthEvaluation = useMemo<FinancialHealthEvaluation>(() => {
    const essentialExpenses =
      hasTransactionsForSelectedMonth && monthlySummary.essentialExpenses > 0
        ? monthlySummary.essentialExpenses
        : effectiveProfile.expenses.fixed.rent +
          effectiveProfile.expenses.fixed.utilities +
          effectiveProfile.expenses.fixed.phone +
          effectiveProfile.expenses.fixed.internet +
          effectiveProfile.expenses.fixed.insurance +
          effectiveProfile.expenses.fixed.emi +
          effectiveProfile.expenses.variable.food;

    return calculateFinancialHealthScore({
      totalIncome: snapshot.totalIncome,
      totalExpenses: snapshot.totalExpenses,
      monthlyDebt: effectiveProfile.expenses.fixed.emi || 0,
      emergencyFund: effectiveProfile.position.emergencyFund,
      essentialMonthlyExpenses: essentialExpenses,
    });
  }, [effectiveProfile, snapshot, hasTransactionsForSelectedMonth, monthlySummary]);

  // Profile actions
  const saveFinancialProfile = (updated: FinancialProfile) => {
    const finalized: FinancialProfile = {
      ...updated,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    setRealProfile(finalized);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(finalized));
      localStorage.setItem('finance_onboarding_dismissed', 'true');
    } catch {}
    setIsDemoMode(false);
    setShowOnboardingModal(false);
  };

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setRealProfile((prev) => {
      const next = {
        ...prev,
        user: { ...prev.user, ...partial },
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
        localStorage.setItem('finance_onboarding_dismissed', 'true');
      } catch {}
      return next;
    });
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next) {
        setShowOnboardingModal(false);
      } else {
        setShowOnboardingModal(!realProfile.hasCompletedOnboarding);
      }
      return next;
    });
  };

  // Phase 5 Investment Planner derived state
  const investmentReadiness = useMemo(() => {
    const essentialExpenses =
      hasTransactionsForSelectedMonth && monthlySummary.essentialExpenses > 0
        ? monthlySummary.essentialExpenses
        : effectiveProfile.expenses.fixed.rent +
          effectiveProfile.expenses.fixed.utilities +
          effectiveProfile.expenses.fixed.phone +
          effectiveProfile.expenses.fixed.internet +
          effectiveProfile.expenses.fixed.insurance +
          effectiveProfile.expenses.fixed.emi +
          effectiveProfile.expenses.variable.food;

    const totalDebt = (Number(effectiveProfile.position.debt.outstandingLoans) || 0) + (Number(effectiveProfile.position.debt.creditCardDebt) || 0);
    const creditCard = Number(effectiveProfile.position.debt.creditCardDebt) || 0;
    const monthlyDebt = effectiveProfile.expenses.fixed.emi || Math.round(totalDebt * 0.03);

    return calculateInvestmentReadiness({
      monthlyIncome: snapshot.totalIncome,
      monthlyExpenses: snapshot.totalExpenses,
      monthlySurplus: snapshot.monthlySurplus,
      essentialMonthlyExpenses: essentialExpenses,
      currentEmergencyFund: effectiveProfile.position.emergencyFund,
      emergencyTargetMonths: effectiveInvestmentProfile.emergencyTargetMonths || 6,
      outstandingDebt: totalDebt,
      creditCardDebt: creditCard,
      monthlyDebtPayment: monthlyDebt,
      debtToIncomeRatio: snapshot.debtToIncomeRatio,
    });
  }, [effectiveProfile, snapshot, hasTransactionsForSelectedMonth, monthlySummary, effectiveInvestmentProfile.emergencyTargetMonths]);

  const investmentCapacity = useMemo(() => {
    return calculateInvestmentCapacity({
      monthlyIncome: snapshot.totalIncome,
      monthlyExpenses: snapshot.totalExpenses,
      monthlySurplus: snapshot.monthlySurplus,
      activeMissionsCommitment: totalMonthlyMissionRequirement,
      emergencyFundShortfall: investmentReadiness.emergencyFundShortfall,
      safetyBufferPercent: effectiveInvestmentProfile.safetyBufferPercent || 20,
    });
  }, [snapshot, totalMonthlyMissionRequirement, investmentReadiness.emergencyFundShortfall, effectiveInvestmentProfile.safetyBufferPercent]);

  const assetAllocationPlan = useMemo(() => {
    return calculateAssetAllocation(
      investmentCapacity.potentialMonthlyCapacity,
      effectiveInvestmentProfile.riskProfile,
      effectiveInvestmentProfile.horizon,
      investmentReadiness.status
    );
  }, [investmentCapacity.potentialMonthlyCapacity, effectiveInvestmentProfile.riskProfile, effectiveInvestmentProfile.horizon, investmentReadiness.status]);

  const portfolioSummary = useMemo(() => {
    return calculatePortfolioAllocation(effectiveHoldings);
  }, [effectiveHoldings]);

  const allocationComparison = useMemo(() => {
    return calculateAllocationComparison(effectiveHoldings, assetAllocationPlan);
  }, [effectiveHoldings, assetAllocationPlan]);

  // Phase 7: Previous Month Snapshot for MoM Comparisons
  const previousSnapshot = useMemo<FinancialSnapshot | null>(() => {
    if (previousMonthTransactions.length === 0) return null;
    const totalIncome = calculateMonthlyIncome(previousMonthTransactions);
    const totalExpenses = calculateMonthlyExpenses(previousMonthTransactions);
    const monthlySurplus = calculateNetCashFlow(totalIncome, totalExpenses);
    const isDeficit = monthlySurplus < 0;
    const savingsRate = calculateSavingsRate(Math.max(0, monthlySurplus), totalIncome);
    const fixedExpenses = calculateFixedExpensesFromTransactions(previousMonthTransactions);
    const variableExpenses = calculateVariableExpensesFromTransactions(previousMonthTransactions);
    return {
      totalIncome,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      monthlySurplus,
      isDeficit,
      savingsRate,
      investmentRate: snapshot.investmentRate,
      debtToIncomeRatio: snapshot.debtToIncomeRatio,
      expenseRatio: calculateExpenseRatio(totalExpenses, totalIncome),
      emergencyFundMonths: snapshot.emergencyFundMonths,
    };
  }, [previousMonthTransactions, snapshot]);

  // Phase 7: Deterministic Data Sufficiency Telemetry
  const dataSufficiency = useMemo<DataSufficiency>(() => {
    return evaluateDataSufficiency(effectiveTransactions);
  }, [effectiveTransactions]);

  // Phase 7: Deterministic Financial Insights Engine
  const insights = useMemo<FinancialInsight[]>(() => {
    const totalDebt = (Number(effectiveProfile.position.debt.outstandingLoans) || 0) + (Number(effectiveProfile.position.debt.creditCardDebt) || 0);
    const hasHighCostDebt = (Number(effectiveProfile.position.debt.creditCardDebt) || 0) > 0;

    return generateAllInsights({
      snapshot,
      previousSnapshot,
      transactions: effectiveTransactions,
      budgets: effectiveBudgets,
      missions: synchronizedMissions,
      totalDebt,
      hasHighCostDebt,
      investmentReadiness,
      investmentCapacity,
      selectedMonth,
      dismissedIds: dismissedInsightIds,
    });
  }, [
    snapshot,
    previousSnapshot,
    effectiveTransactions,
    effectiveBudgets,
    synchronizedMissions,
    effectiveProfile.position.debt,
    investmentReadiness,
    investmentCapacity,
    selectedMonth,
    dismissedInsightIds,
  ]);

  const dismissInsight = (id: string) => {
    setDismissedInsightIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED_INSIGHTS, JSON.stringify(next));
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });
  };

  const resolveInsight = (id: string) => {
    dismissInsight(id);
  };

  const restoreDismissedInsights = () => {
    setDismissedInsightIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY_DISMISSED_INSIGHTS);
    } catch (e) {
      // ignore
    }
  };

  const getMonthlyReviewReport = (month?: string): MonthlyReviewReport => {
    const targetMonth = month || selectedMonth;
    const totalDebt = (Number(effectiveProfile.position.debt.outstandingLoans) || 0) + (Number(effectiveProfile.position.debt.creditCardDebt) || 0);
    const hasHighCostDebt = (Number(effectiveProfile.position.debt.creditCardDebt) || 0) > 0;

    return generateMonthlyReviewReport({
      selectedMonth: targetMonth,
      transactions: effectiveTransactions,
      budgets: effectiveBudgets,
      missions: synchronizedMissions,
      snapshot,
      investmentReadiness,
      investmentCapacity,
      portfolioSummary,
      totalDebt,
      hasHighCostDebt,
    });
  };

  const clearAllData = () => {
    safePurgeAllData();
    setRealProfile(INITIAL_EMPTY_PROFILE);
    setIsDemoMode(false);
    setRealTransactions([]);
    setRealBudgets([]);
    setRealCategories(INITIAL_DEFAULT_CATEGORIES);
    setRealMissions([]);
    setRealContributions([]);
    setRealInvestmentProfile(INITIAL_DEFAULT_INVESTMENT_PROFILE);
    setRealHoldings([]);
    setDismissedInsightIds([]);
    setShowOnboardingModal(false);
  };

  // Transaction mutations
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRealTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setRealTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? { ...updatedTx, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setRealTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Budget mutations
  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRealBudgets((prev) => [...prev.filter((b) => b.category !== budget.category), newBudget]);
  };

  const updateBudget = (updated: Budget) => {
    setRealBudgets((prev) =>
      prev.map((b) => (b.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : b))
    );
  };

  const deleteBudget = (id: string) => {
    setRealBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Category mutations
  const addCategory = (cat: { name: string; type: TransactionType }) => {
    const exists = realCategories.some((c) => c.name.toLowerCase() === cat.name.trim().toLowerCase());
    if (exists) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name.trim(),
      type: cat.type,
      isDefault: false,
      isArchived: false,
    };
    setRealCategories((prev) => [...prev, newCat]);
  };

  const renameCategory = (id: string, newName: string) => {
    setRealCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c))
    );
  };

  const archiveCategory = (id: string) => {
    setRealCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
    );
  };

  // Recurring transactions
  const applyRecurringTransactions = (targetMonth: string) => {
    const recurringTemplates = effectiveTransactions.filter((t) => t.recurring);
    const existingInTargetMonth = effectiveTransactions.filter((t) => t.date && t.date.startsWith(targetMonth));

    const toAdd: Transaction[] = [];

    recurringTemplates.forEach((template) => {
      const alreadyExists = existingInTargetMonth.some(
        (t) => t.category === template.category && t.description === template.description
      );

      if (!alreadyExists) {
        const day = template.date ? template.date.split('-')[2] || '01' : '01';
        toAdd.push({
          id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: template.type,
          amount: template.amount,
          category: template.category,
          date: `${targetMonth}-${day}`,
          description: template.description,
          recurring: true,
          expenseType: template.expenseType,
          essentiality: template.essentiality,
          notes: 'Auto-applied recurring obligation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (toAdd.length > 0) {
      setRealTransactions((prev) => [...toAdd, ...prev]);
    }
  };

  // ========================================================================
  // PHASE 3: SAVINGS MISSIONS ACTIONS
  // ========================================================================

  const createMission = (
    data: Omit<SavingsMission, 'id' | 'missionCode' | 'currentAmount' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt'>
  ): SavingsMission => {
    const count = realMissions.length + 1;
    const missionCode = `MISSION ${String(count).padStart(4, '0')}`;
    const initial = Math.max(0, Number(data.initialAmount) || 0);
    const target = Math.max(0, Number(data.targetAmount) || 0);

    const feasibility = calculateMissionFeasibility({
      targetAmount: target,
      currentAmount: initial,
      targetDate: data.targetDate,
      isAsap: data.isAsap,
      availableSurplus: snapshot.monthlySurplus,
      userSelectedContribution: data.monthlyContribution,
    });

    const newMission: SavingsMission = {
      ...data,
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      missionCode,
      currentAmount: initial,
      status: initial >= target ? 'completed' : feasibility.status,
      completedAt: initial >= target ? new Date().toISOString() : undefined,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRealMissions((prev) => [newMission, ...prev]);
    return newMission;
  };

  const updateMission = (updated: SavingsMission) => {
    setRealMissions((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deleteMission = (id: string) => {
    setRealMissions((prev) => prev.filter((m) => m.id !== id));
    setRealContributions((prev) => prev.filter((c) => c.missionId !== id));
  };

  const archiveMission = (id: string) => {
    setRealMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: true, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deployCapital = (data: {
    missionId: string;
    amount: number;
    date?: string;
    note?: string;
    type?: SavingsContributionType;
  }) => {
    const contribution: SavingsContribution = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      missionId: data.missionId,
      amount: Math.max(1, Math.round(Number(data.amount) || 0)),
      date: data.date || getLocalDateString(),
      note: data.note || 'Planning capital deployment',
      type: data.type || 'manual',
      createdAt: new Date().toISOString(),
    };

    setRealContributions((prev) => [contribution, ...prev]);
  };

  const updateContribution = (updated: SavingsContribution) => {
    setRealContributions((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const deleteContribution = (id: string) => {
    setRealContributions((prev) => prev.filter((c) => c.id !== id));
  };

  // ========================================================================
  // PHASE 5: INVESTMENT PLANNER ACTIONS
  // ========================================================================

  const saveInvestmentProfile = (partial: Partial<UserInvestmentProfile>) => {
    setRealInvestmentProfile((prev) => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  };

  const addInvestmentHolding = (data: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHolding: InvestmentHolding = {
      ...data,
      id: `hold-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRealHoldings((prev) => [newHolding, ...prev]);
  };

  const updateInvestmentHolding = (holding: InvestmentHolding) => {
    setRealHoldings((prev) =>
      prev.map((h) => (h.id === holding.id ? { ...holding, updatedAt: new Date().toISOString() } : h))
    );
  };

  const deleteInvestmentHolding = (id: string) => {
    setRealHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Phase 6 Advisor actions
  const openAdvisorWithContext = (screenCtx: AdvisorScreenContext, autoPrompt?: string) => {
    setAdvisorScreenContext(screenCtx);
    setActiveTab('advisor');
    if (autoPrompt || screenCtx.initialQuery) {
      setPendingAutoPrompt(autoPrompt || screenCtx.initialQuery || null);
    }
  };

  const clearPendingAutoPrompt = () => {
    setPendingAutoPrompt(null);
  };

  const clearAdvisorHistory = () => {
    setAdvisorMessages([INITIAL_ADVISOR_WELCOME_MESSAGE]);
    try {
      localStorage.removeItem(STORAGE_KEY_ADVISOR_MESSAGES);
    } catch (e) {
      // ignore
    }
  };

  const executeAdvisorAction = (action: AdvisorAction) => {
    switch (action.type) {
      case 'NAVIGATE':
        if (action.payload?.tab) setActiveTab(action.payload.tab);
        break;
      case 'OPEN_CASH_FLOW':
      case 'OPEN_BUDGET':
        setActiveTab('cashflow');
        break;
      case 'OPEN_MISSION':
      case 'CREATE_MISSION':
        setActiveTab('missions');
        break;
      case 'OPEN_INVESTMENTS':
      case 'ADJUST_SIP':
        setActiveTab('assets');
        break;
      default:
        if (action.payload?.tab) setActiveTab(action.payload.tab);
        break;
    }
  };

  const sendAdvisorMessage = async (query: string) => {
    if (!query || query.trim().length === 0 || advisorLoading) return;

    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...advisorMessages, userMsg];
    setAdvisorMessages(updatedHistory);
    setAdvisorLoading(true);

    try {
      // Assemble structured compact context
      const compactContext: CompactAdvisorFinancialContext = {
        financial_profile: {
          monthly_income: snapshot.totalIncome,
          other_income: effectiveProfile.income.otherIncome,
          monthly_expenses: snapshot.totalExpenses,
          fixed_expenses: snapshot.fixedExpenses,
          variable_expenses: snapshot.variableExpenses,
          essential_expenses: monthlySummary.essentialExpenses,
          discretionary_expenses: monthlySummary.discretionaryExpenses,
          monthly_surplus: snapshot.monthlySurplus,
          savings_rate: snapshot.savingsRate,
          investment_rate: snapshot.investmentRate,
          debt: effectiveProfile.position.debt.outstandingLoans + effectiveProfile.position.debt.creditCardDebt,
          debt_to_income_ratio: snapshot.debtToIncomeRatio,
          emergency_fund: effectiveProfile.position.emergencyFund,
          emergency_fund_months: snapshot.emergencyFundMonths,
          current_investments: effectiveProfile.position.existingInvestments,
        },
        savings: {
          active_missions_count: activeMissions.length,
          total_target: totalMissionTargetCapital,
          total_saved: totalMissionCapitalDeployed,
          total_remaining: Math.max(0, totalMissionTargetCapital - totalMissionCapitalDeployed),
          monthly_requirement: totalMonthlyMissionRequirement,
          has_conflicts: missionConflict.hasConflict,
          at_risk_missions: activeMissions
            .filter((m) => m.status === 'at_risk' || m.status === 'not_feasible')
            .map((m) => m.name),
          active_missions: activeMissions.map((m) => ({
            id: m.id,
            name: m.name,
            target: m.targetAmount,
            current: m.currentAmount,
            remaining: Math.max(0, m.targetAmount - m.currentAmount),
            monthly: m.monthlyContribution,
            deadline: m.targetDate,
            priority: m.priority,
            feasibility: m.status,
          })),
        },
        investments: {
          readiness: investmentReadiness.status,
          risk_profile: effectiveInvestmentProfile.riskProfile,
          investment_capacity: investmentCapacity.potentialMonthlyCapacity,
          current_allocation: assetAllocationPlan.items.map((i) => ({
            category: i.label,
            amount: i.monthlyAmount,
            percentage: i.percentage,
          })),
          recommended_allocation: assetAllocationPlan.items.map((i) => ({
            category: i.label,
            amount: i.monthlyAmount,
            percentage: i.percentage,
          })),
          current_holdings_count: effectiveHoldings.length,
          total_portfolio_value: portfolioSummary.currentValue,
        },
        budgets: {
          monthly_budgets_count: effectiveBudgets.length,
          category_spending: effectiveBudgets.map((b) => ({
            category: b.category,
            amount: currentMonthTransactions
              .filter((t) => t.category === b.category && t.type === 'expense')
              .reduce((acc, c) => acc + c.amount, 0),
            percentage: 0,
          })),
          overspending_categories: effectiveBudgets
            .filter((b) => {
              const spent = currentMonthTransactions
                .filter((t) => t.category === b.category && t.type === 'expense')
                .reduce((acc, c) => acc + c.amount, 0);
              return spent > b.monthlyLimit;
            })
            .map((b) => b.category),
          budget_variances: effectiveBudgets.map((b) => {
            const spent = currentMonthTransactions
              .filter((t) => t.category === b.category && t.type === 'expense')
              .reduce((acc, c) => acc + c.amount, 0);
            return { category: b.category, budget: b.monthlyLimit, spent, variance: b.monthlyLimit - spent };
          }),
        },
        screen_context: advisorScreenContext || undefined,
      };

      const advisorResult = await askAdvisor({
        userQuery: query.trim(),
        context: compactContext,
        conversationHistory: advisorMessages.slice(-6).map((m) => ({
          role: m.role === 'user' ? 'user' : 'advisor',
          content: m.content,
        })),
        snapshot,
        missions: synchronizedMissions,
        budgets: effectiveBudgets,
        transactions: effectiveTransactions,
        investmentReadiness,
        investmentCapacity,
        screenContext: advisorScreenContext || undefined,
      });

      const advisorMsg: AdvisorMessage = {
        id: `advisor-${Date.now()}`,
        role: 'advisor',
        content: advisorResult.answer,
        timestamp: new Date().toISOString(),
        intent: advisorResult.intent,
        status: advisorResult.status,
        keyFacts: advisorResult.key_facts,
        calculations: advisorResult.calculations,
        recommendations: advisorResult.recommendations,
        warnings: advisorResult.warnings,
        scenarioOptions: advisorResult.scenario_options,
        actions: advisorResult.actions,
      };

      const finalHistory = [...updatedHistory, advisorMsg];
      setAdvisorMessages(finalHistory);
      try {
        localStorage.setItem(STORAGE_KEY_ADVISOR_MESSAGES, JSON.stringify(finalHistory.slice(-20)));
      } catch (e) {
        // ignore storage quota issues
      }
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Phase 8 Persistence & Backup Management
  const exportDataJson = useCallback((): string => {
    const backup = exportFullFinancialData({
      profile: realProfile,
      transactions: realTransactions,
      budgets: realBudgets,
      categories: realCategories,
      missions: realMissions,
      contributions: realContributions,
      investmentProfile: realInvestmentProfile,
      investmentHoldings: realHoldings,
      dismissedInsightIds,
    });
    return JSON.stringify(backup, null, 2);
  }, [
    realProfile,
    realTransactions,
    realBudgets,
    realCategories,
    realMissions,
    realContributions,
    realInvestmentProfile,
    realHoldings,
    dismissedInsightIds,
  ]);

  const importDataJson = useCallback((jsonString: string): { success: boolean; error?: string } => {
    const res = validateAndParseBackup(jsonString);
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Failed to parse backup' };
    }
    const d = res.data;
    if (d.profile) setRealProfile(d.profile);
    if (Array.isArray(d.transactions)) setRealTransactions(d.transactions);
    if (Array.isArray(d.budgets)) setRealBudgets(d.budgets);
    if (Array.isArray(d.categories) && d.categories.length > 0) setRealCategories(d.categories);
    if (Array.isArray(d.missions)) setRealMissions(d.missions);
    if (Array.isArray(d.contributions)) setRealContributions(d.contributions);
    if (d.investmentProfile && Object.keys(d.investmentProfile).length > 0) {
      setRealInvestmentProfile(d.investmentProfile as UserInvestmentProfile);
    }
    if (Array.isArray(d.investmentHoldings)) setRealHoldings(d.investmentHoldings);
    if (Array.isArray(d.dismissedInsightIds)) setDismissedInsightIds(d.dismissedInsightIds);

    return { success: true };
  }, []);

  const purgeAllDataSecurely = useCallback((): void => {
    safePurgeAllData();
    setRealProfile(INITIAL_EMPTY_PROFILE);
    setIsDemoMode(false);
    setRealTransactions([]);
    setRealBudgets([]);
    setRealCategories(INITIAL_DEFAULT_CATEGORIES);
    setRealMissions([]);
    setRealContributions([]);
    setRealInvestmentProfile(INITIAL_DEFAULT_INVESTMENT_PROFILE);
    setRealHoldings([]);
    setDismissedInsightIds([]);
    setShowOnboardingModal(false);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        profile: effectiveProfile,
        isDemoMode,
        activeTab,
        showOnboardingModal,
        selectedMonth,
        transactions: effectiveTransactions,
        currentMonthTransactions,
        previousMonthTransactions,
        budgets: effectiveBudgets,
        categories: effectiveCategories,
        snapshot,
        monthlySummary,
        healthEvaluation,
        hasTransactionsForSelectedMonth,
        // Missions
        missions: synchronizedMissions,
        activeMissions,
        completedMissions,
        contributions: rawContributions,
        missionConflict,
        totalMissionTargetCapital,
        totalMissionCapitalDeployed,
        overallMissionProgress,
        topPriorityMission,
        totalMonthlyMissionRequirement,
        remainingFlexibleSurplus,
        // Navigation History
        tabHistory,
        previousTab,
        goBack,
        canGoBack,
        dismissOnboarding,
        // Actions
        setActiveTab,
        setShowOnboardingModal,
        setSelectedMonth,
        saveFinancialProfile,
        updateUserProfile,
        toggleDemoMode,
        clearAllData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addCategory,
        renameCategory,
        archiveCategory,
        applyRecurringTransactions,
        // Mission Actions
        createMission,
        updateMission,
        deleteMission,
        archiveMission,
        deployCapital,
        updateContribution,
        deleteContribution,
        // Phase 5 Investment Planner
        investmentProfile: effectiveInvestmentProfile,
        investmentHoldings: effectiveHoldings,
        investmentReadiness,
        investmentCapacity,
        assetAllocationPlan,
        portfolioSummary,
        allocationComparison,
        saveInvestmentProfile,
        addInvestmentHolding,
        updateInvestmentHolding,
        deleteInvestmentHolding,
        // Phase 6 The Advisor
        advisorMessages,
        advisorScreenContext,
        advisorLoading,
        pendingAutoPrompt,
        sendAdvisorMessage,
        openAdvisorWithContext,
        clearAdvisorHistory,
        clearPendingAutoPrompt,
        executeAdvisorAction,
        // Phase 7 Insights + Monthly Review
        insights,
        dataSufficiency,
        dismissedInsightIds,
        dismissInsight,
        resolveInsight,
        restoreDismissedInsights,
        getMonthlyReviewReport,
        // Phase 8 Persistence & Backup Management
        exportDataJson,
        importDataJson,
        purgeAllDataSecurely,
      }}
    >

      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
