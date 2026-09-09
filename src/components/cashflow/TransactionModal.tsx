// ==========================================================================
// FINANCE OS — TRANSACTION MODAL (ADD & EDIT)
// Tactical form with field validation, recurring options, and classifications.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, ExpenseType, Essentiality } from '../../types/finance';
import { formatINR, getLocalDateString } from '../../utils/finance';
import { X, Check, AlertCircle, Calendar, Tag, FileText, Repeat, Layers, Shield } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialData,
  onClose,
}) => {
  const { categories, selectedMonth, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>('variable');
  const [essentiality, setEssentiality] = useState<Essentiality>('essential');
  const [notes, setNotes] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
    type?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
      setRecurring(initialData.recurring || false);
      setExpenseType(initialData.expenseType || 'variable');
      setEssentiality(initialData.essentiality || 'essential');
      setNotes(initialData.notes || '');
    } else {
      // Default to selected month's today or 1st
      const today = getLocalDateString();
      const initialDate = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDate(initialDate);
      setDescription('');
      setRecurring(false);
      setExpenseType('variable');
      setEssentiality('essential');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, selectedMonth]);

  if (!isOpen) return null;

  // Filter categories by selected transaction type (excluding archived unless editing an existing one)
  const availableCategories = categories.filter((c) => {
    if (c.type !== type) return false;
    if (c.isArchived && (!initialData || initialData.category !== c.name)) return false;
    return true;
  });

  // Handle smart defaults when type or category changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCats = categories.filter((c) => c.type === newType && !c.isArchived);
    if (validCats.length > 0) {
      setCategory(validCats[0].name);
    }
    if (newType === 'income') {
      setExpenseType('variable');
      setEssentiality('essential');
    }
  };

  const handleRecurringToggle = (isRec: boolean) => {
    setRecurring(isRec);
    if (type === 'expense') {
      // Smart heuristic: recurring expenses default to fixed
      setExpenseType(isRec ? 'fixed' : 'variable');
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (type === 'expense') {
      const essentialCats = ['Housing', 'Food', 'Utilities', 'Transportation', 'Healthcare', 'Education', 'Debt'];
      setEssentiality(essentialCats.includes(newCat) ? 'essential' : 'discretionary');
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero.';
    }

    if (!date || isNaN(Date.parse(date))) {
      newErrors.date = 'Please select a valid calendar date.';
    }

    if (!category.trim()) {
      newErrors.category = 'Category selection is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      amount: Math.round(Number(amount)),
      category: category.trim(),
      date,
      description: description.trim() || `${category} ${type}`,
      recurring,
      ...(type === 'expense' ? { expenseType, essentiality } : {}),
      notes: notes.trim(),
    };

    if (initialData) {
      updateTransaction({
        ...initialData,
        ...payload,
      });
    } else {
      addTransaction(payload);
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card-elevated)',
          border: '1px solid rgba(229, 9, 20, 0.4)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          padding: '1.75rem',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="status-pill status-pill-red">
              {initialData ? 'MODIFICATION' : 'NEW ENTRY'}
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {initialData ? 'EDIT TRANSACTION' : 'RECORD TRANSACTION'}
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
          {/* 1. TRANSACTION TYPE (Income vs Expense) */}
          <div>
            <label className="ui-label">TRANSACTION TYPE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                style={{
                  background: type === 'income' ? 'rgba(6, 214, 160, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${type === 'income' ? 'var(--status-green)' : 'var(--border-subtle)'}`,
                  color: type === 'income' ? 'var(--status-green)' : 'var(--text-secondary)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="pulsing-dot" style={{ background: type === 'income' ? 'var(--status-green)' : 'transparent' }} />
                + Inflow (Income)
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                style={{
                  background: type === 'expense' ? 'var(--red-badge-bg)' : 'var(--bg-card)',
                  border: `1px solid ${type === 'expense' ? 'var(--red-bright)' : 'var(--border-subtle)'}`,
                  color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span className="pulsing-dot" style={{ background: type === 'expense' ? 'var(--red-bright)' : 'transparent' }} />
                − Outflow (Expense)
              </button>
            </div>
          </div>

          {/* 2. AMOUNT */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="ui-label">AMOUNT (₹)</label>
              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <span className="font-mono" style={{ fontSize: '0.75rem', color: type === 'income' ? 'var(--status-green)' : 'var(--status-red)', fontWeight: 700 }}>
                  {formatINR(Number(amount))}
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
                placeholder="0"
                className="tactical-input font-mono"
                style={{
                  paddingLeft: '28px',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  borderColor: errors.amount ? 'var(--status-red)' : undefined,
                }}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
              />
            </div>
            {errors.amount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-red)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                <AlertCircle size={13} />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>

          {/* 3. CATEGORY & DATE (2-col grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Category */}
            <div>
              <label className="ui-label">CATEGORY</label>
              <select
                className="tactical-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{ borderColor: errors.category ? 'var(--status-red)' : undefined }}
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-red)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  <AlertCircle size={13} />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="ui-label">TRANSACTION DATE</label>
              <input
                type="date"
                className="tactical-input font-mono"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                style={{ borderColor: errors.date ? 'var(--status-red)' : undefined }}
              />
              {errors.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-red)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  <AlertCircle size={13} />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. DESCRIPTION */}
          <div>
            <label className="ui-label">DESCRIPTION (OPTIONAL)</label>
            <input
              type="text"
              placeholder="e.g. Shell Fuel Station, Groceries, Client Milestone"
              className="tactical-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 5. RECURRING TOGGLE */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Repeat size={16} style={{ color: recurring ? 'var(--red-bright)' : 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Recurring Monthly</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Auto-generates into upcoming month views
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleRecurringToggle(false)}
                className={`btn-tactical ${!recurring ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleRecurringToggle(true)}
                className={`btn-tactical ${recurring ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Yes
              </button>
            </div>
          </div>

          {/* 6. EXPENSE CLASSIFICATIONS (Fixed vs Variable & Essential vs Discretionary) */}
          {type === 'expense' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                TACTICAL CLASSIFICATIONS
              </div>

              {/* Fixed vs Variable */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={15} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>Nature</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setExpenseType('fixed')}
                    style={{
                      background: expenseType === 'fixed' ? 'var(--red-badge-bg)' : 'transparent',
                      border: `1px solid ${expenseType === 'fixed' ? 'var(--red-bright)' : 'var(--border-subtle)'}`,
                      color: expenseType === 'fixed' ? '#ffffff' : 'var(--text-muted)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseType('variable')}
                    style={{
                      background: expenseType === 'variable' ? 'var(--red-badge-bg)' : 'transparent',
                      border: `1px solid ${expenseType === 'variable' ? 'var(--red-bright)' : 'var(--border-subtle)'}`,
                      color: expenseType === 'variable' ? '#ffffff' : 'var(--text-muted)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Variable
                  </button>
                </div>
              </div>

              {/* Essential vs Discretionary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={15} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>Priority</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setEssentiality('essential')}
                    style={{
                      background: essentiality === 'essential' ? 'rgba(6, 214, 160, 0.15)' : 'transparent',
                      border: `1px solid ${essentiality === 'essential' ? 'var(--status-green)' : 'var(--border-subtle)'}`,
                      color: essentiality === 'essential' ? 'var(--status-green)' : 'var(--text-muted)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Essential
                  </button>
                  <button
                    type="button"
                    onClick={() => setEssentiality('discretionary')}
                    style={{
                      background: essentiality === 'discretionary' ? 'rgba(255, 183, 3, 0.15)' : 'transparent',
                      border: `1px solid ${essentiality === 'discretionary' ? 'var(--status-yellow)' : 'var(--border-subtle)'}`,
                      color: essentiality === 'discretionary' ? 'var(--status-yellow)' : 'var(--text-muted)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Discretionary
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. NOTES */}
          <div>
            <label className="ui-label">NOTES (OPTIONAL)</label>
            <textarea
              rows={2}
              placeholder="Additional operational context or invoice reference..."
              className="tactical-input"
              style={{ resize: 'none' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Form Actions */}
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
              {initialData ? 'UPDATE TRANSACTION' : 'RECORD TRANSACTION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
