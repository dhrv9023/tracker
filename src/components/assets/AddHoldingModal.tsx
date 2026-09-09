// ==========================================================================
// FINANCE OS — ADD / EDIT INVESTMENT HOLDING MODAL (PHASE 5)
// Allows manual tracking of existing assets with category classification.
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { InvestmentHolding, AssetCategory } from '../../types/finance';
import { getLocalDateString } from '../../utils/finance';
import { X, Plus, Save, Trash2, Calendar, FileText, Tag, DollarSign } from 'lucide-react';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: Omit<InvestmentHolding, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (holding: InvestmentHolding) => void;
  onDelete?: (id: string) => void;
  initialHolding?: InvestmentHolding | null;
}

const CATEGORY_OPTIONS: { id: AssetCategory; label: string; group: string }[] = [
  { id: 'index_funds', label: 'Broad-market Index Fund', group: 'Equity' },
  { id: 'equity_mutual_funds', label: 'Active Equity Mutual Fund', group: 'Equity' },
  { id: 'fixed_deposits', label: 'Fixed Deposit (FD / RD)', group: 'Fixed Income' },
  { id: 'govt_bonds', label: 'Govt Bonds / Bharat Bond', group: 'Fixed Income' },
  { id: 'debt_funds', label: 'Debt / Liquid Mutual Fund', group: 'Fixed Income' },
  { id: 'gold', label: 'Gold / Sovereign Gold Bond (SGB)', group: 'Commodities' },
  { id: 'cash_savings', label: 'Liquid Savings / High-Yield Cash', group: 'Cash' },
  { id: 'strategic_reserve', label: 'Strategic Reserve / Other', group: 'Reserve' },
];

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initialHolding,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('index_funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expectedReturnPct, setExpectedReturnPct] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHolding) {
      setName(initialHolding.name);
      setCategory(initialHolding.category);
      setInvestedAmount(String(initialHolding.investedAmount));
      setCurrentValue(String(initialHolding.currentValue));
      setPurchaseDate(initialHolding.purchaseDate || '');
      setExpectedReturnPct(initialHolding.expectedReturnPct ? String(initialHolding.expectedReturnPct) : '');
      setNotes(initialHolding.notes || '');
      setError('');
    } else {
      setName('');
      setCategory('index_funds');
      setInvestedAmount('');
      setCurrentValue('');
      setPurchaseDate(getLocalDateString());
      setExpectedReturnPct('');
      setNotes('');
      setError('');
    }
  }, [initialHolding, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an investment name.');
      return;
    }

    const invested = Number(investedAmount);
    if (isNaN(invested) || invested <= 0) {
      setError('Please enter a valid invested amount greater than 0.');
      return;
    }

    const current = currentValue ? Number(currentValue) : invested;
    if (isNaN(current) || current < 0) {
      setError('Please enter a valid current tracked value.');
      return;
    }

    const retPct = expectedReturnPct ? Number(expectedReturnPct) : undefined;

    if (initialHolding && onUpdate) {
      onUpdate({
        ...initialHolding,
        name: name.trim(),
        category,
        investedAmount: invested,
        currentValue: current,
        purchaseDate: purchaseDate || getLocalDateString(),
        expectedReturnPct: retPct,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        investedAmount: invested,
        currentValue: current,
        purchaseDate: purchaseDate || getLocalDateString(),
        expectedReturnPct: retPct,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0d111a',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: 'var(--accent-gold, #d4af37)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.1em' }}>
              PORTFOLIO REGISTRY
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f8', margin: '2px 0 0' }}>
              {initialHolding ? 'EDIT ASSET RECORD' : 'ADD TRACKED INVESTMENT'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #717d96)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                fontSize: '12px',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              {error}
            </div>
          )}

          {/* Investment Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
              INVESTMENT NAME *
            </label>
            <input
              type="text"
              placeholder="e.g. Nifty 50 Index Fund, Sovereign Gold Bond"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f0f4f8',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
              ASSET CATEGORY *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#141824',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f0f4f8',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} style={{ background: '#141824', color: '#f0f4f8' }}>
                  {opt.group}: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amounts: Invested & Current Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
                INVESTED AMOUNT (₹) *
              </label>
              <input
                type="number"
                placeholder="₹ Amount"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f0f4f8',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
                CURRENT TRACKED VALUE (₹)
              </label>
              <input
                type="number"
                placeholder="Current manual value"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f0f4f8',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Date & Optional Expected Return */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
                PURCHASE / START DATE
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f0f4f8',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
                EXPECTED RETURN (%) (OPTIONAL)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 12"
                value={expectedReturnPct}
                onChange={(e) => setExpectedReturnPct(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f0f4f8',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '6px' }}>
              NOTES (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly SIP started via AMC portal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f0f4f8',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', lineHeight: '1.4' }}>
            Note: Current value is manually entered by you. This system does not fetch live market prices.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            {initialHolding && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialHolding.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Trash2 size={14} />
                Delete Holding
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'var(--accent-gold, #d4af37)',
                  border: 'none',
                  color: '#0a0c12',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={14} />
                <span>{initialHolding ? 'Update Asset' : 'Save Asset'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddHoldingModal;
