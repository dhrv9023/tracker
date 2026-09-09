// ==========================================================================
// FINANCE OS — PHASE 1 SETTINGS VIEW
// Basic operational settings: Profile, Currency, Edit Baseline, Reset Data, Demo Mode.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  User,
  Coins,
  Edit3,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Shield,
  Database,
  Terminal,
  AlertOctagon,
  Download,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';
import { CategoryManager } from './CategoryManager';
import {
  getActiveGeminiApiKey,
  setStoredGeminiApiKey,
  testGeminiConnection,
  DEFAULT_GEMINI_MODEL,
} from '../../services/geminiConfig';
import { getLocalDateString } from '../../utils/finance';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateUserProfile,
    isDemoMode,
    toggleDemoMode,
    setShowOnboardingModal,
    clearAllData,
    exportDataJson,
    importDataJson,
    purgeAllDataSecurely,
  } = useFinance();

  const [nameInput, setNameInput] = useState(profile.user.name);
  const [ageInput, setAgeInput] = useState(profile.user.age);
  const [countryInput, setCountryInput] = useState(profile.user.country);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup & Restore State
  const [backupFeedback, setBackupFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Gemini API Key State
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => getActiveGeminiApiKey());
  const [showKey, setShowKey] = useState(false);
  const [geminiKeySaved, setGeminiKeySaved] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [geminiTestStatus, setGeminiTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveGeminiKey = () => {
    setStoredGeminiApiKey(geminiKeyInput.trim());
    setGeminiKeySaved(true);
    setTimeout(() => setGeminiKeySaved(false), 2000);
  };

  const handleTestGemini = async () => {
    setIsTestingKey(true);
    setGeminiTestStatus(null);
    try {
      const res = await testGeminiConnection();
      setGeminiTestStatus(res);
    } catch (err: any) {
      setGeminiTestStatus({ success: false, message: err?.message || 'Connection test failed.' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim(),
      age: Number(ageInput) || 25,
      country: countryInput.trim() || 'India',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };
  const handleCurrencyChange = (newCurrency: any) => {
    updateUserProfile({ currency: newCurrency });
  };

  const handleExportBackup = () => {
    try {
      const json = exportDataJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-os-backup-${getLocalDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupFeedback({ success: true, message: 'Financial backup JSON exported and downloaded successfully.' });
    } catch (e: any) {
      setBackupFeedback({ success: false, message: `Backup export failed: ${e?.message || 'Unknown error'}` });
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importDataJson(content);
        if (res.success) {
          setBackupFeedback({ success: true, message: 'Financial backup restored successfully. Telemetry is active.' });
        } else {
          setBackupFeedback({ success: false, message: `Import rejected: ${res.error || 'Invalid backup schema'}` });
        }
      }
    };
    reader.onerror = () => {
      setBackupFeedback({ success: false, message: 'Failed to read the selected backup file.' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmPurge = () => {
    const text = resetConfirmText.trim().toUpperCase();
    if (text === 'PURGE' || text === 'RESET') {
      purgeAllDataSecurely();
      setIsResetModalOpen(false);
      setResetConfirmText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="pulsing-dot" />
          <span className="status-pill status-pill-red">CONFIGURATION PROTOCOL</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
          SYSTEM SETTINGS
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manage your personal financial profile, currency preferences, demo scenarios, and local storage data.
        </p>
      </div>

      {/* 1. DEMO MODE TOGGLE PANEL */}
      <div
        className="ui-card ui-card-highlight"
        style={{
          borderLeft: isDemoMode ? '4px solid var(--status-yellow)' : '4px solid var(--border-subtle)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <Terminal size={24} style={{ color: isDemoMode ? 'var(--status-yellow)' : 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  DEVELOPER DEMO MODE
                </h3>
                <span className={`status-pill ${isDemoMode ? 'status-pill-yellow' : 'status-pill-neutral'}`}>
                  {isDemoMode ? 'ACTIVE // DEMO DATA' : 'INACTIVE // USER DATA'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Switch to a pre-configured scenario (₹75,000 monthly income, ₹42,000 expenses, ₹33,000 surplus) to explore the system without overwriting your real profile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDemoMode}
            className={`btn-tactical ${isDemoMode ? 'btn-secondary' : 'btn-primary'}`}
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.15rem' }}
          >
            <RefreshCw size={14} />
            {isDemoMode ? 'Deactivate Demo Mode' : 'Activate Demo Mode'}
          </button>
        </div>
      </div>

      {/* 2. OPERATIVE PROFILE DETAILS */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <User size={20} style={{ color: 'var(--red-bright)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            OPERATIVE IDENTITY & PROFILE
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="ui-label">Name / Codename</label>
              <input
                type="text"
                className="tactical-input"
                placeholder="e.g. Professor, Tokyo, John"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={isDemoMode}
              />
            </div>

            <div>
              <label className="ui-label">Age</label>
              <input
                type="number"
                min="18"
                max="100"
                className="tactical-input font-mono"
                value={ageInput}
                onChange={(e) => setAgeInput(Number(e.target.value))}
                disabled={isDemoMode}
              />
            </div>

            <div>
              <label className="ui-label">Country</label>
              <input
                type="text"
                className="tactical-input"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                disabled={isDemoMode}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: isDemoMode ? 'var(--status-yellow)' : 'var(--text-muted)' }}>
              {isDemoMode ? 'Profile editing locked while Demo Mode is active.' : 'Personal details are stored strictly in local browser storage.'}
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={isDemoMode}
              style={{ fontSize: '0.8rem', opacity: isDemoMode ? 0.5 : 1 }}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={15} /> Saved
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. BASE CURRENCY STANDARD */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Coins size={20} style={{ color: 'var(--red-bright)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            CURRENCY STANDARD
          </h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Select the active currency representation across all financial dashboards and calculations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { id: 'INR', label: 'INR (₹) — Indian Rupee', note: 'Lakh/Crore standard (Default)' },
            { id: 'USD', label: 'USD ($) — US Dollar', note: 'Standard international' },
            { id: 'EUR', label: 'EUR (€) — Euro', note: 'European Union standard' },
          ].map((curr) => {
            const isSelected = profile.user.currency === curr.id;
            return (
              <button
                key={curr.id}
                type="button"
                onClick={() => handleCurrencyChange(curr.id)}
                disabled={isDemoMode}
                style={{
                  background: isSelected ? 'var(--red-badge-bg)' : 'var(--bg-card-elevated)',
                  border: `1px solid ${isSelected ? 'var(--red-bright)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: isDemoMode ? 'not-allowed' : 'pointer',
                  opacity: isDemoMode ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{curr.label}</span>
                  {isSelected && <span className="pulsing-dot" />}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{curr.note}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FINANCIAL BASELINE RE-INITIALIZATION */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <Edit3 size={22} style={{ color: 'var(--red-bright)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                EDIT FINANCIAL PROFILE
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Rerun the onboarding wizard to update income, fixed/variable expenses, emergency funds, savings, debts, or priorities.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.15rem' }}
          >
            <Edit3 size={14} /> Open Profile Wizard
          </button>
        </div>
      </div>

      {/* 5. GEMINI AI INTELLIGENCE PROTOCOL */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={20} style={{ color: 'var(--red-bright)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              GEMINI AI-ASSISTED ANALYSIS
            </h3>
          </div>
          <span className="status-pill status-pill-red">{DEFAULT_GEMINI_MODEL}</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Powers natural language savings mission creation, adaptive questioning, and tradeoff analysis.
          Deterministic calculations are strictly handled by local application logic.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="ui-label">GEMINI API KEY</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy... or leave empty to use .env key"
                className="tactical-input font-mono"
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="btn-ghost"
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.75rem' }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}
              >
                {geminiKeySaved ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={isTestingKey}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }}
              >
                <RefreshCw size={13} className={isTestingKey ? 'animate-spin' : ''} />
                {isTestingKey ? 'Testing Connection...' : 'Test Gemini Connection'}
              </button>
              {geminiTestStatus && (
                <span
                  className={`status-pill ${geminiTestStatus.success ? 'status-pill-green' : 'status-pill-red'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {geminiTestStatus.message}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Credentials are stored strictly on device.
            </span>
          </div>
        </div>
      </div>

      {/* 6. TACTICAL CATEGORY MANAGEMENT */}
      <CategoryManager />

      {/* 7. DATA BACKUP & RESTORE PROTOCOL */}
      <div className="ui-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <Database size={22} style={{ color: 'var(--blue-bright, #3a86ff)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                DATA VAULT & PORTABLE BACKUPS
              </h3>
              <span className="status-pill status-pill-green">CLIENT SECURED</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Export an authoritative snapshot of your profile, ledger, savings missions, and investments into a portable JSON backup. Restore anytime.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Export Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Download size={16} style={{ color: 'var(--status-green)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>EXPORT BACKUP (JSON)</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Downloads complete verified dataset. Excludes API keys and transient tokens for privacy.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="ui-btn ui-btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <Download size={15} />
              DOWNLOAD BACKUP FILE
            </button>
          </div>

          {/* Import Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Upload size={16} style={{ color: 'var(--status-yellow)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>RESTORE BACKUP</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Upload a verified JSON backup file. Validates schema before applying any changes.
              </p>
            </div>
            <div>
              <input
                type="file"
                id="backup-upload-input"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleImportBackupFile}
              />
              <button
                type="button"
                onClick={() => document.getElementById('backup-upload-input')?.click()}
                className="ui-btn ui-btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <Upload size={15} />
                SELECT BACKUP JSON
              </button>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {backupFeedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: backupFeedback.success ? 'rgba(6, 214, 160, 0.1)' : 'rgba(239, 71, 111, 0.1)',
              border: `1px solid ${backupFeedback.success ? 'rgba(6, 214, 160, 0.3)' : 'rgba(239, 71, 111, 0.3)'}`,
              color: backupFeedback.success ? 'var(--status-green)' : 'var(--status-red)',
            }}
          >
            {backupFeedback.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{backupFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 8. PURGE FINANCIAL DATA */}
      <div
        className="ui-card"
        style={{
          border: '1px solid rgba(239, 71, 111, 0.3)',
          background: 'rgba(239, 71, 111, 0.04)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <Trash2 size={22} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  PURGE FINANCIAL DATA
                </h3>
                <span className="status-pill status-pill-red">IRREVERSIBLE</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Purge all saved income profiles, expense baselines, ledger entries, and missions from device storage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setResetConfirmText('');
              setIsResetModalOpen(true);
            }}
            className="btn-ghost"
            style={{
              color: 'var(--status-red)',
              border: '1px solid rgba(239, 71, 111, 0.5)',
              fontSize: '0.8rem',
              padding: '0.55rem 1.15rem',
            }}
          >
            <AlertOctagon size={14} /> Purge All Data
          </button>
        </div>
      </div>

      {/* DELIBERATE RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="ui-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              border: '1px solid rgba(239, 71, 111, 0.5)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 71, 111, 0.2)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertOctagon size={24} style={{ color: 'var(--status-red)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  CONFIRM SYSTEM PURGE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              This operation will <strong>permanently destroy</strong> all local profile records, monthly transactions, savings missions, and asset holdings. This cannot be undone.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Type <span style={{ color: 'var(--status-red)' }}>PURGE</span> or <span style={{ color: 'var(--status-red)' }}>RESET</span> to authorize:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="PURGE"
                className="tactical-input font-mono"
                style={{ width: '100%', fontSize: '0.95rem', borderColor: 'rgba(239, 71, 111, 0.4)' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="ui-btn ui-btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                disabled={resetConfirmText.trim().toUpperCase() !== 'PURGE' && resetConfirmText.trim().toUpperCase() !== 'RESET'}
                className="ui-btn"
                style={{
                  background: 'var(--status-red)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  opacity: (resetConfirmText.trim().toUpperCase() === 'PURGE' || resetConfirmText.trim().toUpperCase() === 'RESET') ? 1 : 0.4,
                  cursor: (resetConfirmText.trim().toUpperCase() === 'PURGE' || resetConfirmText.trim().toUpperCase() === 'RESET') ? 'pointer' : 'not-allowed',
                }}
              >
                DESTROY ALL DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
