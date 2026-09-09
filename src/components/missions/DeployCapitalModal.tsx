// ==========================================================================
// FINANCE OS — PHASE 3 DEPLOY CAPITAL MODAL
// Simulated / planning capital deployment dialog.
// Real-time calculation of progress impact without bank transactions.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, calculateMissionProgress, getLocalDateString } from '../../utils/finance';
import { SavingsContributionType } from '../../types/finance';
import { X, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DeployCapitalModalProps {
  missionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DeployCapitalModal: React.FC<DeployCapitalModalProps> = ({
  missionId: initialMissionId,
  isOpen,
  onClose,
}) => {
  const { missions, deployCapital, remainingFlexibleSurplus } = useFinance();

  const activeMissions = missions.filter((m) => !m.isArchived);
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    initialMissionId || (activeMissions[0]?.id ?? '')
  );

  const [amount, setAmount] = useState<number>(5000);
  const [date, setDate] = useState<string>(getLocalDateString());
  const [note, setNote] = useState<string>('Monthly Allocation');
  const [type, setType] = useState<SavingsContributionType>('monthly');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMission = missions.find((m) => m.id === selectedMissionId);
  const targetAmount = currentMission ? currentMission.targetAmount : 1;
  const currentAmount = currentMission ? currentMission.currentAmount : 0;
  const currentProgress = calculateMissionProgress(currentAmount, targetAmount);
  const projectedAmount = currentAmount + (amount > 0 ? amount : 0);
  const projectedProgress = calculateMissionProgress(projectedAmount, targetAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMissionId) {
      setError('Please select a target mission.');
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      setError('Capital amount must be greater than ₹0.');
      return;
    }

    deployCapital({
      missionId: selectedMissionId,
      amount,
      date,
      note: note.trim() || 'Planning capital deployment',
      type,
    });

    setSuccessMessage(`Successfully deployed ${formatINR(amount)} to ${currentMission?.name}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 900);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-pill status-pill-red">PLANNING CAPITAL</span>
              <span className="pulsing-dot" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
              Deploy Capital
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Mission Selector */}
          <div>
            <label className="ui-label" htmlFor="mission-select">TARGET SAVINGS MISSION</label>
            <select
              id="mission-select"
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="ui-input"
              style={{ width: '100%' }}
            >
              {activeMissions.map((m) => {
                const prog = calculateMissionProgress(m.currentAmount, m.targetAmount);
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({formatINR(m.currentAmount)} / {formatINR(m.targetAmount)} - {prog}%)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Capital Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="ui-label" htmlFor="deploy-amount">CAPITAL AMOUNT (₹)</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Flexible Surplus: <strong className="font-mono" style={{ color: 'var(--status-green)' }}>{formatINR(remainingFlexibleSurplus)}</strong>
              </span>
            </div>
            <input
              id="deploy-amount"
              type="number"
              min="1"
              step="500"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="ui-input font-mono"
              style={{ width: '100%', fontSize: '1.25rem', fontWeight: 700 }}
              placeholder="e.g. 10000"
              required
            />
            {/* Quick amount presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[2000, 5000, 10000, 25000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="btn-ghost"
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.25rem 0.5rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                  }}
                >
                  +{formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Impact Preview Card */}
          {currentMission && (
            <div
              style={{
                background: 'var(--bg-card-elevated)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Projected Progress</span>
                <span className="font-mono" style={{ color: '#ffffff', fontWeight: 700 }}>
                  {currentProgress}% → <span style={{ color: 'var(--status-green)' }}>{projectedProgress}%</span>
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${projectedProgress}%`, background: 'var(--red-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                <span>Current: {formatINR(currentAmount)}</span>
                <span style={{ color: 'var(--text-main)' }}>Projected: {formatINR(projectedAmount)}</span>
                <span>Target: {formatINR(targetAmount)}</span>
              </div>
            </div>
          )}

          {/* Allocation Details: Date & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="ui-label" htmlFor="deploy-date">DEPLOYMENT DATE</label>
              <input
                id="deploy-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ui-input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label className="ui-label" htmlFor="deploy-type">CONTRIBUTION TYPE</label>
              <select
                id="deploy-type"
                value={type}
                onChange={(e) => setType(e.target.value as SavingsContributionType)}
                className="ui-input"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="monthly">Monthly Allocation</option>
                <option value="manual">Manual Deposit</option>
                <option value="bonus">Bonus / Windfall</option>
                <option value="adjustment">Manual Adjustment</option>
              </select>
            </div>
          </div>

          {/* Note / Source */}
          <div>
            <label className="ui-label" htmlFor="deploy-note">NOTE / SOURCE</label>
            <input
              id="deploy-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="ui-input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              placeholder="e.g. Salary surplus, performance bonus, festive gift"
            />
          </div>

          {/* Non-destructive disclaimer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span>Simulated capital deployment for financial modeling. Does not execute real bank transfers.</span>
          </div>

          {/* Error / Success feedback */}
          {error && (
            <div style={{ color: 'var(--status-red)', fontSize: '0.8rem', background: 'rgba(239, 71, 111, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ color: 'var(--status-green)', fontSize: '0.8rem', background: 'rgba(6, 214, 160, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowUpRight size={16} />
              DEPLOY CAPITAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
