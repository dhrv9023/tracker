// ==========================================================================
// FINANCE OS — BUDGET MODAL (ADD & EDIT CATEGORY BUDGET)
// Defines monthly category spending ceilings and tracking targets.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { formatINR } from '../../utils/finance';
import { X, Target, AlertCircle } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  initialData?: Budget | null;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  initialData,
  onClose,
}) => {
  const { categories, addBudget, updateBudget, selectedMonth } = useFinance();

  const [category, setCategory] = useState<string>('Food');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.isArchived);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setMonthlyLimit(initialData.monthlyLimit.toString());
      setNotes(initialData.notes || '');
    } else {
      setCategory(expenseCategories[0]?.name || 'Food');
      setMonthlyLimit('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = Number(monthlyLimit);
    if (!monthlyLimit || isNaN(limit) || limit <= 0) {
      setError('Budget monthly limit must be greater than zero.');
      return;
    }

    if (!category.trim()) {
      setError('Please select an expense category.');
      return;
    }

    const payload = {
      category: category.trim(),
      monthlyLimit: Math.round(limit),
      notes: notes.trim(),
      month: selectedMonth,
    };

    if (initialData) {
      updateBudget({
        ...initialData,
        ...payload,
      });
    } else {
      addBudget(payload);
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '1rem',
      }}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card-elevated)',
          border: '1px solid rgba(229, 9, 20, 0.4)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="status-pill status-pill-red">BUDGET PROTOCOL</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {initialData ? 'EDIT BUDGET CEILING' : 'ADD MONTHLY BUDGET'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Category Select */}
          <div>
            <label className="ui-label">EXPENSE CATEGORY</label>
            <select
              className="tactical-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!initialData}
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Limit */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="ui-label">MONTHLY LIMIT (₹)</label>
              {monthlyLimit && Number(monthlyLimit) > 0 && (
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatINR(Number(monthlyLimit))}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 8000"
                className="tactical-input font-mono"
                style={{ paddingLeft: '28px', fontSize: '1.15rem', fontWeight: 700 }}
                value={monthlyLimit}
                onChange={(e) => {
                  setMonthlyLimit(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="ui-label">TARGET NOTES (OPTIONAL)</label>
            <input
              type="text"
              placeholder="e.g. Groceries & dining ceiling"
              className="tactical-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-red)', fontSize: '0.75rem' }}>
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              {initialData ? 'SAVE CEILING' : 'ESTABLISH BUDGET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
