// ==========================================================================
// FINANCE OS — INVESTMENT QUESTIONNAIRE & RISK PROFILE MODAL (PHASE 5)
// 5-point disciplined planning assessment evaluating goal, horizon,
// market reaction, experience, and liquidity preferences.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  InvestmentGoal,
  InvestmentHorizon,
  RiskReaction,
  InvestmentExperience,
  LiquidityPreference,
} from '../../types/finance';
import { calculateRiskProfile } from '../../utils/finance';
import { X, ShieldAlert, ArrowRight, CheckCircle2, Award } from 'lucide-react';

interface RiskQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskQuestionnaireModal: React.FC<RiskQuestionnaireModalProps> = ({ isOpen, onClose }) => {
  const { investmentProfile, saveInvestmentProfile } = useFinance();

  const [goal, setGoal] = useState<InvestmentGoal>(investmentProfile.investmentGoal || 'wealth');
  const [horizon, setHorizon] = useState<InvestmentHorizon>(investmentProfile.horizon || 'long');
  const [riskReaction, setRiskReaction] = useState<RiskReaction>(investmentProfile.riskReaction || 'hold');
  const [experience, setExperience] = useState<InvestmentExperience>(investmentProfile.experience || 'some_experience');
  const [liquidity, setLiquidity] = useState<LiquidityPreference>(investmentProfile.liquidityPreference || 'flexible');
  const [customGoal, setCustomGoal] = useState<string>(investmentProfile.customGoal || '');

  if (!isOpen) return null;

  // Calculate live preview of risk profile based on selected answers
  const preview = calculateRiskProfile({
    horizon,
    riskReaction,
    experience,
    liquidityPreference: liquidity,
    investmentGoal: goal,
  });

  const handleSave = () => {
    saveInvestmentProfile({
      investmentGoal: goal,
      customGoal: goal === 'custom' ? customGoal : undefined,
      horizon,
      riskReaction,
      experience,
      liquidityPreference: liquidity,
      riskProfile: preview.riskProfile,
    });
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
          maxWidth: '640px',
          maxHeight: '90vh',
          background: '#0d111a',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
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
              PROFILING PROTOCOL // RISK & HORIZON
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4f8', margin: '2px 0 0' }}>
              INVESTMENT PLANNING QUESTIONNAIRE
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

        {/* Scrollable Questions Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Question 1: Investment Goal */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '8px' }}>
              1. What is the primary objective for this capital?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'wealth', label: 'Long-term Wealth' },
                { id: 'retirement', label: 'Retirement' },
                { id: 'independence', label: 'Financial Independence' },
                { id: 'home', label: 'Home Purchase' },
                { id: 'education', label: 'Higher Education' },
                { id: 'general', label: 'General Wealth' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as InvestmentGoal)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: goal === item.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: goal === item.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: goal === item.id ? 'var(--accent-gold, #d4af37)' : '#cbd5e1',
                    fontWeight: goal === item.id ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Investment Horizon */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '8px' }}>
              2. What is your expected investment horizon?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'short', label: '< 3 Years', sub: 'Short Horizon' },
                { id: 'medium', label: '3–5 Years', sub: 'Medium Horizon' },
                { id: 'long', label: '5–10 Years', sub: 'Long Horizon' },
                { id: 'very_long', label: '10+ Years', sub: 'Very Long Horizon' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHorizon(item.id as InvestmentHorizon)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: horizon === item.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: horizon === item.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: horizon === item.id ? 'var(--accent-gold, #d4af37)' : '#cbd5e1',
                    fontWeight: horizon === item.id ? 600 : 400,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: 20% Drawdown Reaction */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '8px' }}>
              3. If your portfolio falls 20% in a market correction, what would you most likely do?
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'sell_all', title: 'Sell immediately', desc: 'Exit all volatile assets to avoid further loss.' },
                { id: 'sell_some', title: 'Sell some', desc: 'Reduce equity risk and preserve partial cash.' },
                { id: 'hold', title: 'Hold steady', desc: 'Stay the course and wait for market recovery.' },
                { id: 'buy_more', title: 'Invest more', desc: 'Accumulate additional units at discounted levels.' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRiskReaction(item.id as RiskReaction)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: riskReaction === item.id ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: riskReaction === item.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: riskReaction === item.id ? 'var(--accent-gold, #d4af37)' : '#f0f4f8' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                  {riskReaction === item.id && <CheckCircle2 size={16} color="var(--accent-gold, #d4af37)" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Experience */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '8px' }}>
              4. What is your level of investment experience?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
              {[
                { id: 'beginner', label: 'Beginner', desc: 'New to investing' },
                { id: 'some_experience', label: 'Some Experience', desc: 'Mutual funds / SIPs' },
                { id: 'experienced', label: 'Experienced', desc: 'Full market cycle exposure' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExperience(item.id as InvestmentExperience)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: experience === item.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: experience === item.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: experience === item.id ? 'var(--accent-gold, #d4af37)' : '#cbd5e1',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 5: Liquidity Preference */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4f8', display: 'block', marginBottom: '8px' }}>
              5. How soon might you need access to this money?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'immediate', label: 'Immediate (<1 yr)' },
                { id: 'short_term', label: '1–3 Years' },
                { id: 'flexible', label: '3–5 Years' },
                { id: 'locked', label: '5+ Years (Locked)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLiquidity(item.id as LiquidityPreference)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: liquidity === item.id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: liquidity === item.id ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: liquidity === item.id ? 'var(--accent-gold, #d4af37)' : '#cbd5e1',
                    fontWeight: liquidity === item.id ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Profile Readout */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--accent-gold, #d4af37)', letterSpacing: '0.08em', fontWeight: 600 }}>
                CALCULATED PLANNING PROFILE
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f0f4f8', textTransform: 'uppercase', marginTop: '2px' }}>
                {preview.riskProfile}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)', marginTop: '2px' }}>
                Educational planning classification based on horizon, drawdown tolerance, and experience.
              </div>
            </div>
            <Award size={32} color="var(--accent-gold, #d4af37)" />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #717d96)' }}>
            Not a professional risk profile certification.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
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
              onClick={handleSave}
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
              <span>Apply Profile</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RiskQuestionnaireModal;
