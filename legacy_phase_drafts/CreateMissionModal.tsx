import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/finance';
import { Target, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';
import { askAdvisor, buildFinancialContext } from '../../services/gemini';

interface CreateMissionModalProps {
  onClose: () => void;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({ onClose }) => {
  const { addMission, monthlySurplus, profile, missions, savingsRate, investmentRate } = useFinance();

  // Wizard Step: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Goal name / category
  const [goalType, setGoalType] = useState<string>('Laptop');
  const [customGoalName, setCustomGoalName] = useState<string>('');

  // Step 2: Target amount
  const [targetAmount, setTargetAmount] = useState<string>('120000');

  // Step 3: Timeline (3 months, 6 months, 12 months, custom date)
  const [timelineChoice, setTimelineChoice] = useState<'3' | '6' | '12' | 'custom'>('10' as any);
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 10);
    return d.toISOString().split('T')[0];
  });

  // Step 4: Already saved
  const [alreadySaved, setAlreadySaved] = useState<string>('20000');

  // Step 5: Monthly contribution mode
  const [contributionMode, setContributionMode] = useState<'ai' | 'self'>('ai');
  const [selfContribution, setSelfContribution] = useState<string>('');

  // Gemini narrative explanation state
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Deterministic math
  const goalName = goalType === 'Custom' ? (customGoalName.trim() || 'Custom Goal') : goalType;
  const targetNum = Number(targetAmount) || 0;
  const currentSavedNum = Number(alreadySaved) || 0;
  const remainingToSave = Math.max(0, targetNum - currentSavedNum);

  // Derive months
  let months = 10;
  if (timelineChoice === '3') months = 3;
  else if (timelineChoice === '6') months = 6;
  else if (timelineChoice === '12') months = 12;
  else {
    const targetD = new Date(customDate);
    const now = new Date();
    const diff = (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth());
    months = Math.max(1, diff);
  }

  const calculatedMonthly = Math.ceil(remainingToSave / Math.max(1, months));
  const effectiveMonthly = contributionMode === 'self' && Number(selfContribution) > 0 ? Number(selfContribution) : calculatedMonthly;

  // Feasibility status
  const isTight = effectiveMonthly > monthlySurplus * 0.75 && effectiveMonthly <= monthlySurplus;
  const isNotFeasible = effectiveMonthly > monthlySurplus;
  const feasibility = isNotFeasible ? 'NOT FEASIBLE' : isTight ? 'TIGHT' : 'ON TRACK';

  // Calculate target ISO date string
  const computedTargetDate = (() => {
    if (timelineChoice === 'custom') return customDate;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  })();

  // Generate Gemini explanation when arriving at Step 5
  const fetchAiRecommendation = async () => {
    setIsLoadingAi(true);
    const ctx = buildFinancialContext(profile, missions, monthlySurplus, savingsRate, investmentRate);
    const query = `
I am planning a savings mission for "${goalName}".
- Target Amount: ₹${targetNum}
- Already Saved: ₹${currentSavedNum}
- Remaining Amount: ₹${remainingToSave}
- Timeline Horizon: ${months} months (Target Date: ${computedTargetDate})
- Required Monthly Contribution: ₹${effectiveMonthly}/month
- My Available Monthly Capital: ₹${monthlySurplus}

In 2 short sentences, explain whether this goal is realistic, what percentage of my monthly available capital it consumes, and what remains for other priorities. If tight or not feasible, state 1 concrete alternative (e.g. extend deadline by X months, reduce target).
`;
    try {
      const response = await askAdvisor(query, ctx, []);
      setAiExplanation(response);
    } catch {
      setAiExplanation(
        `A ${formatINR(effectiveMonthly)} monthly contribution requires approximately ${
          monthlySurplus > 0 ? Math.round((effectiveMonthly / monthlySurplus) * 100) : 100
        }% of your available capital (${formatINR(monthlySurplus)}), leaving ${formatINR(
          Math.max(0, monthlySurplus - effectiveMonthly)
        )} for other priorities.`
      );
    }
    setIsLoadingAi(false);
  };

  const handleNext = () => {
    if (currentStep === 4) {
      fetchAiRecommendation();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleCreateMission = () => {
    addMission({
      name: goalName.toUpperCase(),
      description: `${months} month savings target`,
      targetAmount: targetNum,
      currentAmount: currentSavedNum,
      currency: 'INR',
      targetDate: computedTargetDate,
      monthlyContribution: effectiveMonthly,
      priority: 'high',
      status: 'active',
      category: goalType,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="status-pill status-pill-red" style={{ fontSize: '0.65rem' }}>
              SAVINGS MISSION WIZARD // STEP {currentStep} OF 5
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {currentStep === 1 && 'Step 1: What are you saving for?'}
              {currentStep === 2 && 'Step 2: How much do you need?'}
              {currentStep === 3 && 'Step 3: When do you want it?'}
              {currentStep === 4 && 'Step 4: How much have you already saved?'}
              {currentStep === 5 && 'Step 5: Monthly Contribution & Feasibility'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost">✕</button>
        </div>

        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div>
              <label className="ui-label">Select Goal Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {['Emergency Fund', 'Laptop', 'Car', 'Vacation', 'Education', 'Custom'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoalType(item)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: goalType === item ? 'var(--red-badge-bg)' : 'var(--bg-input)',
                      border: `1px solid ${goalType === item ? 'var(--red-primary)' : 'var(--border-card)'}`,
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{item}</span>
                    {goalType === item && <CheckCircle2 size={16} style={{ color: 'var(--red-bright)' }} />}
                  </button>
                ))}
              </div>

              {goalType === 'Custom' && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="ui-label">Custom Goal Name</label>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="e.g. Sony Camera, Wedding, Downpayment"
                    value={customGoalName}
                    onChange={(e) => setCustomGoalName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div>
              <label className="ui-label">Target Amount Required (₹)</label>
              <input
                type="number"
                className="ui-input font-mono"
                style={{ fontSize: '1.4rem', fontWeight: 800 }}
                placeholder="e.g. 120000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                autoFocus
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                Target: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(targetNum)}</strong>
              </span>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div>
              <label className="ui-label">Desired Time Horizon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[
                  { key: '3' as const, label: '3 Months (Sprint)' },
                  { key: '6' as const, label: '6 Months (Target)' },
                  { key: '12' as const, label: '12 Months (Paced)' },
                  { key: 'custom' as const, label: 'Custom Timeline' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTimelineChoice(item.key)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      background: timelineChoice === item.key ? 'var(--red-badge-bg)' : 'var(--bg-input)',
                      border: `1px solid ${timelineChoice === item.key ? 'var(--red-primary)' : 'var(--border-card)'}`,
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {timelineChoice === 'custom' && (
                <div style={{ marginTop: '1rem' }}>
                  <label className="ui-label">Target Completion Date</label>
                  <input
                    type="date"
                    className="ui-input font-mono"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Calculated Horizon: {months} months
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <label className="ui-label">How much have you already saved? (₹)</label>
              <input
                type="number"
                className="ui-input font-mono"
                style={{ fontSize: '1.4rem', fontWeight: 800 }}
                placeholder="e.g. 20000 (enter 0 if starting fresh)"
                value={alreadySaved}
                onChange={(e) => setAlreadySaved(e.target.value)}
                autoFocus
              />
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Remaining gap to fund: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(remainingToSave)}</strong>
              </div>
            </div>
          )}

          {/* STEP 5: RECOMMENDATION ENGINE & FEASIBILITY */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="ui-label">Monthly Contribution Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setContributionMode('ai')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: contributionMode === 'ai' ? 'var(--red-badge-bg)' : 'var(--bg-input)',
                      border: `1px solid ${contributionMode === 'ai' ? 'var(--red-primary)' : 'var(--border-card)'}`,
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    ○ Let App / AI Calculate
                    <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontWeight: 400 }}>
                      Recommended: {formatINR(calculatedMonthly)}/mo
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContributionMode('self')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: contributionMode === 'self' ? 'var(--red-badge-bg)' : 'var(--bg-input)',
                      border: `1px solid ${contributionMode === 'self' ? 'var(--red-primary)' : 'var(--border-card)'}`,
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    ○ I'll enter it myself
                    <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontWeight: 400 }}>
                      Custom monthly tranche
                    </span>
                  </button>
                </div>
              </div>

              {contributionMode === 'self' && (
                <div>
                  <label className="ui-label">Custom Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    className="ui-input font-mono"
                    placeholder={`e.g. ${calculatedMonthly}`}
                    value={selfContribution}
                    onChange={(e) => setSelfContribution(e.target.value)}
                  />
                </div>
              )}

              {/* DETERMINISTIC FEASIBILITY BOX */}
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
                  <span className="ui-label" style={{ marginBottom: 0 }}>GOAL FEASIBILITY</span>
                  <span
                    className={`status-pill ${
                      feasibility === 'ON TRACK'
                        ? 'status-pill-green'
                        : feasibility === 'TIGHT'
                        ? 'status-pill-yellow'
                        : 'status-pill-red'
                    }`}
                  >
                    {feasibility === 'ON TRACK' ? '🟢 ON TRACK' : feasibility === 'TIGHT' ? '🟡 TIGHT' : '🔴 NOT FEASIBLE'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Required:</span>
                    <div className="mono-figure" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      {formatINR(effectiveMonthly)}/month
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Available Capital:</span>
                    <div className="mono-figure" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--status-green)' }}>
                      {formatINR(monthlySurplus)}/month
                    </div>
                  </div>
                </div>

                {/* Possible Solutions if Tight or Not Feasible */}
                {(isTight || isNotFeasible) && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--status-yellow)',
                    }}
                  >
                    <strong>Possible Solutions:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <li>Extend deadline by {Math.ceil(months * 0.5)} months to reduce monthly pressure.</li>
                      <li>OR Increase monthly contribution by trimming lifestyle spending.</li>
                      <li>OR Reduce target amount by {formatINR(Math.round(targetNum * 0.2))}.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Gemini Narrative Explanation */}
              <div
                style={{
                  background: 'rgba(229, 9, 20, 0.06)',
                  border: '1px solid rgba(229, 9, 20, 0.25)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Terminal size={14} style={{ color: 'var(--red-bright)' }} />
                  <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red-bright)' }}>
                    CALCULATED ANALYSIS
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#ffffff', lineHeight: 1.5 }}>
                  {isLoadingAi ? 'Evaluating cash flow impact...' : aiExplanation}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="btn-secondary"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 2 && (!targetAmount || Number(targetAmount) <= 0)}
                className="btn-primary"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateMission}
                className="btn-primary"
              >
                AUTHORIZE MISSION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
