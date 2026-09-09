// ==========================================================================
// FINANCE OS — SPENDING BREAKDOWN CHART
// Clean tactical category breakdown using actual transaction telemetry.
// ==========================================================================

import React from 'react';
import { CategorySpendingSummary } from '../../types/finance';
import { formatINR } from '../../utils/finance';
import { PieChart } from 'lucide-react';

interface SpendingChartProps {
  categories: CategorySpendingSummary[];
  totalExpenses: number;
}

const CATEGORY_COLORS = [
  '#e50914', // Deep red
  '#ff3b47', // Bright red
  '#06d6a0', // Restrained green
  '#ffd166', // Tactical yellow
  '#118ab2', // Cyan / blue
  '#8338ec', // Violet
  '#fb5607', // Orange
  '#3a86ff', // Bright blue
  '#9d4edd', // Purple
  '#adb5bd', // Muted grey
];

export const SpendingChart: React.FC<SpendingChartProps> = ({ categories, totalExpenses }) => {
  if (!categories || categories.length === 0 || totalExpenses === 0) {
    return (
      <div
        className="ui-card"
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}
      >
        <PieChart size={32} style={{ color: 'var(--text-muted)' }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>NO EXPENSE TELEMETRY</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Record expense transactions in this month to generate category allocation metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="ui-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <span className="status-pill status-pill-red">ALLOCATION RADAR</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
            MONTHLY SPENDING BREAKDOWN
          </h3>
        </div>
        <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          TOTAL: <strong style={{ color: '#ffffff' }}>{formatINR(totalExpenses)}</strong>
        </div>
      </div>

      {/* Segmented Progress Strip */}
      <div
        style={{
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          display: 'flex',
          background: 'var(--bg-card)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {categories.map((item, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div
              key={item.category}
              title={`${item.category}: ${formatINR(item.amount)} (${item.percentage}%)`}
              style={{
                width: `${item.percentage}%`,
                background: color,
                transition: 'width 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Itemized Category List with Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {categories.map((item, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{item.category}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({item.count} tx)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {item.percentage}%
                  </span>
                  <span className="font-mono" style={{ fontWeight: 800, color: '#ffffff' }}>
                    {formatINR(item.amount)}
                  </span>
                </div>
              </div>

              {/* Mini bar */}
              <div className="progress-bar-track" style={{ height: '4px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
