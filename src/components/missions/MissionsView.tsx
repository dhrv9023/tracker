// ==========================================================================
// FINANCE OS — PHASE 3 MISSIONS CONSOLE (MISSIONS VIEW)
// Strategic Mission Control, Multi-Mission Conflict Safeguards,
// Ahead/Behind Visuals, Capital Deployment, and Completed Archive.
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, calculateExpectedProgress, calculateMissionProgress, getLocalDateString } from '../../utils/finance';
import { MissionPriority } from '../../types/finance';
import { CreateMissionModal } from './CreateMissionModal';
import { DeployCapitalModal } from './DeployCapitalModal';
import { MissionDetailModal } from './MissionDetailModal';
import { AIMissionAssistantModal } from './AIMissionAssistantModal';
import {
  Target,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  Filter,
  Sliders,
  Terminal,
  Cpu,
} from 'lucide-react';

export const MissionsView: React.FC = () => {
  const {
    missions,
    activeMissions,
    completedMissions,
    totalMissionTargetCapital,
    totalMissionCapitalDeployed,
    overallMissionProgress,
    missionConflict,
    snapshot,
    isDemoMode,
    openAdvisorWithContext,
  } = useFinance();


  // Modal controls
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [selectedMissionIdForDeploy, setSelectedMissionIdForDeploy] = useState<string | undefined>(undefined);
  const [inspectMissionId, setInspectMissionId] = useState<string | null>(null);

  // Filters & Sorting
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'active' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'target' | 'deadline'>('priority');

  const handleOpenDeployForMission = (missionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMissionIdForDeploy(missionId);
    setShowDeployModal(true);
  };

  // Filtered & Sorted Active Missions
  const displayedActiveMissions = useMemo(() => {
    let list = [...activeMissions];

    if (priorityFilter !== 'all') {
      list = list.filter((m) => m.priority === priorityFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<MissionPriority, number> = { high: 3, medium: 2, low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (sortBy === 'progress') {
        return (
          calculateMissionProgress(b.currentAmount, b.targetAmount) -
          calculateMissionProgress(a.currentAmount, a.targetAmount)
        );
      }
      if (sortBy === 'target') {
        return b.targetAmount - a.targetAmount;
      }
      if (sortBy === 'deadline') {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      return 0;
    });

    return list;
  }, [activeMissions, priorityFilter, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Console Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="pulsing-dot" />
            <span className="status-pill status-pill-red">STRATEGIC CAPITAL ALLOCATION</span>
            {isDemoMode && <span className="status-pill status-pill-yellow">DEMO MODE ACTIVE</span>}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Savings Missions Console
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Plan, simulate, and track capital toward high-conviction financial goals. Zero guesswork.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedMissionIdForDeploy(undefined);
              setShowDeployModal(true);
            }}
            disabled={missions.length === 0}
            className="btn-secondary"
            style={{ fontSize: '0.825rem', padding: '0.6rem 1.15rem' }}
          >
            <ArrowUpRight size={16} /> Deploy Capital
          </button>
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="btn-primary"
            style={{ fontSize: '0.825rem', padding: '0.6rem 1.15rem' }}
          >
            <Sliders size={15} /> SIMULATE PLAN
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.825rem', padding: '0.6rem 1.15rem' }}
          >
            <Plus size={15} /> NEW MISSION
          </button>
        </div>
      </div>

      {/* MULTI-MISSION CONFLICT SAFEGUARD BANNER */}
      {missionConflict.hasConflict && (
        <div
          className="ui-card"
          style={{
            borderLeft: '4px solid var(--status-red)',
            background: 'rgba(239, 71, 111, 0.1)',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <ShieldAlert size={24} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="status-pill status-pill-red">CAPITAL ALLOCATION CONFLICT</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  TOTAL MISSION COMMITMENTS EXCEED AVAILABLE MONTHLY SURPLUS
                </h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Your active missions demand{' '}
                <strong className="font-mono" style={{ color: 'var(--red-bright)' }}>{formatINR(missionConflict.totalRequiredContribution)}/mo</strong>,
                which exceeds your available monthly surplus ({formatINR(snapshot.monthlySurplus)}) by{' '}
                <strong className="font-mono" style={{ color: 'var(--status-red)' }}>{formatINR(missionConflict.shortfall)}/month</strong>.
              </p>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  marginTop: '0.6rem',
                  fontSize: '0.775rem',
                  color: 'var(--text-secondary)',
                }}
              >
                🛡️ <strong>Priority Safeguard Advice:</strong> High Priority missions receive priority capital. We recommend extending the target dates or reducing allocations on lower-priority missions to avoid cash flow stress.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: MISSIONS HUD TELEMETRY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        {/* Active Missions */}
        <div className="ui-card ui-card-highlight">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="ui-label" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 0 }}>
              Active Missions
            </span>
            <Target size={18} style={{ color: '#ffffff' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {activeMissions.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {completedMissions.length} Objectives Achieved
          </span>
        </div>

        {/* Total Target Capital */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="ui-label" style={{ marginBottom: 0 }}>Target Capital</span>
            <Layers size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {formatINR(totalMissionTargetCapital)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cumulative Target Pool
          </span>
        </div>

        {/* Total Capital Deployed */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="ui-label" style={{ marginBottom: 0 }}>Capital Deployed</span>
            <ArrowUpRight size={18} style={{ color: 'var(--status-green)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-green)', marginBottom: '0.25rem' }}>
            {formatINR(totalMissionCapitalDeployed)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Remaining: {formatINR(Math.max(0, totalMissionTargetCapital - totalMissionCapitalDeployed))}
          </span>
        </div>

        {/* Overall Progress */}
        <div className="ui-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="ui-label" style={{ marginBottom: 0 }}>Aggregate Progress</span>
            <TrendingUp size={18} style={{ color: 'var(--red-bright)' }} />
          </div>
          <div className="mono-figure" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {overallMissionProgress}%
          </div>
          <div className="progress-bar-track" style={{ height: '6px', marginTop: '0.35rem' }}>
            <div className="progress-bar-fill" style={{ width: `${overallMissionProgress}%`, background: 'var(--red-primary)' }} />
          </div>
        </div>
      </div>

      {/* SECTION 2: VIEW TABS & FILTER BAR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        {/* Active vs Completed Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setViewTab('active')}
            className={`btn-ghost ${viewTab === 'active' ? 'status-pill-red' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: viewTab === 'active' ? '1px solid var(--red-primary)' : '1px solid transparent',
            }}
          >
            Active Missions ({activeMissions.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('completed')}
            className={`btn-ghost ${viewTab === 'completed' ? 'status-pill-green' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: viewTab === 'completed' ? '1px solid var(--status-green)' : '1px solid transparent',
            }}
          >
            Completed Objectives ({completedMissions.length})
          </button>
        </div>

        {/* Priority Filter & Sort By */}
        {viewTab === 'active' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="ui-input"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="ui-input"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <option value="priority">Sort: Priority Level</option>
              <option value="progress">Sort: Highest Progress</option>
              <option value="target">Sort: Target Amount</option>
              <option value="deadline">Sort: Earliest Deadline</option>
            </select>
          </div>
        )}
      </div>

      {/* SECTION 3: ACTIVE MISSIONS GRID */}
      {viewTab === 'active' && (
        <>
          {displayedActiveMissions.length === 0 ? (
            <div className="ui-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Target size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                {priorityFilter === 'all' ? 'NO ACTIVE MISSIONS INITIALIZED' : 'NO MISSIONS MATCH THIS FILTER'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem auto 1.5rem', maxWidth: '440px' }}>
                {priorityFilter === 'all'
                  ? 'Deploy your monthly surplus into structured financial missions with deterministic feasibility modeling.'
                  : 'Try selecting a different priority filter above to view your active goals.'}
              </p>
              {priorityFilter === 'all' ? (
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowAIModal(true)}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.65rem 1.3rem' }}
                  >
                    <Sliders size={15} /> SIMULATE PLAN
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.65rem 1.3rem' }}
                  >
                    <Plus size={15} /> NEW MISSION
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPriorityFilter('all')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {displayedActiveMissions.map((m) => {
                const prog = calculateMissionProgress(m.currentAmount, m.targetAmount);
                const startDate = m.createdAt ? m.createdAt.split('T')[0] : getLocalDateString();
                const aheadBehind = calculateExpectedProgress(
                  m.targetAmount,
                  m.initialAmount,
                  startDate,
                  m.targetDate || getLocalDateString(),
                  getLocalDateString(),
                  m.currentAmount
                );

                return (
                  <div
                    key={m.id}
                    onClick={() => setInspectMissionId(m.id)}
                    className="ui-card"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                      border: '1px solid var(--border-card)',
                      padding: '1.5rem',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(239, 71, 111, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-card)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Card Header */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="status-pill status-pill-red" style={{ fontSize: '0.65rem' }}>
                            {m.category.toUpperCase().replace('_', ' ')}
                          </span>
                          <span
                            className={`status-pill ${
                              m.priority === 'high'
                                ? 'status-pill-red'
                                : m.priority === 'medium'
                                ? 'status-pill-yellow'
                                : 'status-pill-neutral'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {m.priority.toUpperCase()}
                          </span>
                        </div>

                        <span
                          className={`status-pill ${
                            m.status === 'on_track'
                              ? 'status-pill-green'
                              : m.status === 'tight'
                              ? 'status-pill-yellow'
                              : 'status-pill-red'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {m.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                        {m.name}
                      </h3>

                      {m.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                          {m.description.length > 75 ? `${m.description.substring(0, 75)}...` : m.description}
                        </p>
                      )}

                      {/* Capital Metrics & Progress Bar */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <span className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                            {formatINR(m.currentAmount)}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {' '}/ {formatINR(m.targetAmount)}
                            </span>
                          </span>
                          <span className="mono-figure" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-bright)' }}>
                            {prog}%
                          </span>
                        </div>

                        <div className="progress-bar-track" style={{ height: '7px' }}>
                          <div className="progress-bar-fill" style={{ width: `${prog}%`, background: 'var(--red-primary)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                          <span>Remaining: {formatINR(Math.max(0, m.targetAmount - m.currentAmount))}</span>
                          {aheadBehind && (
                            <span style={{ color: aheadBehind.status === 'ahead' ? 'var(--status-green)' : aheadBehind.status === 'behind' ? 'var(--status-red)' : 'var(--text-secondary)' }}>
                              {aheadBehind.status === 'ahead' && `+${formatINR(aheadBehind.variance)} ahead`}
                              {aheadBehind.status === 'behind' && `-${formatINR(Math.abs(aheadBehind.variance))} behind`}
                              {aheadBehind.status === 'on_schedule' && 'on track'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Telemetry & Quick Action */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          Target: {m.targetDate || 'ASAP'}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-green)' }}>
                          {formatINR(m.monthlyContribution)}/mo
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAdvisorWithContext(
                              { page: 'missions', selectedMission: m },
                              `Explain the feasibility, timeline, and trade-offs for my mission "${m.name}".`
                            );
                          }}
                          className="btn-ghost"
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.35rem 0.6rem',
                            color: 'var(--red-bright)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          title="Ask Advisor about this mission"
                        >
                          <Terminal size={13} /> ADVISOR
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDeployForMission(m.id, e)}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                        >
                          <ArrowUpRight size={14} /> +Deploy
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectMissionId(m.id)}
                          className="btn-ghost"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                        >
                          Inspect <ChevronRight size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SECTION 4: COMPLETED MISSIONS ARCHIVE */}
      {viewTab === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedMissions.length === 0 ? (
            <div className="ui-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                NO COMPLETED OBJECTIVES YET
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem auto 0', maxWidth: '440px' }}>
                Keep deploying planned capital to your active missions. Once a goal reaches 100%, it moves here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {completedMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setInspectMissionId(m.id)}
                  className="ui-card"
                  style={{
                    cursor: 'pointer',
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid rgba(6, 214, 160, 0.3)',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="status-pill status-pill-green">OBJECTIVE ACHIEVED (100%)</span>
                    <CheckCircle2 size={20} style={{ color: 'var(--status-green)' }} />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {m.name}
                  </h3>

                  <div className="mono-figure" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-green)', margin: '0.5rem 0' }}>
                    {formatINR(m.targetAmount)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <span>Category: {m.category.replace('_', ' ')}</span>
                    <span>Achieved: {m.completedAt ? m.completedAt.split('T')[0] : 'Recently'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI MISSION ASSISTANT MODAL */}
      {showAIModal && (
        <AIMissionAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSwitchToManual={() => {
            setShowAIModal(false);
            setShowCreateModal(true);
          }}
          onMissionCreated={(newId) => setInspectMissionId(newId)}
        />
      )}

      {/* CREATE MISSION MODAL */}
      {showCreateModal && (
        <CreateMissionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onMissionCreated={(newId) => setInspectMissionId(newId)}
        />
      )}

      {/* DEPLOY CAPITAL MODAL */}
      {showDeployModal && (
        <DeployCapitalModal
          missionId={selectedMissionIdForDeploy}
          isOpen={showDeployModal}
          onClose={() => {
            setShowDeployModal(false);
            setSelectedMissionIdForDeploy(undefined);
          }}
        />
      )}

      {/* MISSION DETAIL MODAL */}
      {inspectMissionId && (
        <MissionDetailModal
          missionId={inspectMissionId}
          isOpen={!!inspectMissionId}
          onClose={() => setInspectMissionId(null)}
        />
      )}
    </div>
  );
};

export default MissionsView;
