// ==========================================================================
// FINANCE OS — DELETE CONFIRMATION DIALOG
// Tactical modal requiring explicit user confirmation before ledger deletion.
// ==========================================================================

import React from 'react';
import { Transaction } from '../../types/finance';
import { formatINR, formatTransactionDate } from '../../utils/finance';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
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
          maxWidth: '440px',
          background: 'var(--bg-card-elevated)',
          border: '1px solid rgba(239, 71, 111, 0.5)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(239, 71, 111, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-red)',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="status-pill status-pill-red" style={{ fontSize: '0.6rem' }}>IRREVERSIBLE ACTION</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              DELETE TRANSACTION?
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Are you sure you want to purge this record from your local ledger? All dependent monthly aggregates, category breakdowns, and dashboard totals will update immediately.
        </p>

        {/* Transaction Summary Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {transaction.category} • {formatTransactionDate(transaction.date)}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
              {transaction.description || `${transaction.category} entry`}
            </div>
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: transaction.type === 'income' ? 'var(--status-green)' : 'var(--status-red)',
            }}
          >
            {transaction.type === 'income' ? '+' : '−'} {formatINR(transaction.amount)}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary"
            style={{
              background: 'var(--status-red)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Trash2 size={14} /> DELETE
          </button>
        </div>
      </div>
    </div>
  );
};
