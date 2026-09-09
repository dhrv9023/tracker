// ==========================================================================
// FINANCE OS — PHASE 3 MISSION DETAIL MODAL
// Deep Telemetry, Capital Deployment Log, Ahead/Behind Tracking,
// "What If?" Scenario Simulator, and Standalone Calculators.
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatINR,
  calculateExpectedProgress,
  calculateMissionProgress,
  calculateMissionFeasibility,
  generateSavingsScenarios,
  calculateRequiredMonthlyContribution,
  calculateProjectedCompletionDate,
  getLocalDateString,
} from '../../utils/finance';
import { SavingsContribution, SavingsMission, MissionPriority } from '../../types/finance';
import { DeployCapitalModal } from './DeployCapitalModal';
import { AIMissionAssistantModal } from './AIMissionAssistantModal';
import {
  X,
  Target,
  ArrowUpRight,
  Trash2,
  Edit2,
  Calculator,
  ListOrdered,
  Sliders,
  FileText,
} from 'lucide-react';

interface MissionDetailModalProps {
  missionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({
  missionId,
  isOpen,
  onClose,
}) => {
  const {
    missions,
    contributions,
    snapshot,
    updateMission,
    deleteMission,
    archiveMission,
    updateContribution,
    deleteContribution,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'log' | 'simulator' | 'calculators' | 'edit'>('log');
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [deleteConfirmMission, setDeleteConfirmMission] = useState<boolean>(false);
  const [editingContributionId, setEditingContributionId] = useState<string | null>(null);
  const [editContributionAmount, setEditContributionAmount] = useState<number>(0);
  const [editContributionNote, setEditContributionNote] = useState<string>('');

  // Interactive Simulator Custom Input
  const [simCustomAmount, setSimCustomAmount] = useState<number>(10000);

  // Standalone Calculators State
  const [calc1Target, setCalc1Target] = useState<number>(150000);
  const [calc1Months, setCalc1Months] = useState<number>(12);

  const [calc2Target, setCalc2Target] = useState<number>(150000);
  const [calc2Current, setCalc2Current] = useState<number>(20000);
  const [calc2Monthly, setCalc2Monthly] = useState<number>(15000);

  const mission = missions.find((m) => m.id === missionId);

  // Edit Mission Form State
  const [editName, setEditName] = useState<string>('');
  const [editTargetAmount, setEditTargetAmount] = useState<number>(0);
  const [editTargetDate, setEditTargetDate] = useState<string>('');
  const [editPriority, setEditPriority] = useState<MissionPriority>('high');
  const [editCategory, setEditCategory] = useState<string>('gadget');
  const [editMonthlyContribution, setEditMonthlyContribution] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>('');

  // Synchronize edit state when mission loads
  React.useEffect(() => {
    if (mission) {
      setEditName(mission.name);
      setEditTargetAmount(mission.targetAmount);
      setEditTargetDate(mission.targetDate || '');
      setEditPriority(mission.priority);
      setEditCategory(mission.category);
      setEditMonthlyContribution(mission.monthlyContribution);
      setEditDescription(mission.description || '');
      setSimCustomAmount(mission.monthlyContribution || 10000);
    }
  }, [mission]);

  if (!isOpen || !mission) return null;

  const missionContributions = contributions.filter((c) => c.missionId === mission.id);
  const progressPercentage = calculateMissionProgress(mission.currentAmount, mission.targetAmount);
  const remainingAmount = Math.max(0, mission.targetAmount - mission.currentAmount);

  // Trajectory Tracking
  const startDateStr = mission.createdAt ? mission.createdAt.split('T')[0] : getLocalDateString();
  const aheadBehind = calculateExpectedProgress(
    mission.targetAmount,
    mission.initialAmount,
    startDateStr,
    mission.targetDate || getLocalDateString(),
    getLocalDateString(),
    mission.currentAmount
  );

  // Feasibility
  const feasibility = calculateMissionFeasibility({
    targetAmount: mission.targetAmount,
    currentAmount: mission.currentAmount,
    targetDate: mission.targetDate,
    isAsap: mission.isAsap,
    availableSurplus: snapshot.monthlySurplus,
    userSelectedContribution: mission.monthlyContribution,
  });

  // Scenarios
  const scenarios = generateSavingsScenarios(
    remainingAmount,
    mission.monthlyContribution,
    mission.targetDate || getLocalDateString()
  );

  // Custom Simulator Calculations
  const simCustomMonths = simCustomAmount > 0 ? Math.ceil(remainingAmount / simCustomAmount) : null;
  const simCustomDateObj = simCustomAmount > 0
    ? calculateProjectedCompletionDate(remainingAmount, simCustomAmount)
    : null;
  const simCustomDate = simCustomDateObj ? simCustomDateObj.completionDate : 'Indefinite';

  // Standalone Calc 1 Result
  const calc1Required = calc1Months > 0 ? Math.ceil(calc1Target / calc1Months) : 0;

  // Standalone Calc 2 Result
  const calc2Remaining = Math.max(0, calc2Target - calc2Current);
  const calc2MonthsNeeded = calc2Monthly > 0 ? Math.ceil(calc2Remaining / calc2Monthly) : null;
  const calc2ProjectedDateObj = calc2Monthly > 0
    ? calculateProjectedCompletionDate(calc2Remaining, calc2Monthly)
    : null;
  const calc2ProjectedDate = calc2ProjectedDateObj ? calc2ProjectedDateObj.completionDate : 'Indefinite';

  const handleSaveMissionEdits = (e: React.FormEvent) => {
    e.preventDefault();
    updateMission({
      ...mission,
      name: editName.trim(),
      targetAmount: editTargetAmount,
      targetDate: editTargetDate,
      priority: editPriority,
      category: editCategory,
      monthlyContribution: editMonthlyContribution,
      description: editDescription.trim(),
    });
    setActiveTab('log');
  };

  const handleStartEditContribution = (c: SavingsContribution) => {
    setEditingContributionId(c.id);
    setEditContributionAmount(c.amount);
    setEditContributionNote(c.note || '');
  };

  const handleSaveContributionEdit = (cId: string) => {
    if (editContributionAmount <= 0) return;
    const target = missionContributions.find((c) => c.id === cId);
    if (!target) return;

    updateContribution({
      ...target,
      amount: editContributionAmount,
      note: editContributionNote.trim(),
    });
    setEditingContributionId(null);
  };

  const handleDeleteMission = () => {
    deleteMission(mission.id);
    onClose();
  };

  const handleArchiveMission = () => {
    archiveMission(mission.id);
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
          maxWidth: '850px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="status-pill status-pill-red">{mission.category.toUpperCase().replace('_', ' ')}</span>
              <span
                className={`status-pill ${
                  mission.priority === 'high'
                    ? 'status-pill-red'
                    : mission.priority === 'medium'
                    ? 'status-pill-yellow'
                    : 'status-pill-neutral'
                }`}
              >
                {mission.priority.toUpperCase()} PRIORITY
              </span>
              <span
                className={`status-pill ${
                  mission.status === 'completed'
                    ? 'status-pill-green'
                    : mission.status === 'on_track'
                    ? 'status-pill-green'
                    : mission.status === 'tight'
                    ? 'status-pill-yellow'
                    : 'status-pill-red'
                }`}
              >
                {mission.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
              {mission.name}
            </h2>
            {mission.description && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {mission.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--red-bright)',
                borderColor: 'rgba(239, 71, 111, 0.4)',
              }}
            >
              <FileText size={14} /> ADVISOR REVIEW
            </button>
            <button
              type="button"
              onClick={() => setShowDeployModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              <ArrowUpRight size={15} /> Deploy Capital
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hero Telemetry HUD */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'var(--bg-card-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="mono-figure" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatINR(mission.currentAmount)}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  of {formatINR(mission.targetAmount)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {aheadBehind && (
                  <span
                    className={`status-pill ${
                      aheadBehind.status === 'ahead'
                        ? 'status-pill-green'
                        : aheadBehind.status === 'behind'
                        ? 'status-pill-red'
                        : 'status-pill-neutral'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {aheadBehind.status === 'ahead' && `+${formatINR(aheadBehind.variance)} AHEAD`}
                    {aheadBehind.status === 'behind' && `-${formatINR(Math.abs(aheadBehind.variance))} BEHIND`}
                    {aheadBehind.status === 'on_schedule' && 'ON SCHEDULE'}
                  </span>
                )}
                <span className="mono-figure" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red-bright)' }}>
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-track" style={{ height: '10px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercentage}%`,
                  background: mission.status === 'completed' ? 'var(--status-green)' : 'var(--red-primary)',
                }}
              />
            </div>
          </div>

          {/* Micro Telemetry Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Remaining Capital</span>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {formatINR(remainingAmount)}
              </div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Committed Allocation</span>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-green)', marginTop: '0.2rem' }}>
                {formatINR(mission.monthlyContribution)}/mo
              </div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Required Run Rate</span>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-yellow)', marginTop: '0.2rem' }}>
                {formatINR(feasibility.requiredMonthlyContribution)}/mo
              </div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target Deadline</span>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {mission.targetDate || 'ASAP (Organic)'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Projected Finish</span>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {feasibility.projectedCompletionDate || 'Indefinite'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', padding: '0 1.75rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'log' ? '2px solid var(--red-primary)' : '2px solid transparent',
              color: activeTab === 'log' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ListOrdered size={15} /> Deployment Log ({missionContributions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'simulator' ? '2px solid var(--red-primary)' : '2px solid transparent',
              color: activeTab === 'simulator' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sliders size={15} /> SIMULATE SCENARIOS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculators')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'calculators' ? '2px solid var(--red-primary)' : '2px solid transparent',
              color: activeTab === 'calculators' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Calculator size={15} /> Calculators
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'edit' ? '2px solid var(--red-primary)' : '2px solid transparent',
              color: activeTab === 'edit' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sliders size={15} /> Mission Settings
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: CAPITAL DEPLOYMENT LOG */}
          {activeTab === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ui-label" style={{ marginBottom: 0 }}>
                  CHRONOLOGICAL DEPLOYMENT HISTORY
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total Deployed: {formatINR(mission.currentAmount)}
                </span>
              </div>

              {missionContributions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card-elevated)', borderRadius: '12px' }}>
                  <Target size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>No Capital Injections Yet</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Deploy planning capital to track simulated savings and accelerate mission completion.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeployModal(true)}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', marginTop: '1rem' }}
                  >
                    Deploy First Capital
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {missionContributions.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: 'var(--bg-card-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '0.85rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      {editingContributionId === c.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                          <input
                            type="number"
                            value={editContributionAmount}
                            onChange={(e) => setEditContributionAmount(Number(e.target.value))}
                            className="ui-input font-mono"
                            style={{ width: '140px' }}
                          />
                          <input
                            type="text"
                            value={editContributionNote}
                            onChange={(e) => setEditContributionNote(e.target.value)}
                            className="ui-input"
                            style={{ flex: 1 }}
                            placeholder="Note"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveContributionEdit(c.id)}
                            className="btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingContributionId(null)}
                            className="btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                                {c.note || 'Planning deployment'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.date}</span>
                                <span className="status-pill status-pill-neutral" style={{ fontSize: '0.6rem' }}>
                                  {c.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="mono-figure" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-green)' }}>
                              +{formatINR(c.amount)}
                            </span>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditContribution(c)}
                                className="btn-ghost"
                                style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                                title="Edit entry"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteContribution(c.id)}
                                className="btn-ghost"
                                style={{ padding: '0.3rem', color: 'var(--status-red)' }}
                                title="Delete entry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: "WHAT IF?" SCENARIO SIMULATOR */}
          {activeTab === 'simulator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span className="ui-label">DETERMINISTIC TRAJECTORY SCENARIOS</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Simulated mathematical paths based on varying monthly commitment levels versus your current surplus of{' '}
                  <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(snapshot.monthlySurplus)}</strong>.
                </p>
              </div>

              {/* Scenarios Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {scenarios.map((sc, idx) => (
                  <div
                    key={sc.monthlyContribution}
                    style={{
                      background: 'var(--bg-card-elevated)',
                      border: idx === 1 ? '2px solid var(--red-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {idx === 1 && (
                      <span
                        className="status-pill status-pill-red"
                        style={{ position: 'absolute', top: '-10px', right: '12px', fontSize: '0.6rem' }}
                      >
                        CURRENT PLAN
                      </span>
                    )}
                    <div>
                      <span className="ui-label" style={{ fontSize: '0.7rem' }}>LEVEL {idx + 1}</span>
                      <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
                        {formatINR(sc.monthlyContribution)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mo</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {sc.diffFromTargetMonths < 0
                          ? `Reaches target ${Math.abs(sc.diffFromTargetMonths)} months earlier than target date.`
                          : sc.diffFromTargetMonths > 0
                          ? `Completes ${sc.diffFromTargetMonths} months past target date.`
                          : 'Paces evenly with target timeline.'}
                      </p>
                    </div>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Months:</span>
                        <span className="font-mono" style={{ color: '#ffffff', fontWeight: 700 }}>
                          {sc.monthsRequired}m
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Finish:</span>
                        <span className="font-mono" style={{ color: 'var(--status-green)', fontWeight: 700 }}>
                          {sc.projectedCompletionDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Custom Allocation Slider */}
              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="ui-label" style={{ marginBottom: 0 }}>INTERACTIVE CUSTOM ALLOCATION TESTER</span>
                  <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-bright)' }}>
                    {formatINR(simCustomAmount)}/mo
                  </span>
                </div>

                <input
                  type="range"
                  min="1000"
                  max={Math.max(50000, snapshot.monthlySurplus * 1.5)}
                  step="500"
                  value={simCustomAmount}
                  onChange={(e) => setSimCustomAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--red-primary)', cursor: 'pointer', margin: '0.75rem 0' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Remaining Capital</span>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
                      {formatINR(remainingAmount)}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Time Required</span>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-yellow)', marginTop: '0.15rem' }}>
                      {simCustomMonths !== null ? `${simCustomMonths} months` : 'Indefinite'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Projected Finish</span>
                    <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-green)', marginTop: '0.15rem' }}>
                      {simCustomDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE CALCULATORS */}
          {activeTab === 'calculators' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Calc 1: How much should I save monthly? */}
              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <span className="status-pill status-pill-red">CALCULATOR 1</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                  How Much Should I Save Monthly?
                </h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Calculate the exact monthly contribution required to reach a specific target within a defined number of months.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <label className="ui-label">TARGET CAPITAL (₹)</label>
                    <input
                      type="number"
                      value={calc1Target || ''}
                      onChange={(e) => setCalc1Target(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="ui-label">MONTHS TO DEADLINE</label>
                    <input
                      type="number"
                      value={calc1Months || ''}
                      onChange={(e) => setCalc1Months(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%' }}
                      min="1"
                    />
                  </div>
                  <div style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Required Monthly</span>
                    <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-green)', marginTop: '0.2rem' }}>
                      {formatINR(calc1Required)}/mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Calc 2: When will I reach my goal? */}
              <div
                style={{
                  background: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <span className="status-pill status-pill-red">CALCULATOR 2</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                  When Will I Reach It?
                </h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Determine the exact completion duration and date given your committed monthly savings.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <label className="ui-label">TARGET (₹)</label>
                    <input
                      type="number"
                      value={calc2Target || ''}
                      onChange={(e) => setCalc2Target(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="ui-label">SAVED ALREADY (₹)</label>
                    <input
                      type="number"
                      value={calc2Current || ''}
                      onChange={(e) => setCalc2Current(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="ui-label">MONTHLY CONTRIBUTION (₹)</label>
                    <input
                      type="number"
                      value={calc2Monthly || ''}
                      onChange={(e) => setCalc2Monthly(Number(e.target.value))}
                      className="ui-input font-mono"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Duration & Date</span>
                    <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--status-yellow)', marginTop: '0.2rem' }}>
                      {calc2MonthsNeeded !== null ? `${calc2MonthsNeeded} months` : 'Indefinite'}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{calc2ProjectedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MISSION CONFIGURATION (EDIT / ARCHIVE / DELETE) */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveMissionEdits} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="ui-label" htmlFor="edit-mission-title">MISSION NAME</label>
                <input
                  id="edit-mission-title"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="ui-input"
                  style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="ui-label" htmlFor="edit-target-amount">TARGET CAPITAL (₹)</label>
                  <input
                    id="edit-target-amount"
                    type="number"
                    value={editTargetAmount || ''}
                    onChange={(e) => setEditTargetAmount(Number(e.target.value))}
                    className="ui-input font-mono"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label className="ui-label" htmlFor="edit-target-date">TARGET DEADLINE (OR EMPTY FOR ASAP)</label>
                  <input
                    id="edit-target-date"
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="ui-label" htmlFor="edit-priority">PRIORITY</label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as MissionPriority)}
                    className="ui-input"
                    style={{ width: '100%' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label" htmlFor="edit-category">CATEGORY</label>
                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="ui-input"
                    style={{ width: '100%' }}
                  >
                    <option value="emergency_fund">Emergency Fund</option>
                    <option value="gadget">Gadget & Hardware</option>
                    <option value="travel">Travel & Experience</option>
                    <option value="vehicle">Vehicle / Transport</option>
                    <option value="home">Home & Real Estate</option>
                    <option value="education">Education & Upskilling</option>
                    <option value="investment_seed">Investment Seed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label" htmlFor="edit-monthly-alloc">MONTHLY ALLOCATION (₹)</label>
                  <input
                    id="edit-monthly-alloc"
                    type="number"
                    value={editMonthlyContribution || ''}
                    onChange={(e) => setEditMonthlyContribution(Number(e.target.value))}
                    className="ui-input font-mono"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label className="ui-label" htmlFor="edit-desc">TACTICAL NOTES</label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="ui-input"
                  rows={2}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleArchiveMission}
                    className="btn-ghost"
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Archive Mission
                  </button>

                  {!deleteConfirmMission ? (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmMission(true)}
                      className="btn-ghost"
                      style={{ fontSize: '0.8rem', color: 'var(--status-red)' }}
                    >
                      Delete Mission
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeleteMission}
                      className="btn-danger"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Confirm Permanent Deletion
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Save Mission Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested Deploy Capital Modal */}
      {showDeployModal && (
        <DeployCapitalModal
          missionId={mission.id}
          isOpen={showDeployModal}
          onClose={() => setShowDeployModal(false)}
        />
      )}

      {/* Nested AI Assistant Modal */}
      {showAIModal && (
        <AIMissionAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSwitchToManual={() => {
            setShowAIModal(false);
            setActiveTab('edit');
          }}
          prefillPrompt={`How can I reach my ${mission.name} mission faster or optimize my monthly contribution?`}
        />
      )}
    </div>
  );
};
