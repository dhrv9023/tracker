// ==========================================================================
// FINANCE OS — PHASE 7: INSIGHTS & MONTHLY REVIEW COMMAND CENTER
// Dual-mode intelligence terminal:
// 1. Real-time Intelligence Feed (prioritized alerts, anomalies, pacing)
// 2. Comprehensive Monthly Financial Review (100-pt health score, MoM deltas, Gemini briefing)
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { FinancialInsight, InsightCategory, InsightSeverity, MonthlyReviewReport, MonthlyReviewAIOutput } from '../../types/finance';
import { generateMonthlyReviewExplanation } from '../../services/geminiMonthlyReviewService';
import { SectionHeader } from '../common/SectionHeader';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  FileText,
  Filter,
  Calendar,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Target,
  Compass,
  X,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const {
    insights,
    dataSufficiency,
    dismissedInsightIds,
    dismissInsight,
    restoreDismissedInsights,
    getMonthlyReviewReport,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    openAdvisorWithContext,
    snapshot,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'review'>('feed');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');

  // Monthly Review AI State
  const [reviewMonth, setReviewMonth] = useState<string>(selectedMonth);
  const [isGeneratingAiReview, setIsGeneratingAiReview] = useState<boolean>(false);
  const [aiReviewOutput, setAiReviewOutput] = useState<MonthlyReviewAIOutput | null>(null);

  // Deterministic Monthly Report
  const currentMonthlyReport = useMemo<MonthlyReviewReport>(() => {
    return getMonthlyReviewReport(reviewMonth);
  }, [getMonthlyReviewReport, reviewMonth]);

  // Filtered Insights for Tab 1
  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      const matchCat =
        selectedCategoryFilter === 'ALL' ||
        (selectedCategoryFilter === 'CRITICAL_WARNING'
          ? ins.severity === 'CRITICAL' || ins.severity === 'WARNING'
          : ins.category === selectedCategoryFilter);

      const matchSev =
        selectedSeverityFilter === 'ALL' || ins.severity === selectedSeverityFilter;

      return matchCat && matchSev;
    });
  }, [insights, selectedCategoryFilter, selectedSeverityFilter]);

  // Counts
  const criticalCount = insights.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = insights.filter((i) => i.severity === 'WARNING').length;
  const watchCount = insights.filter((i) => i.severity === 'WATCH').length;

  const handleRunAiReview = async () => {
    setIsGeneratingAiReview(true);
    try {
      const output = await generateMonthlyReviewExplanation(currentMonthlyReport);
      setAiReviewOutput(output);
    } catch (err) {
      console.error('Error generating AI review:', err);
    } finally {
      setIsGeneratingAiReview(false);
    }
  };

  const handleAskAdvisorAboutInsight = (ins: FinancialInsight) => {
    const prompt = `Can you analyze this financial insight for me: "${ins.title}"? Metric: ${ins.metric || 'N/A'}. ${ins.recommendation} What tactical actions do you recommend?`;
    openAdvisorWithContext({ page: 'advisor' }, prompt);
    setActiveTab('advisor');
  };

  const getSeverityStyle = (sev: InsightSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: '1px solid rgba(230, 57, 70, 0.7)',
          bg: 'rgba(230, 57, 70, 0.07)',
          badgeBg: 'rgba(230, 57, 70, 0.2)',
          badgeColor: '#ff6b6b',
          icon: AlertCircle,
        };
      case 'WARNING':
        return {
          border: '1px solid rgba(245, 158, 11, 0.7)',
          bg: 'rgba(245, 158, 11, 0.07)',
          badgeBg: 'rgba(245, 158, 11, 0.2)',
          badgeColor: '#fbbf24',
          icon: AlertTriangle,
        };
      case 'WATCH':
        return {
          border: '1px solid rgba(56, 189, 248, 0.5)',
          bg: 'rgba(56, 189, 248, 0.05)',
          badgeBg: 'rgba(56, 189, 248, 0.2)',
          badgeColor: '#38bdf8',
          icon: Activity,
        };
      case 'INFO':
      default:
        return {
          border: '1px solid rgba(16, 185, 129, 0.5)',
          bg: 'rgba(16, 185, 129, 0.05)',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeColor: '#34d399',
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* View Header with Section Intel */}
      <SectionHeader
        sectionIndex="05"
        tag="INTELLIGENCE & AUDIT"
        title="Insights & Monthly Review"
        description="Automated financial audit. Detects month-over-month spending shifts, category anomalies, and computes your 100-point Financial Health Score."
        actions={
          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-card)', gap: '0.3rem' }}>
            <button
              onClick={() => setActiveSubTab('feed')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'feed' ? 'var(--red-primary)' : 'transparent',
                color: activeSubTab === 'feed' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Activity size={15} />
              FEED ({insights.length})
            </button>
            <button
              onClick={() => setActiveSubTab('review')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'review' ? 'var(--red-primary)' : 'transparent',
                color: activeSubTab === 'review' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={15} />
              MONTHLY AUDIT
            </button>
          </div>
        }
      />

      {/* Telemetry Sufficiency Status Strip */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              background: dataSufficiency.hasTrendAnalysis
                ? 'rgba(16, 185, 129, 0.15)'
                : dataSufficiency.hasMoMComparison
                ? 'rgba(56, 189, 248, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${
                dataSufficiency.hasTrendAnalysis
                  ? '#10b981'
                  : dataSufficiency.hasMoMComparison
                  ? '#38bdf8'
                  : '#f59e0b'
              }`,
              color: dataSufficiency.hasTrendAnalysis
                ? '#34d399'
                : dataSufficiency.hasMoMComparison
                ? '#38bdf8'
                : '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}
          >
            {dataSufficiency.totalRecordedMonths >= 3
              ? `TELEMETRY: ${dataSufficiency.totalRecordedMonths} MO VERIFIED`
              : dataSufficiency.totalRecordedMonths === 2
              ? 'TELEMETRY: 2 MO RECORDED'
              : dataSufficiency.totalRecordedMonths === 1
              ? 'TELEMETRY: 1 MO BASELINE'
              : 'TELEMETRY: NO DATA'}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {dataSufficiency.explanation}
          </span>
        </div>

        {dismissedInsightIds.length > 0 && (
          <button
            onClick={restoreDismissedInsights}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={12} />
            Restore {dismissedInsightIds.length} Dismissed
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: INTELLIGENCE FEED                                         */}
      {/* ==================================================================== */}
      {activeSubTab === 'feed' && (
        <div>
          {/* KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                ACTIVE INTELLIGENCE
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {insights.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                System-verified analytical detections
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(230, 57, 70, 0.4)', borderRadius: '8px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#ff6b6b', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                CRITICAL VULNERABILITIES
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ff6b6b' }}>
                {criticalCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Immediate cash flow or runway risk
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                WARNINGS & CAPS
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                {warningCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Budget overruns & mission conflicts
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '8px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                WATCHLIST & ANOMALIES
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                {watchCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Spending spikes & trending alerts
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={13} /> FILTER:
            </span>
            {[
              { id: 'ALL', label: `ALL (${insights.length})` },
              { id: 'CRITICAL_WARNING', label: `PRIORITY (${criticalCount + warningCount})` },
              { id: 'CASH_FLOW', label: 'CASH FLOW' },
              { id: 'SPENDING', label: 'SPENDING & ANOMALIES' },
              { id: 'BUDGET', label: 'BUDGETS' },
              { id: 'MISSIONS', label: 'MISSIONS' },
              { id: 'EMERGENCY_FUND', label: 'EMERGENCY' },
              { id: 'DEBT', label: 'DEBT' },
              { id: 'INVESTMENTS', label: 'INVESTMENTS' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategoryFilter(f.id)}
                style={{
                  background: selectedCategoryFilter === f.id ? 'rgba(230, 57, 70, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${selectedCategoryFilter === f.id ? 'var(--red-primary)' : 'var(--border-subtle)'}`,
                  color: selectedCategoryFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: selectedCategoryFilter === f.id ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed List */}
          {filteredInsights.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '3rem 2rem',
                textAlign: 'center',
              }}
            >
              <ShieldCheck size={40} color="#10b981" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                ALL FINANCIAL VECTORS SECURE
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '450px', margin: '0 auto' }}>
                No active threats or alerts detected matching the selected filter. Financial metrics adhere to operational baselines.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredInsights.map((ins) => {
                const style = getSeverityStyle(ins.severity);
                const Icon = style.icon;

                return (
                  <div
                    key={ins.id}
                    style={{
                      background: style.bg,
                      border: style.border,
                      borderRadius: '8px',
                      padding: '1.35rem',
                      position: 'relative',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: style.badgeBg,
                            color: style.badgeColor,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.08em',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Icon size={12} />
                          {ins.severity}
                        </span>
                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.08em',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                          }}
                        >
                          {ins.category}
                        </span>
                        {ins.comparison && (
                          <span
                            style={{
                              background: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            {ins.comparison}
                          </span>
                        )}
                      </div>

                      {/* Metric & Dismiss */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {ins.metric && (
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: style.badgeColor,
                            }}
                          >
                            {ins.metric}
                          </span>
                        )}
                        <button
                          onClick={() => dismissInsight(ins.id)}
                          title="Dismiss Insight"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                      {ins.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                      {ins.summary}
                    </p>

                    {/* Mathematical Evidence */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderLeft: `2px solid ${style.badgeColor}`,
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>EVIDENCE:</span> {ins.evidence}
                    </div>

                    {/* Recommendation */}
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '1.15rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Recommendation: </strong>
                      {ins.recommendation}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      {ins.actionLabel && ins.actionTarget && (
                        <button
                          onClick={() => {
                            if (ins.actionTarget?.tab) {
                              setActiveTab(ins.actionTarget.tab);
                            }
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid var(--border-subtle)',
                            color: '#ffffff',
                            padding: '0.45rem 0.95rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {ins.actionLabel}
                          <ChevronRight size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => handleAskAdvisorAboutInsight(ins)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(230, 57, 70, 0.4)',
                          color: '#ff6b6b',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Cpu size={13} />
                        ASK ADVISOR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: MONTHLY FINANCIAL REVIEW                                  */}
      {/* ==================================================================== */}
      {activeSubTab === 'review' && (
        <div>
          {/* Month Selector Bar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem 1.35rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                AUDIT PERIOD
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {currentMonthlyReport.month}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Month:</span>
              <select
                value={reviewMonth}
                onChange={(e) => setReviewMonth(e.target.value)}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {dataSufficiency.availableMonths.length > 0 ? (
                  dataSufficiency.availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                ) : (
                  <option value={selectedMonth}>{selectedMonth}</option>
                )}
              </select>
            </div>
          </div>

          {/* Single Month Telemetry Notice if previous month is absent */}
          {!currentMonthlyReport.previousMonth && (
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}
            >
              <Info size={16} />
              <span>
                Baseline Telemetry Active: Month-over-month comparisons are safely omitted because only 1 calendar month of records currently exists.
              </span>
            </div>
          )}

          {/* High-Level Executive Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                TOTAL INFLOWS
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                {formatINR(currentMonthlyReport.income)}
              </div>
              {currentMonthlyReport.incomeChange && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', color: currentMonthlyReport.incomeChange.absolute >= 0 ? '#34d399' : '#ff6b6b' }}>
                  {currentMonthlyReport.incomeChange.absolute >= 0 ? '+' : ''}{formatINR(currentMonthlyReport.incomeChange.absolute)} ({currentMonthlyReport.incomeChange.percent >= 0 ? '+' : ''}{currentMonthlyReport.incomeChange.percent}%) vs prev
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                TOTAL OUTFLOWS
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {formatINR(currentMonthlyReport.expenses)}
              </div>
              {currentMonthlyReport.expensesChange && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', color: currentMonthlyReport.expensesChange.absolute > 0 ? '#ff6b6b' : '#34d399' }}>
                  {currentMonthlyReport.expensesChange.absolute >= 0 ? '+' : ''}{formatINR(currentMonthlyReport.expensesChange.absolute)} ({currentMonthlyReport.expensesChange.percent >= 0 ? '+' : ''}{currentMonthlyReport.expensesChange.percent}%) vs prev
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                NET MONTHLY SURPLUS
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: currentMonthlyReport.netCashFlow >= 0 ? 'var(--cyan-glow, #38bdf8)' : '#ff6b6b',
                }}
              >
                {formatINR(currentMonthlyReport.netCashFlow)}
              </div>
              {currentMonthlyReport.netCashFlowChange && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', color: currentMonthlyReport.netCashFlowChange.absolute >= 0 ? '#34d399' : '#ff6b6b' }}>
                  {currentMonthlyReport.netCashFlowChange.absolute >= 0 ? '+' : ''}{formatINR(currentMonthlyReport.netCashFlowChange.absolute)} ({currentMonthlyReport.netCashFlowChange.percent >= 0 ? '+' : ''}{currentMonthlyReport.netCashFlowChange.percent}%) vs prev
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                SAVINGS RATE
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                {currentMonthlyReport.savingsRate}%
              </div>
              {currentMonthlyReport.savingsRateChange && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', color: currentMonthlyReport.savingsRateChange.absolute >= 0 ? '#34d399' : '#ff6b6b' }}>
                  {currentMonthlyReport.savingsRateChange.absolute >= 0 ? '+' : ''}{currentMonthlyReport.savingsRateChange.absolute}% pts vs prev
                </div>
              )}
            </div>
          </div>

          {/* 100-Point Transparent Health Score Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  OBJECTIVE RATING SYSTEM
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0 0' }}>
                  100-Point Financial Health Score
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    background: 'rgba(230, 57, 70, 0.15)',
                    border: '1px solid var(--red-primary)',
                    color: '#ff6b6b',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                  }}
                >
                  TIER: {currentMonthlyReport.healthScore.tier}
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                  {currentMonthlyReport.healthScore.totalScore}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                </span>
              </div>
            </div>

            {/* 5 Pillars Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {currentMonthlyReport.healthScore.factors.map((factor) => (
                <div
                  key={factor.name}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.45rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{factor.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: factor.score >= factor.maxScore * 0.7 ? '#34d399' : '#fbbf24' }}>
                      {factor.score}/{factor.maxScore}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: `${(factor.score / factor.maxScore) * 100}%`,
                        height: '100%',
                        background: factor.score >= factor.maxScore * 0.7 ? '#10b981' : factor.score >= factor.maxScore * 0.4 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {factor.details}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Spending Categories & Discipline Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Top Spending Categories */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} color="var(--red-primary)" />
                Top Spending Drivers ({currentMonthlyReport.month})
              </h3>
              {currentMonthlyReport.topSpendingCategories.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No expense telemetry logged for this period.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {currentMonthlyReport.topSpendingCategories.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{cat.category}</span>
                        <div style={{ display: 'flex', gap: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                          <span>{formatINR(cat.amount)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({cat.percentage}%)</span>
                          {cat.changeVsPrev !== undefined && (
                            <span style={{ color: cat.changeVsPrev > 0 ? '#ff6b6b' : '#34d399' }}>
                              {cat.changeVsPrev >= 0 ? '+' : ''}{formatINR(cat.changeVsPrev)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            height: '100%',
                            background: 'var(--red-primary)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operational Performance Summary */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={16} color="#38bdf8" />
                Operational Execution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    BUDGET CAP DISCIPLINE
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {currentMonthlyReport.budgetPerformance.overbudgetCount === 0
                      ? `All ${currentMonthlyReport.budgetPerformance.underControlCount + currentMonthlyReport.budgetPerformance.approachingCount} categories within defined limits`
                      : `${currentMonthlyReport.budgetPerformance.overbudgetCount} category cap(s) exceeded: ${currentMonthlyReport.budgetPerformance.overbudgetCategories.join(', ')}`}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', borderLeft: '3px solid #34d399' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    SAVINGS MISSIONS EXECUTION
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {currentMonthlyReport.missionProgress.activeCount} active mission(s) ({currentMonthlyReport.missionProgress.onTrackCount} on-track, {currentMonthlyReport.missionProgress.atRiskCount} at-risk).
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    INVESTMENT SURPLUS CAPACITY
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {formatINR(currentMonthlyReport.investmentProgress.monthlyCapacity)}/month verified surplus capacity available for systematic deployment.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI Strategic Review Panel ("The Professor") */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.8) 0%, rgba(10, 11, 13, 0.95) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '1.75rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <FileText size={16} style={{ color: 'var(--status-blue)' }} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    AI-ASSISTED ANALYSIS // EXECUTIVE BRIEFING
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Executive Intelligence Briefing
                </h3>
              </div>

              <button
                onClick={handleRunAiReview}
                disabled={isGeneratingAiReview}
                style={{
                  background: 'var(--red-primary)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  cursor: isGeneratingAiReview ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 15px rgba(230, 57, 70, 0.4)',
                }}
              >
                {isGeneratingAiReview ? (
                  <>
                    <RefreshCw size={14} className="spin-animation" />
                    ANALYZING TELEMETRY...
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    GENERATE EXECUTIVE BRIEFING
                  </>
                )}
              </button>
            </div>

            {aiReviewOutput ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Strategic Headline */}
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderLeft: '4px solid #38bdf8',
                    padding: '0.85rem 1.15rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: '#38bdf8',
                    letterSpacing: '0.05em',
                  }}
                >
                  {aiReviewOutput.headline}
                </div>

                {/* Executive Summary */}
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                  {aiReviewOutput.executiveSummary}
                </p>

                {/* 2-Column Strengths & Vulnerabilities */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 800, marginBottom: '0.35rem' }}>
                      [ TOP DEMONSTRATED STRENGTH ]
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiReviewOutput.topStrength}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(230, 57, 70, 0.06)',
                      border: '1px solid rgba(230, 57, 70, 0.3)',
                      borderRadius: '6px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#ff6b6b', fontWeight: 800, marginBottom: '0.35rem' }}>
                      [ PRIMARY VULNERABILITY ]
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiReviewOutput.primaryVulnerability}
                    </div>
                  </div>
                </div>

                {/* Strategic Next Steps */}
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    STRATEGIC DIRECTIVES // ACTION PLAN
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {aiReviewOutput.strategicNextSteps.map((step, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coach Advice Quote Box */}
                <div
                  style={{
                    borderLeft: '3px solid #fbbf24',
                    background: 'rgba(245, 158, 11, 0.05)',
                    padding: '0.85rem 1.15rem',
                    fontStyle: 'italic',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    borderRadius: '0 6px 6px 0',
                  }}
                >
                  <strong style={{ color: '#fbbf24', fontStyle: 'normal' }}>The Professor’s Guidance: </strong>
                  "{aiReviewOutput.coachAdvice}"
                </div>

                {/* Discuss with Advisor Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const prompt = `Review my ${reviewMonth} performance. The executive review highlighted: "${aiReviewOutput.headline}". What tactical steps should we prioritize right now?`;
                      openAdvisorWithContext({ page: 'advisor' }, prompt);
                      setActiveTab('advisor');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--cyan-glow, #38bdf8)',
                      color: 'var(--cyan-glow, #38bdf8)',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Cpu size={14} />
                    DISCUSS IN ADVISOR TERMINAL
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '0.88rem', margin: '0 0 1rem' }}>
                  Click above to run an AI-powered strategic interpretation of your {reviewMonth} financial data.
                </p>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  [ Zero invented metrics // 100% deterministic grounding ]
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
