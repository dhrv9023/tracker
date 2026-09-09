// ==========================================================================
// FINANCE OS — PHASE 3 CREATE MISSION MODAL
// 6-Step Guided Mission Planning Wizard
// Deterministic feasibility checks, emergency fund auto-sizing, surplus safeguards.
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatINR,
  calculateMissionFeasibility,
  calculateMonthsBetween,
  calculateRequiredMonthlyContribution,
  calculateEmergencyFundTarget,
  getLocalDateString,
} from '../../utils/finance';
import { MissionPriority } from '../../types/finance';
import {
  X,
  Target,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated?: (missionId: string) => void;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  isOpen,
  onClose,
  onMissionCreated,
}) => {
  const { profile, snapshot, remainingFlexibleSurplus, createMission } = useFinance();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('gadget');
  const [priority, setPriority] = useState<MissionPriority>('high');
  const [description, setDescription] = useState<string>('');

  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [isAsap, setIsAsap] = useState<boolean>(false);

  // Default target date: 12 months from now
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    return getLocalDateString(d);
  }, []);
  const [targetDate, setTargetDate] = useState<string>(defaultDate);

  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [useCustomContribution, setUseCustomContribution] = useState<boolean>(false);
  const [customPlannedContribution, setCustomPlannedContribution] = useState<number>(10000);

  const [error, setError] = useState<string | null>(null);

  // Essential monthly expenses for Emergency Fund helper
  const essentialMonthlyExpenses = useMemo(() => {
    const fixed = snapshot.fixedExpenses || (profile.expenses.fixed.rent + profile.expenses.fixed.utilities);
    return fixed > 0 ? fixed : 30000;
  }, [snapshot.fixedExpenses, profile.expenses.fixed]);

  // Derived Calculations
  const remainingAmount = Math.max(0, targetAmount - initialAmount);
  const monthsRemaining = useMemo(() => {
    if (isAsap) return null;
    return calculateMonthsBetween(getLocalDateString(), targetDate);
  }, [isAsap, targetDate]);

  const requiredMonthlyContribution = useMemo(() => {
    if (isAsap || monthsRemaining === null) return 0;
    return calculateRequiredMonthlyContribution(remainingAmount, targetDate);
  }, [isAsap, remainingAmount, targetDate]);

  const effectivePlannedContribution = useCustomContribution
    ? customPlannedContribution
    : isAsap
    ? Math.max(1000, remainingFlexibleSurplus > 0 ? Math.round(remainingFlexibleSurplus * 0.7) : 5000)
    : requiredMonthlyContribution;

  // Feasibility
  const feasibility = useMemo(() => {
    return calculateMissionFeasibility({
      targetAmount,
      currentAmount: initialAmount,
      targetDate: isAsap ? '' : targetDate,
      isAsap,
      availableSurplus: snapshot.monthlySurplus,
      userSelectedContribution: effectivePlannedContribution,
    });
  }, [targetAmount, initialAmount, isAsap, targetDate, effectivePlannedContribution, snapshot.monthlySurplus]);

  const surplusUtilizationPercentage = useMemo(() => {
    if (snapshot.monthlySurplus <= 0) return 100;
    return Math.min(100, Math.round((effectivePlannedContribution / snapshot.monthlySurplus) * 100));
  }, [snapshot.monthlySurplus, effectivePlannedContribution]);

  if (!isOpen) return null;

  // Quick preset helpers
  const handleSetQuickDuration = (months: number) => {
    setIsAsap(false);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setTargetDate(getLocalDateString(d));
  };

  const handleApplyEmergencyFundPreset = (months: number) => {
    const calculated = calculateEmergencyFundTarget(essentialMonthlyExpenses, months);
    setTargetAmount(calculated);
    setName(`${months}-Month Emergency Runway`);
    setCategory('emergency_fund');
    setPriority('high');
    setDescription(`Safety buffer covering ${months} months of essential household expenses (${formatINR(essentialMonthlyExpenses)}/mo).`);
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setError('Please enter a mission title.');
        return;
      }
    } else if (currentStep === 2) {
      if (targetAmount <= 0 || isNaN(targetAmount)) {
        setError('Target capital must be greater than ₹0.');
        return;
      }
    } else if (currentStep === 3) {
      if (!isAsap && !targetDate) {
        setError('Please choose a valid deadline date or enable ASAP mode.');
        return;
      }
    } else if (currentStep === 4) {
      if (initialAmount < 0 || isNaN(initialAmount)) {
        setError('Initial capital cannot be negative.');
        return;
      }
      if (initialAmount > targetAmount) {
        setError('Initial capital cannot exceed the target amount.');
        return;
      }
    } else if (currentStep === 5) {
      if (effectivePlannedContribution < 0) {
        setError('Planned contribution cannot be negative.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleInitializeMission = () => {
    const newMission = createMission({
      name: name.trim(),
      category,
      priority,
      description: description.trim(),
      targetAmount,
      targetDate: isAsap ? '' : targetDate,
      isAsap,
      initialAmount,
      monthlyContribution: effectivePlannedContribution,
    });

    onMissionCreated?.(newMission.id);
    onClose();
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
          maxWidth: '680px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="status-pill status-pill-red">NEW SAVINGS MISSION</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Step {currentStep} of 6
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
              {currentStep === 1 && 'Mission Definition'}
              {currentStep === 2 && 'Target Capital'}
              {currentStep === 3 && 'Target Deadline'}
              {currentStep === 4 && 'Current Reserves'}
              {currentStep === 5 && 'Monthly Contribution'}
              {currentStep === 6 && 'Feasibility & Launch'}
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

        {/* Stepper Progress Bar */}
        <div style={{ height: '3px', background: 'var(--bg-app)', display: 'flex' }}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                background: step <= currentStep ? 'var(--red-primary)' : 'transparent',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: MISSION DEFINITION */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="ui-label" htmlFor="mission-title">MISSION NAME / OBJECTIVE</label>
                <input
                  id="mission-title"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
                  placeholder="e.g. MacBook Pro M-Series, 6-Month Emergency Runway, Goa Trip"
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="ui-label" htmlFor="mission-category">CATEGORY</label>
                  <select
                    id="mission-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%' }}
                  >
                    <option value="emergency_fund">Emergency Fund</option>
                    <option value="gadget">Gadget & Hardware</option>
                    <option value="travel">Travel & Experience</option>
                    <option value="vehicle">Vehicle / Transport</option>
                    <option value="home">Home & Real Estate</option>
                    <option value="education">Education & Upskilling</option>
                    <option value="investment_seed">Investment Seed Capital</option>
                    <option value="other">Other Tactical Objective</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label" htmlFor="mission-priority">PRIORITY LEVEL</label>
                  <select
                    id="mission-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MissionPriority)}
                    className="ui-input"
                    style={{ width: '100%' }}
                  >
                    <option value="high">High Priority (Safeguarded first)</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority (Flexible / discretionary)</option>
                  </select>
                </div>
              </div>

              {/* Emergency Fund Auto-Sizing Helper */}
              {category === 'emergency_fund' && (
                <div
                  style={{
                    background: 'rgba(239, 71, 111, 0.08)',
                    border: '1px solid rgba(239, 71, 111, 0.25)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--red-bright)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      Emergency Fund Auto-Sizing Assistant
                    </span>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Essential monthly expenses: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(essentialMonthlyExpenses)}</strong>.
                    Choose target runway coverage:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[3, 6, 9, 12].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => handleApplyEmergencyFundPreset(months)}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        {months} Months ({formatINR(calculateEmergencyFundTarget(essentialMonthlyExpenses, months))})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="ui-label" htmlFor="mission-description">TACTICAL NOTES / DESCRIPTION (OPTIONAL)</label>
                <textarea
                  id="mission-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="ui-input"
                  rows={2}
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="e.g. 16-inch M3 Max with 36GB unified memory for development workstation."
                />
              </div>
            </div>
          )}

          {/* STEP 2: TARGET AMOUNT */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="ui-label" htmlFor="target-amount">TOTAL TARGET CAPITAL (₹)</label>
                <input
                  id="target-amount"
                  type="number"
                  min="1"
                  step="1000"
                  value={targetAmount || ''}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="ui-input font-mono"
                  style={{ width: '100%', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}
                  placeholder="100000"
                  autoFocus
                />
                <div style={{ fontSize: '0.85rem', color: 'var(--status-green)', marginTop: '0.4rem', fontWeight: 700 }}>
                  Target: {formatINR(targetAmount)}
                </div>
              </div>

              {/* Quick capital adders */}
              <div>
                <span className="ui-label">QUICK CAPITAL PRESETS</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[25000, 50000, 100000, 250000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetAmount(preset)}
                      className="btn-ghost"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.8rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                      }}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TARGET DEADLINE */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="ui-label" style={{ marginBottom: 0 }}>TARGET COMPLETION TIMELINE</span>
                  <button
                    type="button"
                    onClick={() => setIsAsap(!isAsap)}
                    className={`btn-ghost ${isAsap ? 'status-pill-green' : ''}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.6rem',
                      border: isAsap ? '1px solid var(--status-green)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <Zap size={14} /> {isAsap ? 'ASAP MODE ENABLED' : 'ENABLE ASAP MODE'}
                  </button>
                </div>

                {!isAsap ? (
                  <>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="ui-input"
                      style={{ width: '100%', fontSize: '1.1rem' }}
                      min={getLocalDateString()}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                      Target Window: <strong className="font-mono" style={{ color: '#ffffff' }}>{monthsRemaining} months</strong> remaining.
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      background: 'rgba(6, 214, 160, 0.1)',
                      border: '1px solid rgba(6, 214, 160, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                      ASAP Mode Active
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      No strict deadline constraint. Target date will be projected organically from your monthly contribution.
                    </p>
                  </div>
                )}
              </div>

              {!isAsap && (
                <div>
                  <span className="ui-label">QUICK TIMELINE PRESETS</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[3, 6, 12, 18, 24, 36].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => handleSetQuickDuration(months)}
                        className="btn-ghost"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.8rem',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                        }}
                      >
                        {months} Months
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CURRENT CAPITAL */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="ui-label" htmlFor="initial-amount">CAPITAL ALREADY SAVED OR ALLOCATED (₹)</label>
                <input
                  id="initial-amount"
                  type="number"
                  min="0"
                  max={targetAmount}
                  step="1000"
                  value={initialAmount || ''}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="ui-input font-mono"
                  style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700 }}
                  placeholder="0"
                  autoFocus
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Existing savings committed specifically to this objective.
                </span>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remaining Capital Required</span>
                  <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-yellow)' }}>
                    {formatINR(remainingAmount)}
                  </span>
                </div>
                <div className="progress-bar-track" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${targetAmount > 0 ? Math.min(100, Math.round((initialAmount / targetAmount) * 100)) : 0}%`,
                      background: 'var(--red-primary)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>Initial: {formatINR(initialAmount)} ({targetAmount > 0 ? Math.round((initialAmount / targetAmount) * 100) : 0}%)</span>
                  <span>Target: {formatINR(targetAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MONTHLY CONTRIBUTION */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span className="ui-label">MONTHLY CONTRIBUTION STRATEGY</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setUseCustomContribution(false)}
                    className="ui-card"
                    style={{
                      border: !useCustomContribution ? '2px solid var(--red-primary)' : '1px solid var(--border-subtle)',
                      background: !useCustomContribution ? 'rgba(239, 71, 111, 0.08)' : 'var(--bg-card-elevated)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      System Calculated
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Exact requirement based on timeline.
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-bright)', marginTop: '0.5rem' }}>
                      {formatINR(requiredMonthlyContribution)}/mo
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseCustomContribution(true)}
                    className="ui-card"
                    style={{
                      border: useCustomContribution ? '2px solid var(--red-primary)' : '1px solid var(--border-subtle)',
                      background: useCustomContribution ? 'rgba(239, 71, 111, 0.08)' : 'var(--bg-card-elevated)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      Custom Allocation
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Define your own monthly commitment.
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.5rem' }}>
                      {formatINR(customPlannedContribution)}/mo
                    </div>
                  </button>
                </div>

                {useCustomContribution && (
                  <div>
                    <label className="ui-label" htmlFor="custom-contribution">CUSTOM MONTHLY COMMITMENT (₹)</label>
                    <input
                      id="custom-contribution"
                      type="number"
                      min="1"
                      step="500"
                      value={customPlannedContribution || ''}
                      onChange={(e) => setCustomPlannedContribution(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%', fontSize: '1.25rem', fontWeight: 700 }}
                    />
                  </div>
                )}
              </div>

              {/* Surplus Safeguard Telemetry */}
              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="ui-label" style={{ marginBottom: 0 }}>SURPLUS IMPACT TELEMETRY</span>
                  <span
                    className={`status-pill ${
                      effectivePlannedContribution <= remainingFlexibleSurplus
                        ? 'status-pill-green'
                        : snapshot.monthlySurplus > 0
                        ? 'status-pill-yellow'
                        : 'status-pill-red'
                    }`}
                  >
                    {effectivePlannedContribution <= remainingFlexibleSurplus ? 'HEALTHY BUFFER' : 'DEFICIT RISK'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Available Surplus</span>
                    <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                      {formatINR(snapshot.monthlySurplus)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mission Commitment</span>
                    <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--red-bright)', marginTop: '0.2rem' }}>
                      {formatINR(effectivePlannedContribution)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Remaining Buffer</span>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: snapshot.monthlySurplus - effectivePlannedContribution >= 0 ? 'var(--status-green)' : 'var(--status-red)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {formatINR(snapshot.monthlySurplus - effectivePlannedContribution)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: FEASIBILITY & LAUNCH */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Feasibility Status Card */}
              <div
                style={{
                  background:
                    feasibility.status === 'on_track' || feasibility.status === 'completed'
                      ? 'rgba(6, 214, 160, 0.1)'
                      : feasibility.status === 'tight'
                      ? 'rgba(255, 209, 102, 0.1)'
                      : 'rgba(239, 71, 111, 0.1)',
                  border: `1px solid ${
                    feasibility.status === 'on_track' || feasibility.status === 'completed'
                      ? 'rgba(6, 214, 160, 0.3)'
                      : feasibility.status === 'tight'
                      ? 'rgba(255, 209, 102, 0.3)'
                      : 'rgba(239, 71, 111, 0.3)'
                  }`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {feasibility.status === 'on_track' || feasibility.status === 'completed' ? (
                      <CheckCircle2 size={20} style={{ color: 'var(--status-green)' }} />
                    ) : (
                      <AlertTriangle size={20} style={{ color: feasibility.status === 'tight' ? 'var(--status-yellow)' : 'var(--status-red)' }} />
                    )}
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color:
                          feasibility.status === 'on_track' || feasibility.status === 'completed'
                            ? 'var(--status-green)'
                            : feasibility.status === 'tight'
                            ? 'var(--status-yellow)'
                            : 'var(--status-red)',
                      }}
                    >
                      FEASIBILITY: {feasibility.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {surplusUtilizationPercentage}% SURPLUS USED
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#ffffff', lineHeight: 1.5 }}>
                  {feasibility.explanation}
                </p>
              </div>

              {/* Plan Summary Specs */}
              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <span className="ui-label">MISSION BLUEPRINT SUMMARY</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Objective:</span>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>{name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                    <div style={{ fontWeight: 700, color: 'var(--red-bright)', textTransform: 'capitalize', marginTop: '0.15rem' }}>{priority}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Target Capital:</span>
                    <div className="font-mono" style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>{formatINR(targetAmount)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Initial Seed:</span>
                    <div className="font-mono" style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>{formatINR(initialAmount)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Monthly Commitment:</span>
                    <div className="font-mono" style={{ fontWeight: 700, color: 'var(--status-green)', marginTop: '0.15rem' }}>{formatINR(effectivePlannedContribution)}/mo</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Projected Completion:</span>
                    <div className="font-mono" style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
                      {feasibility.projectedCompletionDate || 'Under review'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation error display */}
          {error && (
            <div
              style={{
                color: 'var(--status-red)',
                fontSize: '0.8rem',
                background: 'rgba(239, 71, 111, 0.1)',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                marginTop: '1rem',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-elevated)',
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInitializeMission}
              className="btn-primary"
              style={{
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.4rem',
              }}
            >
              <Target size={16} />
              INITIALIZE MISSION
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
