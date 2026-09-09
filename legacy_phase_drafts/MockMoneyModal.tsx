import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { Flame, ArrowRight, Info } from 'lucide-react';

interface MockMoneyModalProps {
  missionId: string;
  onClose: () => void;
}

export const MockMoneyModal: React.FC<MockMoneyModalProps> = ({ missionId, onClose }) => {
  const { missions, addMockContribution, monthlySurplus } = useFinance();
  const mission = missions.find((m) => m.id === missionId);

  const [amount, setAmount] = useState<string>('5000');

  if (!mission) return null;

  const currentVal = mission.currentAmount;
  const addVal = Math.max(0, Number(amount) || 0);
  const simulatedTotal = currentVal + addVal;
  const currentPct = Math.min(100, Math.round((currentVal / mission.targetAmount) * 1000) / 10);
  const newPct = Math.min(100, Math.round((simulatedTotal / mission.targetAmount) * 1000) / 10);

  const isTight = mission.monthlyContribution > monthlySurplus * 0.75 && mission.monthlyContribution <= monthlySurplus;
  const isNotFeasible = mission.monthlyContribution > monthlySurplus;
  const statusLabel = isNotFeasible ? 'NOT FEASIBLE' : isTight ? 'TIGHT' : 'ON TRACK';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addVal <= 0) return;
    addMockContribution(mission.id, addVal, 'Simulated capital deployment');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="status-pill status-pill-red" style={{ fontSize: '0.65rem' }}>
              MOCK MONEY SIMULATION
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem' }}>
              + DEPLOY CAPITAL
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--red-bright)', fontWeight: 700 }}>
              {mission.id} // TARGET MISSION
            </span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>{mission.name}</h4>
          </div>

          <div>
            <label className="ui-label">Simulated Amount to Deploy (₹)</label>
            <input
              type="number"
              className="ui-input font-mono"
              style={{ fontSize: '1.4rem', fontWeight: 800 }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[2000, 5000, 10000, 20000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className="btn-secondary font-mono"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                +{formatINR(p)}
              </button>
            ))}
          </div>

          {/* Before → After Simulation Display */}
          <div
            style={{
              background: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT POOL</span>
                <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {formatINR(currentVal)}
                </div>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {currentPct}%
                </span>
              </div>

              <ArrowRight size={20} style={{ color: 'var(--red-bright)' }} />

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--status-green)' }}>SIMULATED POOL</span>
                <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--status-green)' }}>
                  {formatINR(simulatedTotal)}
                </div>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--status-green)' }}>
                  {newPct}%
                </span>
              </div>
            </div>

            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${newPct}%`, background: 'var(--status-green)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>MISSION STATUS: <strong style={{ color: 'var(--status-green)' }}>{statusLabel}</strong></span>
              <span>Target: <strong className="font-mono">{formatINR(mission.targetAmount)}</strong></span>
            </div>
          </div>

          {/* Planning Money Clarification Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>This is simulated/planning capital deployment, not an actual bank transaction.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Flame size={16} /> DEPLOY CAPITAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
