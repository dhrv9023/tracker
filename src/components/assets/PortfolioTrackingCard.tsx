// ==========================================================================
// FINANCE OS — PORTFOLIO TRACKING CARD (PHASE 5)
// Displays manually logged assets, category breakdown, invested capital,
// manual current value, and net unrealized gains.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { InvestmentHolding } from '../../types/finance';
import { formatINR } from '../../utils/finance';
import { AddHoldingModal } from './AddHoldingModal';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  AlertCircle,
  FolderPlus,
} from 'lucide-react';

export const PortfolioTrackingCard: React.FC = () => {
  const {
    investmentHoldings,
    portfolioSummary,
    addInvestmentHolding,
    updateInvestmentHolding,
    deleteInvestmentHolding,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<InvestmentHolding | null>(null);

  const handleEdit = (holding: InvestmentHolding) => {
    setEditingHolding(holding);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingHolding(null);
    setIsModalOpen(true);
  };

  const isPositiveGain = portfolioSummary.unrealizedGain >= 0;

  return (
    <div
      style={{
        background: 'var(--bg-surface, #141824)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--text-muted, #717d96)',
                letterSpacing: '0.1em',
              }}
            >
              TRACKED ASSETS // REGISTRY
            </span>
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main, #f0f4f8)',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            CURRENT PORTFOLIO
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Track your existing holdings manually to evaluate alignment against your model allocation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'var(--accent-gold, #d4af37)',
            border: 'none',
            color: '#0a0c12',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>ADD INVESTMENT</span>
        </button>
      </div>

      {/* Metric Summary HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(10, 12, 18, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
            TOTAL INVESTED
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4f8', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px' }}>
            {formatINR(portfolioSummary.totalInvested)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
            CURRENT TRACKED VALUE
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px' }}>
            {formatINR(portfolioSummary.currentValue)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)' }}>User-entered values</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
            UNREALIZED GAIN / LOSS
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: isPositiveGain ? '#10b981' : '#ef4444',
              fontFamily: 'var(--font-mono, monospace)',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isPositiveGain ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {isPositiveGain ? '+' : ''}
            {formatINR(portfolioSummary.unrealizedGain)}
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              ({isPositiveGain ? '+' : ''}{portfolioSummary.gainPercentage}%)
            </span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', textTransform: 'uppercase' }}>
            TRACKED POSITIONS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4f8', fontFamily: 'var(--font-mono, monospace)', marginTop: '4px' }}>
            {portfolioSummary.holdingsCount} Assets
          </div>
        </div>
      </div>

      {/* Holdings List or Empty State */}
      {investmentHoldings.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <FolderPlus size={40} color="var(--text-muted, #717d96)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#f0f4f8', margin: '0 0 6px' }}>
            NO ASSETS TRACKED
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', maxWidth: '420px', margin: '0 auto 16px' }}>
            Add your existing investments to compare your current portfolio distribution with your illustrative allocation plan.
          </p>
          <button
            onClick={handleOpenAdd}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'var(--accent-gold, #d4af37)',
              border: 'none',
              color: '#0a0c12',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>ADD FIRST INVESTMENT</span>
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600 }}>
                  INVESTMENT NAME
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600 }}>
                  CATEGORY
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                  INVESTED
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                  CURRENT VALUE
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'right' }}>
                  GAIN / LOSS
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-muted, #717d96)', fontWeight: 600, textAlign: 'center' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {investmentHoldings.map((h) => {
                const gain = h.currentValue - h.investedAmount;
                const gainPct = h.investedAmount > 0 ? Math.round((gain / h.investedAmount) * 1000) / 10 : 0;
                const isPositive = gain >= 0;

                return (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#f0f4f8', fontSize: '13px' }}>{h.name}</div>
                      {h.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>
                          {h.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#cbd5e1',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {h.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: '#f0f4f8' }}>
                      {formatINR(h.investedAmount)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: 'var(--accent-gold, #d4af37)', fontWeight: 600 }}>
                      {formatINR(h.currentValue)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: isPositive ? '#10b981' : '#ef4444' }}>
                      {isPositive ? '+' : ''}{formatINR(gain)} ({isPositive ? '+' : ''}{gainPct}%)
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEdit(h)}
                          title="Edit holding"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: '#94a3b8',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => deleteInvestmentHolding(h.id)}
                          title="Delete holding"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addInvestmentHolding}
        onUpdate={updateInvestmentHolding}
        onDelete={deleteInvestmentHolding}
        initialHolding={editingHolding}
      />
    </div>
  );
};
export default PortfolioTrackingCard;
