// ==========================================================================
// FINANCE OS — CASH FLOW & BUDGET SYSTEM (PHASE 2)
// Full operational console: Multi-month navigation, transaction ledger CRUD,
// budget tracking, category spending radar, and deterministic insights.
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, Budget } from '../../types/finance';
import {
  formatINR,
  formatMonthLabel,
  getAdjacentMonth,
  getCurrentMonthKey,
  formatTransactionDate,
  calculateCategorySpending,
  calculateBudgetProgress,
  calculateMonthOverMonthChange,
  generateDeterministicInsights,
} from '../../utils/finance';
import { TransactionModal } from './TransactionModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { BudgetModal } from './BudgetModal';
import { SpendingChart } from './SpendingChart';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Layers,
  Shield,
  Clock,
  Info,
  Terminal,
  HelpCircle,
  ReceiptText,
} from 'lucide-react';

export const CashFlowView: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    currentMonthTransactions,
    previousMonthTransactions,
    budgets,
    categories,
    monthlySummary,
    deleteTransaction,
    deleteBudget,
    applyRecurringTransactions,
    isDemoMode,
    openAdvisorWithContext,
  } = useFinance();


  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Month navigation helpers
  const currentMonthKey = getCurrentMonthKey();
  const previousMonthKey = getAdjacentMonth(selectedMonth, -1);
  const nextMonthKey = getAdjacentMonth(selectedMonth, 1);

  // Category spending breakdown for current month
  const categorySpending = useMemo(() => {
    return calculateCategorySpending(currentMonthTransactions, 'expense');
  }, [currentMonthTransactions]);

  // Budget progress evaluations
  const budgetEvaluations = useMemo(() => {
    return budgets.map((b) => calculateBudgetProgress(b, currentMonthTransactions));
  }, [budgets, currentMonthTransactions]);

  // Budget summary totals
  const budgetSummary = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpentInBudgeted = budgetEvaluations.reduce((sum, b) => sum + b.actualSpent, 0);
    const totalRemaining = Math.max(0, totalBudgeted - totalSpentInBudgeted);
    const variance = totalBudgeted - totalSpentInBudgeted; // positive is surplus / under budget
    return { totalBudgeted, totalSpentInBudgeted, totalRemaining, variance };
  }, [budgets, budgetEvaluations]);

  // Month-over-month comparison
  const monthOverMonth = useMemo(() => {
    return calculateMonthOverMonthChange(
      currentMonthTransactions,
      previousMonthTransactions,
      previousMonthKey,
      selectedMonth
    );
  }, [currentMonthTransactions, previousMonthTransactions, previousMonthKey, selectedMonth]);

  // Deterministic insights
  const insights = useMemo(() => {
    return generateDeterministicInsights(
      currentMonthTransactions,
      previousMonthTransactions,
      budgets
    );
  }, [currentMonthTransactions, previousMonthTransactions, budgets]);

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = (t.description || '').toLowerCase().includes(q);
          const matchCat = (t.category || '').toLowerCase().includes(q);
          const matchAmt = t.amount.toString().includes(q);
          if (!matchDesc && !matchCat && !matchAmt) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentMonthTransactions, typeFilter, categoryFilter, searchQuery]);

  // Group transactions by date for reverse chronological timeline
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((t) => {
      const existing = dateMap.get(t.date) || [];
      existing.push(t);
      dateMap.set(t.date, existing);
    });

    dateMap.forEach((items, date) => {
      groups.push({ date, items });
    });

    return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  // Handlers
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenDeleteTx = (tx: Transaction) => {
    setTxToDelete(tx);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTx = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
    }
  };

  const handleOpenAddBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. HEADER & MONTH SELECTOR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="pulsing-dot" />
            <span className="status-pill status-pill-red">CASH FLOW MATRIX</span>
            {isDemoMode && <span className="status-pill status-pill-yellow">DEMO DATA</span>}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            CASH FLOW & BUDGET CONSOLE
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track every rupee across inflows, committed obligations, and category thresholds.
          </p>
        </div>

        {/* Tactical Month Selector Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem 0.5rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button
            type="button"
            onClick={() => setSelectedMonth(previousMonthKey)}
            className="btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '6px' }}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
            <Calendar size={15} style={{ color: 'var(--red-bright)' }} />
            <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
              {formatMonthLabel(selectedMonth).toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth(nextMonthKey)}
            className="btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '6px' }}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>

          {selectedMonth !== currentMonthKey && (
            <button
              type="button"
              onClick={() => setSelectedMonth(currentMonthKey)}
              className="btn-tactical btn-ghost"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', marginLeft: '0.25rem' }}
            >
              Current
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() =>
              openAdvisorWithContext(
                { page: 'cashflow' },
                `Analyze my spending patterns for ${formatMonthLabel(selectedMonth)}, identify overspending categories, and recommend where I can cut expenses.`
              )
            }
            style={{
              background: 'rgba(230, 57, 70, 0.15)',
              border: '1px solid rgba(230, 57, 70, 0.5)',
              color: '#f8f9fa',
              fontSize: '0.8rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
            }}
          >
            <Terminal size={14} color="var(--red-bright)" /> ANALYZE SPENDING
          </button>

          <button
            type="button"
            onClick={handleOpenAddBudget}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.1rem' }}
          >
            <Target size={14} /> + DEFINE BUDGET
          </button>

          <button
            type="button"
            onClick={handleOpenAddTx}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.1rem' }}
          >
            <Plus size={15} /> + RECORD TRANSACTION
          </button>
        </div>

      </div>

      {/* 2. MONTHLY OVERVIEW HUD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        {/* Total Income */}
        <div className="ui-card ui-card-highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="ui-label" style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.8)' }}>TOTAL INFLOW</span>
            <ArrowUpRight size={18} style={{ color: 'var(--status-green)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {formatINR(monthlySummary.totalIncome)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Recorded Income for {formatMonthLabel(selectedMonth)}
          </span>
        </div>

        {/* Total Expenses */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="ui-label" style={{ marginBottom: 0 }}>TOTAL OUTFLOW</span>
            <ArrowDownRight size={18} style={{ color: 'var(--status-red)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {formatINR(monthlySummary.totalExpenses)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Fixed: {formatINR(monthlySummary.fixedExpenses)} | Var: {formatINR(monthlySummary.variableExpenses)}
          </span>
        </div>

        {/* Net Cash Flow (Surplus or Deficit) */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span
              className="ui-label"
              style={{
                color: monthlySummary.isDeficit ? 'var(--status-red)' : 'var(--status-green)',
                marginBottom: 0,
              }}
            >
              {monthlySummary.isDeficit ? 'MONTHLY DEFICIT' : 'NET CASH FLOW'}
            </span>
            <span
              className="pulsing-dot"
              style={{ background: monthlySummary.isDeficit ? 'var(--status-red)' : 'var(--status-green)' }}
            />
          </div>
          <div
            className="mono-figure"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: monthlySummary.isDeficit ? 'var(--status-red)' : 'var(--status-green)',
            }}
          >
            {monthlySummary.isDeficit
              ? `-${formatINR(Math.abs(monthlySummary.netCashFlow))}`
              : formatINR(monthlySummary.netCashFlow)}
          </div>
          <span style={{ fontSize: '0.75rem', color: monthlySummary.isDeficit ? 'var(--status-red)' : 'var(--status-green)' }}>
            {monthlySummary.isDeficit ? 'Expenses exceed verified income' : 'Unallocated liquid surplus'}
          </span>
        </div>

        {/* Savings Rate & Split */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="ui-label" style={{ marginBottom: 0 }}>SAVINGS RATE</span>
            <TrendingUp size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {monthlySummary.savingsRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Essential: {formatINR(monthlySummary.essentialExpenses)} | Discr: {formatINR(monthlySummary.discretionaryExpenses)}
          </span>
        </div>
      </div>

      {/* 3. DETERMINISTIC INSIGHTS STRIP */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="ui-card"
              style={{
                borderLeft: `4px solid ${
                  insight.type === 'warning'
                    ? 'var(--status-red)'
                    : insight.type === 'success'
                    ? 'var(--status-green)'
                    : 'var(--status-yellow)'
                }`,
                background:
                  insight.type === 'warning'
                    ? 'rgba(239, 71, 111, 0.08)'
                    : insight.type === 'success'
                    ? 'rgba(6, 214, 160, 0.08)'
                    : 'rgba(255, 183, 3, 0.08)',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              {insight.type === 'warning' ? (
                <AlertTriangle size={18} style={{ color: 'var(--status-red)', flexShrink: 0 }} />
              ) : insight.type === 'success' ? (
                <CheckCircle2 size={18} style={{ color: 'var(--status-green)', flexShrink: 0 }} />
              ) : (
                <Info size={18} style={{ color: 'var(--status-yellow)', flexShrink: 0 }} />
              )}
              <div style={{ flexGrow: 1 }}>
                <span className="ui-label" style={{ fontSize: '0.65rem', marginBottom: '0.1rem' }}>
                  {insight.title}
                </span>
                <p style={{ fontSize: '0.825rem', color: '#ffffff', margin: 0 }}>{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. NO TRANSACTION DATA EMPTY STATE (SECTION 30) */}
      {currentMonthTransactions.length === 0 && (
        <div
          className="ui-card ui-card-highlight"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-bright)',
            }}
          >
            <Clock size={28} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              NO TRANSACTION DATA FOR {formatMonthLabel(selectedMonth).toUpperCase()}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto 0', lineHeight: 1.6 }}>
              Record your first transaction to activate cash-flow analysis, budget tracking, and real category breakdowns for this month.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleOpenAddTx}
              className="btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={15} /> ADD TRANSACTION
            </button>

            <button
              type="button"
              onClick={() => applyRecurringTransactions(selectedMonth)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Repeat size={15} /> Apply Recurring Commitments
            </button>
          </div>
        </div>
      )}

      {/* 5. SPENDING BREAKDOWN & BUDGET TRACKING (2-COLUMN GRID) */}
      {currentMonthTransactions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Spending Radar Chart */}
          <SpendingChart categories={categorySpending} totalExpenses={monthlySummary.totalExpenses} />

          {/* Budget Tracking Panel */}
          <div className="ui-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="status-pill status-pill-red">MONTHLY CEILINGS</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
                  BUDGET STATUS & LIMITS
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenAddBudget}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--red-bright)' }}
              >
                + Add Ceiling
              </button>
            </div>

            {/* Budget Analysis Strip */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TOTAL BUDGETED</div>
                <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                  {formatINR(budgetSummary.totalBudgeted)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TOTAL SPENT</div>
                <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-red)' }}>
                  {formatINR(budgetSummary.totalSpentInBudgeted)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>REMAINING</div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: budgetSummary.variance >= 0 ? 'var(--status-green)' : 'var(--status-red)',
                  }}
                >
                  {budgetSummary.variance >= 0 ? formatINR(budgetSummary.variance) : `-${formatINR(Math.abs(budgetSummary.variance))}`}
                </div>
              </div>
            </div>

            {/* Budget Category Progress Items */}
            {budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No category budgets defined yet. Click "+ Add Ceiling" to establish spending thresholds.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '340px', paddingRight: '0.25rem' }}>
                {budgetEvaluations.map((b) => {
                  const statusColor =
                    b.status === 'over_budget'
                      ? 'var(--status-red)'
                      : b.status === 'approaching_limit'
                      ? 'var(--status-yellow)'
                      : 'var(--status-green)';

                  const statusLabel =
                    b.status === 'over_budget'
                      ? 'OVER BUDGET'
                      : b.status === 'approaching_limit'
                      ? 'APPROACHING LIMIT'
                      : 'UNDER CONTROL';

                  return (
                    <div
                      key={b.category}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{b.category}</span>
                          <span
                            className={`status-pill ${
                              b.status === 'over_budget'
                                ? 'status-pill-red'
                                : b.status === 'approaching_limit'
                                ? 'status-pill-yellow'
                                : 'status-pill-green'
                            }`}
                            style={{ fontSize: '0.55rem' }}
                          >
                            {statusLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openAdvisorWithContext(
                                { page: 'cashflow', selectedCategory: b.category },
                                `Explain my spending of ${formatINR(b.actualSpent)} against the ${formatINR(b.budgetLimit)} budget in ${b.category}.`
                              )
                            }
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Explain this spending with Advisor"
                          >
                            <HelpCircle size={13} />
                          </button>
                        </div>


                        <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                          {formatINR(b.actualSpent)} / <span style={{ color: 'var(--text-muted)' }}>{formatINR(b.budgetLimit)}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-bar-track" style={{ height: '6px', margin: '0.4rem 0' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, b.percentUsed)}%`,
                            background: statusColor,
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{b.percentUsed}% consumed</span>
                        <span style={{ color: b.variance >= 0 ? 'var(--status-green)' : 'var(--status-red)', fontWeight: 600 }}>
                          {b.variance >= 0 ? `${formatINR(b.remaining)} remaining` : `${formatINR(Math.abs(b.variance))} over limit`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MONTH-OVER-MONTH COMPARISON (SECTION 29) */}
      {monthOverMonth && (previousMonthTransactions.length > 0 || currentMonthTransactions.length > 0) && (
        <div className="ui-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span className="status-pill status-pill-red">DELTA AUDIT</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
                MONTH-OVER-MONTH COMPARISON (VS {formatMonthLabel(previousMonthKey).toUpperCase()})
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Income Delta */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="ui-label">INFLOW DELTA</span>
              <div
                className="mono-figure"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: monthOverMonth.incomeChange >= 0 ? 'var(--status-green)' : 'var(--status-red)',
                  margin: '0.2rem 0',
                }}
              >
                {monthOverMonth.incomeChange >= 0 ? `+${formatINR(monthOverMonth.incomeChange)}` : formatINR(monthOverMonth.incomeChange)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs prior month</span>
            </div>

            {/* Expense Delta (decrease is positive!) */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="ui-label">OUTFLOW DELTA</span>
              <div
                className="mono-figure"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: monthOverMonth.expenseChange <= 0 ? 'var(--status-green)' : 'var(--status-red)',
                  margin: '0.2rem 0',
                }}
              >
                {monthOverMonth.expenseChange <= 0 ? `−${formatINR(Math.abs(monthOverMonth.expenseChange))}` : `+${formatINR(monthOverMonth.expenseChange)}`}
              </div>
              <span style={{ fontSize: '0.75rem', color: monthOverMonth.expenseChange <= 0 ? 'var(--status-green)' : 'var(--text-muted)' }}>
                {monthOverMonth.expenseChange <= 0 ? 'Spending reduction (Favorable)' : 'Increased spending load'}
              </span>
            </div>

            {/* Net Cash Flow Delta */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="ui-label">NET VELOCITY DELTA</span>
              <div
                className="mono-figure"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: monthOverMonth.netCashFlowChange >= 0 ? 'var(--status-green)' : 'var(--status-red)',
                  margin: '0.2rem 0',
                }}
              >
                {monthOverMonth.netCashFlowChange >= 0 ? `+${formatINR(monthOverMonth.netCashFlowChange)}` : formatINR(monthOverMonth.netCashFlowChange)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surplus variance</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. TRANSACTION LEDGER MATRIX & FILTERS (SECTION 10 & 11) */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        {/* Ledger Header & Search Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="status-pill status-pill-neutral">{filteredTransactions.length} ENTRIES</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                TRANSACTION LEDGER
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reverse chronological log of verified cash flow movements.
            </p>
          </div>

          {/* Filters & Search Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                className="tactical-input font-mono"
                style={{ paddingLeft: '30px', fontSize: '0.8rem', width: '180px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '2px' }}>
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  style={{
                    background: typeFilter === t ? 'var(--red-badge-bg)' : 'transparent',
                    border: 'none',
                    color: typeFilter === t ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              className="tactical-select"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '140px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction Rows Grouped by Date */}
        {groupedTransactions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(230, 57, 70, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--red-bright)',
              }}
            >
              <ReceiptText size={24} />
            </div>
            <div
              className="mono-figure"
              style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', marginBottom: '0.4rem' }}
            >
              {currentMonthTransactions.length === 0
                ? `NO CASH FLOW TELEMETRY LOGGED FOR ${formatMonthLabel(selectedMonth).toUpperCase()}`
                : 'NO TRANSACTIONS MATCH ACTIVE FILTERS'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {currentMonthTransactions.length === 0
                ? 'Record verified income or operational outlays to activate real-time cash flow telemetry, burn rate analysis, and automated budget safeguards.'
                : 'Try adjusting your search terms, transaction type, or category selection to display matching items.'}
            </p>
            {currentMonthTransactions.length === 0 ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTx(null);
                    setIsTxModalOpen(true);
                  }}
                  className="ui-btn ui-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Plus size={15} />
                  LOG FIRST TRANSACTION
                </button>
                <button
                  type="button"
                  onClick={() => applyRecurringTransactions(selectedMonth)}
                  className="ui-btn ui-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Repeat size={14} />
                  APPLY RECURRING TEMPLATES
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                }}
                className="ui-btn ui-btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                CLEAR ALL FILTERS
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-tactical)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, width: '110px' }}>DATE</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>DESCRIPTION</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, width: '140px' }}>CATEGORY</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, width: '100px' }}>TYPE</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right', width: '140px' }}>AMOUNT</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right', width: '90px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--duration-fast) var(--ease-out)',
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatTransactionDate(t.date)}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                          {t.description || `${t.category} entry`}
                        </span>
                        {t.recurring && (
                          <span className="status-pill status-pill-yellow" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                            <Repeat size={8} /> RECURRING
                          </span>
                        )}
                      </div>
                      {t.notes && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {t.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span className="status-pill status-pill-neutral" style={{ fontSize: '0.62rem' }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.7rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: t.type === 'income' ? 'var(--status-green)' : 'var(--text-muted)' }}>
                      {t.type}
                    </td>
                    <td
                      className="mono-figure"
                      style={{
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textAlign: 'right',
                        color: t.type === 'income' ? 'var(--status-green)' : '#ffffff',
                      }}
                    >
                      {t.type === 'income' ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditTx(t)}
                          className="btn-ghost"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteTx(t)}
                          className="btn-ghost"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Add / Edit Modal */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          initialData={editingTx}
          onClose={() => {
            setIsTxModalOpen(false);
            setEditingTx(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          transaction={txToDelete}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTxToDelete(null);
          }}
          onConfirm={handleConfirmDeleteTx}
        />
      )}

      {/* Budget Modal */}
      {isBudgetModalOpen && (
        <BudgetModal
          isOpen={isBudgetModalOpen}
          initialData={editingBudget}
          onClose={() => {
            setIsBudgetModalOpen(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default CashFlowView;
