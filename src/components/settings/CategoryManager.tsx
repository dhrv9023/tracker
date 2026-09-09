// ==========================================================================
// FINANCE OS — CATEGORY MANAGER (SETTINGS)
// Creation, renaming, and archiving of custom income & expense categories.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category, TransactionType } from '../../types/finance';
import { Tag, Plus, Archive, Edit2, Check, X } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, renameCategory, archiveCategory } = useFinance();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), type: newCatType });
    setNewCatName('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      renameCategory(id, editName.trim());
    }
    setEditingId(null);
  };

  const displayedCategories = categories.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });

  return (
    <div className="ui-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Tag size={20} style={{ color: 'var(--red-bright)' }} />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            TACTICAL CATEGORY MANAGEMENT
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Create custom taxonomy, rename classifications, or archive outdated tags. Archived categories remain visible on past transactions.
          </p>
        </div>
      </div>

      {/* Add Category Form */}
      <form
        onSubmit={handleAdd}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '0.75rem',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <select
          className="tactical-select font-mono"
          value={newCatType}
          onChange={(e) => setNewCatType(e.target.value as TransactionType)}
          style={{ width: '130px', fontSize: '0.8rem', padding: '0.45rem' }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="text"
          placeholder="New Category Codename (e.g. Crypto, Pets, Subscriptions)"
          className="tactical-input"
          style={{ fontSize: '0.825rem' }}
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary"
          style={{ fontSize: '0.75rem', padding: '0.55rem 1rem' }}
        >
          <Plus size={14} /> Add Category
        </button>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['all', 'expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            style={{
              background: filterType === t ? 'var(--red-badge-bg)' : 'transparent',
              border: `1px solid ${filterType === t ? 'var(--red-bright)' : 'var(--border-subtle)'}`,
              color: filterType === t ? '#ffffff' : 'var(--text-secondary)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Category List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.75rem',
          maxHeight: '320px',
          overflowY: 'auto',
          paddingRight: '0.25rem',
        }}
      >
        {displayedCategories.map((c) => {
          const isEditing = editingId === c.id;

          return (
            <div
              key={c.id}
              style={{
                background: c.isArchived ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-card)',
                border: `1px solid ${c.isArchived ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: c.isArchived ? 0.6 : 1,
              }}
            >
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
                  <input
                    type="text"
                    className="tactical-input font-mono"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(c.id)}
                    className="btn-ghost"
                    style={{ padding: '0.25rem', color: 'var(--status-green)' }}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-ghost"
                    style={{ padding: '0.25rem' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: c.type === 'income' ? 'var(--status-green)' : 'var(--red-bright)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: c.isArchived ? 'var(--text-muted)' : '#ffffff',
                        textDecoration: c.isArchived ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.name}
                    </span>
                    {c.isArchived && (
                      <span className="status-pill status-pill-neutral" style={{ fontSize: '0.55rem' }}>
                        ARCHIVED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {!c.isArchived && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          className="btn-ghost"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                          title="Rename Category"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => archiveCategory(c.id)}
                          className="btn-ghost"
                          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
                          title="Archive Category"
                        >
                          <Archive size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
