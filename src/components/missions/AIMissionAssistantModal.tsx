// ==========================================================================
// FINANCE OS — PHASE 4 AI MISSION ASSISTANT MODAL
// Conversational Savings Mission Planning powered by Gemini.
// The deterministic calculation engine remains authoritative for numbers.
// ==========================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatINR,
  calculateRemainingGoalAmount,
  calculateRequiredMonthlyContribution,
  calculateMissionFeasibility,
  calculateProjectedCompletionDate,
  calculateEmergencyFundTarget,
} from '../../utils/finance';
import {
  sendSavingsGoalPrompt,
  explainMissionCalculations,
  ChatMessage,
  ExtractedMissionPlan,
  CompactFinancialContext,
} from '../../services/geminiService';
import { getActiveGeminiApiKey, setStoredGeminiApiKey, DEFAULT_GEMINI_MODEL } from '../../services/geminiConfig';
import {
  X,
  Send,
  Sliders,
  Terminal,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Key,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface AIMissionAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToManual: () => void;
  onMissionCreated?: (missionId: string) => void;
  prefillPrompt?: string;
}

export const AIMissionAssistantModal: React.FC<AIMissionAssistantModalProps> = ({
  isOpen,
  onClose,
  onSwitchToManual,
  onMissionCreated,
  prefillPrompt,
}) => {
  const { profile, snapshot, activeMissions, createMission, remainingFlexibleSurplus } = useFinance();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<ExtractedMissionPlan | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!getActiveGeminiApiKey());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Build compact financial context
  const financialContext: CompactFinancialContext = {
    currency: profile.user.currency || 'INR',
    monthly_income: snapshot.totalIncome,
    monthly_expenses: snapshot.totalExpenses,
    monthly_surplus: snapshot.monthlySurplus,
    current_savings: profile.position.currentSavings,
    emergency_fund: profile.position.emergencyFund,
    active_missions_count: activeMissions.length,
    active_missions_summary: activeMissions.map((m) => ({
      name: m.name,
      target_amount: m.targetAmount,
      current_amount: m.currentAmount,
      monthly_contribution: m.monthlyContribution,
      target_date: m.targetDate || 'ASAP',
      priority: m.priority,
    })),
  };

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setHasApiKey(!!getActiveGeminiApiKey());
      const initialGreeting: ChatMessage = {
        id: 'msg-welcome',
        sender: 'assistant',
        content: `Operative, I am your Mission Intelligence Advisor. Tell me what goal you're targeting (e.g. *"I want a ₹1.2 lakh laptop in 8 months with ₹20,000 saved"* or *"Help me build an emergency fund"*), and I'll structure a deterministic plan against your monthly surplus of **${formatINR(snapshot.monthlySurplus)}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);

      if (prefillPrompt) {
        handleSendMessage(prefillPrompt);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setStoredGeminiApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      setErrorMessage(null);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isTyping) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsTyping(true);

    try {
      // Build conversation history for API
      const conversationHistory = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          parts: m.content,
        }));

      const response = await sendSavingsGoalPrompt({
        userMessage: textToSend.trim(),
        conversationHistory,
        context: financialContext,
        currentDraftMission: activePlan || undefined,
      });

      // If Gemini extracted or completed a mission plan
      if (response.mission && response.mission.target_amount && response.mission.target_amount > 0) {
        const extracted: ExtractedMissionPlan = {
          name: response.mission.name || activePlan?.name || 'Tactical Objective',
          category: response.mission.category || activePlan?.category || 'gadget',
          targetAmount: response.mission.target_amount,
          currentAmount: response.mission.current_amount || 0,
          targetDate: response.mission.target_date || activePlan?.targetDate || '',
          isAsap: response.mission.is_asap || false,
          priority: response.mission.priority || 'high',
          preferredMonthlyContribution: response.mission.preferred_monthly_contribution,
        };
        setActivePlan(extracted);

        // Deterministic engine calculation
        const remaining = calculateRemainingGoalAmount(extracted.targetAmount, extracted.currentAmount);
        const requiredMonthly = calculateRequiredMonthlyContribution(remaining, extracted.targetDate);
        const feasibility = calculateMissionFeasibility({
          targetAmount: extracted.targetAmount,
          currentAmount: extracted.currentAmount,
          targetDate: extracted.targetDate,
          isAsap: extracted.isAsap,
          availableSurplus: snapshot.monthlySurplus,
          userSelectedContribution: extracted.preferredMonthlyContribution || requiredMonthly,
        });

        // Let Gemini provide conversational summary grounded in deterministic figures
        let detailedExplanation = response.summary;
        if (response.status === 'plan_ready') {
          detailedExplanation = await explainMissionCalculations({
            missionName: extracted.name,
            targetAmount: extracted.targetAmount,
            currentAmount: extracted.currentAmount,
            targetDate: extracted.targetDate,
            authoritativeCalculations: {
              requiredMonthly,
              availableSurplus: snapshot.monthlySurplus,
              surplusBuffer: Math.max(0, snapshot.monthlySurplus - requiredMonthly),
              feasibility: feasibility.status,
              projectedDate: feasibility.projectedCompletionDate,
              scenarios: [],
            },
            context: financialContext,
          });
        }

        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          content: response.status === 'plan_ready' ? detailedExplanation : response.next_question || response.summary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          planPreview: extracted,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // More questions or clarification needed
        const replyContent = response.next_question || response.summary || 'Understood. Could you specify your target amount and deadline?';
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      const errMsg = err?.message || 'Failed to communicate with Gemini.';
      setErrorMessage(errMsg);
      const errorMsg: ChatMessage = {
        id: `ast-err-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ Tactical intelligence offline: ${errMsg}. You can configure your API key below or switch to manual mission creation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmMission = () => {
    if (!activePlan) return;

    const remaining = calculateRemainingGoalAmount(activePlan.targetAmount, activePlan.currentAmount);
    const required = calculateRequiredMonthlyContribution(remaining, activePlan.targetDate);
    const monthly = activePlan.preferredMonthlyContribution || required;

    const newMission = createMission({
      name: activePlan.name,
      category: activePlan.category,
      priority: activePlan.priority,
      targetAmount: activePlan.targetAmount,
      initialAmount: activePlan.currentAmount,
      targetDate: activePlan.targetDate,
      isAsap: activePlan.isAsap,
      monthlyContribution: monthly,
      description: 'Structured via Gemini Mission Intelligence.',
    });

    onMissionCreated?.(newMission.id);
    onClose();
  };

  const quickPrompts = [
    'I want a ₹1.2 lakh laptop in 8 months, have 20k saved',
    'Help me build an emergency fund',
    'Can I afford a ₹60,000 vacation next summer?',
    'How can I reach my goals faster?',
    'Which goal should I prioritize?',
  ];

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
          maxWidth: '780px',
          height: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 71, 111, 0.15)',
                border: '1px solid rgba(239, 71, 111, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-bright)',
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-pill status-pill-red">MISSION INTELLIGENCE</span>
                <span className="status-pill status-pill-neutral" style={{ fontSize: '0.65rem' }}>
                  {DEFAULT_GEMINI_MODEL}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem', color: '#ffffff' }}>
                Tactical Planning Assistant
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
              title="Privacy & Context Details"
            >
              <HelpCircle size={16} /> Privacy
            </button>
            <button
              type="button"
              onClick={onSwitchToManual}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              Manual Mode
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

        {/* Privacy Info Dropdown Banner */}
        {showPrivacyInfo && (
          <div
            style={{
              padding: '0.75rem 1.75rem',
              background: 'rgba(0, 0, 0, 0.35)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            🛡️ <strong>Privacy Protection:</strong> Only compact monthly totals (Income, Expenses, Surplus: {formatINR(snapshot.monthlySurplus)}) are sent to Gemini to interpret goal feasibility. No personal passwords, credit card numbers, or full transaction logs are ever shared.
          </div>
        )}

        {/* Missing API Key Warning Banner */}
        {!hasApiKey && (
          <div
            style={{
              padding: '0.85rem 1.75rem',
              background: 'rgba(255, 209, 102, 0.1)',
              borderBottom: '1px solid rgba(255, 209, 102, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} style={{ color: 'var(--status-yellow)' }} />
              <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>
                Gemini API Key missing. Enter key or use manual mode.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="ui-input font-mono"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', width: '160px' }}
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Chat History Arena */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem 1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'var(--bg-app)',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {msg.sender === 'user' ? (
                  <>
                    <span>OPERATIVE</span>
                    <User size={12} />
                  </>
                ) : (
                  <>
                    <Terminal size={12} style={{ color: 'var(--red-bright)' }} />
                    <span style={{ color: 'var(--red-bright)', fontWeight: 700 }}>TACTICAL PLANNER</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                style={{
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'rgba(239, 71, 111, 0.15)' : 'var(--bg-card-elevated)',
                  border: msg.sender === 'user' ? '1px solid rgba(239, 71, 111, 0.35)' : '1px solid var(--border-subtle)',
                  padding: '0.9rem 1.15rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>

              {/* In-Chat Mission Blueprint Card Preview */}
              {msg.planPreview && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(239, 71, 111, 0.4)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginTop: '0.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {/* Card Telemetry */}
                  {(() => {
                    const plan = msg.planPreview;
                    const remaining = calculateRemainingGoalAmount(plan.targetAmount, plan.currentAmount);
                    const requiredMonthly = calculateRequiredMonthlyContribution(remaining, plan.targetDate);
                    const feasibility = calculateMissionFeasibility({
                      targetAmount: plan.targetAmount,
                      currentAmount: plan.currentAmount,
                      targetDate: plan.targetDate,
                      isAsap: plan.isAsap,
                      availableSurplus: snapshot.monthlySurplus,
                      userSelectedContribution: plan.preferredMonthlyContribution || requiredMonthly,
                    });

                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="status-pill status-pill-red">DETERMINISTIC BLUEPRINT</span>
                          <span
                            className={`status-pill ${
                              feasibility.status === 'on_track'
                                ? 'status-pill-green'
                                : feasibility.status === 'tight'
                                ? 'status-pill-yellow'
                                : 'status-pill-red'
                            }`}
                          >
                            {feasibility.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                          {plan.name}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                          <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target Capital</span>
                            <div className="font-mono" style={{ fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                              {formatINR(plan.targetAmount)}
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Current Reserves</span>
                            <div className="font-mono" style={{ fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                              {formatINR(plan.currentAmount)}
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Required Monthly</span>
                            <div className="font-mono" style={{ fontWeight: 800, color: 'var(--status-green)', marginTop: '0.2rem' }}>
                              {formatINR(requiredMonthly)}/mo
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-app)', padding: '0.6rem', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target Deadline</span>
                            <div className="font-mono" style={{ fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                              {plan.targetDate || 'ASAP (Organic)'}
                            </div>
                          </div>
                        </div>

                        {/* Surplus safeguard note */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          Surplus impact: leaves <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(Math.max(0, snapshot.monthlySurplus - requiredMonthly))}</strong> flexible reserve buffer.
                        </div>

                        {/* Approval CTA */}
                        <button
                          type="button"
                          onClick={handleConfirmMission}
                          className="btn-primary"
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            padding: '0.65rem 1rem',
                          }}
                        >
                          <Target size={16} />
                          [ INITIALIZE MISSION ]
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {/* Live Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <span className="pulsing-dot" />
              <span>Analyzing scenario against your cash flow...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div
          style={{
            padding: '0.6rem 1.75rem',
            background: 'var(--bg-card-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={isTyping || !hasApiKey}
              className="btn-ghost"
              style={{
                fontSize: '0.725rem',
                padding: '0.35rem 0.75rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card-elevated)',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            placeholder={hasApiKey ? "Describe your goal (e.g. 'I want to save ₹80,000 for a trip by Diwali')..." : "Enter API key above to chat..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping || !hasApiKey}
            className="ui-input"
            style={{ flex: 1, fontSize: '0.9rem' }}
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputMessage.trim() || !hasApiKey}
            className="btn-primary"
            style={{
              padding: '0 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: isTyping || !inputMessage.trim() || !hasApiKey ? 0.6 : 1,
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
