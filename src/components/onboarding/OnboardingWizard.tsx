// ==========================================================================
// FINANCE OS — PHASE 1 ONBOARDING WIZARD
// Multi-step financial baseline initialization with validation & summary.
// ==========================================================================

import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  FinancialProfile,
  CurrencyCode,
  RiskPreference,
} from '../../types/finance';
import {
  formatINR,
  calculateTotalIncome,
  calculateFixedExpenses,
  calculateVariableExpenses,
  calculateTotalExpenses,
  calculateMonthlySurplus,
  calculateSavingsRate,
} from '../../utils/finance';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Terminal,
  AlertTriangle,
  X,
} from 'lucide-react';

const PRIORITY_OPTIONS = [
  'Emergency fund',
  'Short-term purchases',
  'Travel',
  'Education',
  'Vehicle',
  'Home',
  'Retirement',
  'Long-term wealth creation',
];

export const OnboardingWizard: React.FC = () => {
  const { profile, saveFinancialProfile, setShowOnboardingModal } = useFinance();

  // Step indicator: 'entry' -> 'profile' -> 'income' -> 'expenses' -> 'position' -> 'priorities' -> 'risk' -> 'summary'
  const [currentStep, setCurrentStep] = useState<
    'entry' | 'profile' | 'income' | 'expenses' | 'position' | 'priorities' | 'risk' | 'summary'
  >(profile.hasCompletedOnboarding ? 'profile' : 'entry');

  // Form State
  const [name, setName] = useState(profile.user.name || '');
  const [age, setAge] = useState<string>(profile.user.age ? String(profile.user.age) : '28');
  const [country, setCountry] = useState(profile.user.country || 'India');
  const [currency, setCurrency] = useState<CurrencyCode>(profile.user.currency || 'INR');

  // Income
  const [salary, setSalary] = useState<string>(profile.income.monthlySalary ? String(profile.income.monthlySalary) : '');
  const [otherIncome, setOtherIncome] = useState<string>(profile.income.otherIncome ? String(profile.income.otherIncome) : '');

  // Fixed Expenses
  const [rent, setRent] = useState<string>(profile.expenses.fixed.rent ? String(profile.expenses.fixed.rent) : '');
  const [utilities, setUtilities] = useState<string>(profile.expenses.fixed.utilities ? String(profile.expenses.fixed.utilities) : '');
  const [internet, setInternet] = useState<string>(profile.expenses.fixed.internet ? String(profile.expenses.fixed.internet) : '');
  const [phone, setPhone] = useState<string>(profile.expenses.fixed.phone ? String(profile.expenses.fixed.phone) : '');
  const [insurance, setInsurance] = useState<string>(profile.expenses.fixed.insurance ? String(profile.expenses.fixed.insurance) : '');
  const [emi, setEmi] = useState<string>(profile.expenses.fixed.emi ? String(profile.expenses.fixed.emi) : '');
  const [subscriptions, setSubscriptions] = useState<string>(profile.expenses.fixed.subscriptions ? String(profile.expenses.fixed.subscriptions) : '');
  const [transportation, setTransportation] = useState<string>(profile.expenses.fixed.transportation ? String(profile.expenses.fixed.transportation) : '');
  const [education, setEducation] = useState<string>(profile.expenses.fixed.education ? String(profile.expenses.fixed.education) : '');
  const [otherFixed, setOtherFixed] = useState<string>(profile.expenses.fixed.other ? String(profile.expenses.fixed.other) : '');

  // Variable Expenses
  const [food, setFood] = useState<string>(profile.expenses.variable.food ? String(profile.expenses.variable.food) : '');
  const [shopping, setShopping] = useState<string>(profile.expenses.variable.shopping ? String(profile.expenses.variable.shopping) : '');
  const [entertainment, setEntertainment] = useState<string>(profile.expenses.variable.entertainment ? String(profile.expenses.variable.entertainment) : '');
  const [travel, setTravel] = useState<string>(profile.expenses.variable.travel ? String(profile.expenses.variable.travel) : '');
  const [miscellaneous, setMiscellaneous] = useState<string>(profile.expenses.variable.miscellaneous ? String(profile.expenses.variable.miscellaneous) : '');

  // Existing Position
  const [currentSavings, setCurrentSavings] = useState<string>(profile.position.currentSavings ? String(profile.position.currentSavings) : '');
  const [emergencyFund, setEmergencyFund] = useState<string>(profile.position.emergencyFund ? String(profile.position.emergencyFund) : '');
  const [existingInvestments, setExistingInvestments] = useState<string>(profile.position.existingInvestments ? String(profile.position.existingInvestments) : '');
  const [outstandingLoans, setOutstandingLoans] = useState<string>(profile.position.debt.outstandingLoans ? String(profile.position.debt.outstandingLoans) : '');
  const [creditCardDebt, setCreditCardDebt] = useState<string>(profile.position.debt.creditCardDebt ? String(profile.position.debt.creditCardDebt) : '');

  // Priorities & Risk
  const [priorities, setPriorities] = useState<string[]>(profile.priorities.length > 0 ? profile.priorities : ['Emergency fund']);
  const [customPriority, setCustomPriority] = useState<string>('');
  const [riskPreference, setRiskPreference] = useState<RiskPreference>(profile.riskPreference || 'moderate');

  // Error / validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper calculation values
  const totalIncomeVal = calculateTotalIncome({
    monthlySalary: Number(salary) || 0,
    otherIncome: Number(otherIncome) || 0,
  });

  const fixedExpensesObj = {
    rent: Number(rent) || 0,
    utilities: Number(utilities) || 0,
    internet: Number(internet) || 0,
    phone: Number(phone) || 0,
    insurance: Number(insurance) || 0,
    emi: Number(emi) || 0,
    subscriptions: Number(subscriptions) || 0,
    transportation: Number(transportation) || 0,
    education: Number(education) || 0,
    other: Number(otherFixed) || 0,
  };

  const variableExpensesObj = {
    food: Number(food) || 0,
    shopping: Number(shopping) || 0,
    entertainment: Number(entertainment) || 0,
    travel: Number(travel) || 0,
    miscellaneous: Number(miscellaneous) || 0,
  };

  const totalExpensesVal = calculateTotalExpenses({
    fixed: fixedExpensesObj,
    variable: variableExpensesObj,
  });

  const surplusVal = calculateMonthlySurplus(totalIncomeVal, totalExpensesVal);
  const isDeficit = surplusVal < 0;
  const savingsRateVal = calculateSavingsRate(Math.max(0, surplusVal), totalIncomeVal);

  const totalDebtVal = (Number(outstandingLoans) || 0) + (Number(creditCardDebt) || 0);

  // Toggle priority selection
  const handleTogglePriority = (item: string) => {
    setPriorities((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleAddCustomPriority = () => {
    if (customPriority.trim() && !priorities.includes(customPriority.trim())) {
      setPriorities((prev) => [...prev, customPriority.trim()]);
      setCustomPriority('');
    }
  };

  // Step Progression with validation
  const handleNextFromProfile = () => {
    setValidationError(null);
    const parsedAge = Number(age);
    if (!name.trim()) {
      setValidationError('Please enter your name or call-sign.');
      return;
    }
    if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 110) {
      setValidationError('Please enter a valid age between 16 and 110.');
      return;
    }
    setCurrentStep('income');
  };

  const handleNextFromIncome = () => {
    setValidationError(null);
    const parsedSalary = Number(salary);
    const parsedOther = Number(otherIncome);
    if (parsedSalary < 0 || parsedOther < 0) {
      setValidationError('Income values cannot be negative.');
      return;
    }
    if (totalIncomeVal <= 0) {
      setValidationError('Please enter your monthly salary or income.');
      return;
    }
    setCurrentStep('expenses');
  };

  const handleNextFromExpenses = () => {
    setValidationError(null);
    // Ensure no negative values
    const allExpenses = [...Object.values(fixedExpensesObj), ...Object.values(variableExpensesObj)];
    if (allExpenses.some((v) => v < 0)) {
      setValidationError('Expense values cannot be negative.');
      return;
    }
    setCurrentStep('position');
  };

  const handleNextFromPosition = () => {
    setValidationError(null);
    if (
      Number(currentSavings) < 0 ||
      Number(emergencyFund) < 0 ||
      Number(existingInvestments) < 0 ||
      Number(outstandingLoans) < 0 ||
      Number(creditCardDebt) < 0
    ) {
      setValidationError('Position and liability values cannot be negative.');
      return;
    }
    setCurrentStep('priorities');
  };

  const handleNextFromPriorities = () => {
    setValidationError(null);
    if (priorities.length === 0) {
      setValidationError('Please select at least one financial priority.');
      return;
    }
    setCurrentStep('risk');
  };

  const handleNextFromRisk = () => {
    setValidationError(null);
    setCurrentStep('summary');
  };

  const handleFinalConfirm = () => {
    const finalProfile: FinancialProfile = {
      user: {
        name: name.trim() || 'Operative',
        age: Number(age) || 28,
        country: country.trim() || 'India',
        currency,
      },
      income: {
        monthlySalary: Number(salary) || 0,
        otherIncome: Number(otherIncome) || 0,
      },
      expenses: {
        fixed: fixedExpensesObj,
        variable: variableExpensesObj,
      },
      position: {
        currentSavings: Number(currentSavings) || 0,
        emergencyFund: Number(emergencyFund) || 0,
        existingInvestments: Number(existingInvestments) || 0,
        debt: {
          outstandingLoans: Number(outstandingLoans) || 0,
          creditCardDebt: Number(creditCardDebt) || 0,
        },
      },
      priorities,
      riskPreference,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    saveFinancialProfile(finalProfile);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 120 }}>
      {/* STEP 7: ENTRY SCREEN */}
      {currentStep === 'entry' && (
        <div
          className="modal-content"
          style={{
            maxWidth: '520px',
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'linear-gradient(180deg, #161a26 0%, #0d0f17 100%)',
            border: '1px solid rgba(229, 9, 20, 0.4)',
            boxShadow: '0 0 50px rgba(229, 9, 20, 0.25)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="pulsing-dot" />
            <span className="status-pill status-pill-red" style={{ letterSpacing: '0.12em' }}>
              SYSTEM READY
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              lineHeight: 1.25,
              textTransform: 'uppercase',
              color: '#ffffff',
              marginBottom: '0.5rem',
            }}
          >
            FINANCIAL<br />COMMAND CENTER
          </h1>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem' }}>
            SYSTEM INITIALIZATION
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '380px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            "Let's establish your financial baseline."
          </p>

          <button
            type="button"
            onClick={() => setCurrentStep('profile')}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '320px', padding: '0.9rem', fontSize: '0.95rem' }}
          >
            INITIALIZE PROFILE
          </button>
        </div>
      )}

      {/* STEP 8: MULTI-STEP WIZARD & SUMMARY */}
      {currentStep !== 'entry' && (
        <div className="modal-content" style={{ maxWidth: '640px' }}>
          {/* Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="status-pill status-pill-red" style={{ fontSize: '0.65rem' }}>
                ONBOARDING //{' '}
                {currentStep === 'profile' && 'STEP A: BASIC PROFILE'}
                {currentStep === 'income' && 'STEP B: INCOME'}
                {currentStep === 'expenses' && 'STEP C: EXPENSES'}
                {currentStep === 'position' && 'STEP D: FINANCIAL POSITION'}
                {currentStep === 'priorities' && 'STEP E: PRIORITIES'}
                {currentStep === 'risk' && 'STEP F: RISK PREFERENCE'}
                {currentStep === 'summary' && 'FINANCIAL BASELINE REVIEW'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {currentStep === 'profile' && 'Basic Operative Profile'}
                {currentStep === 'income' && 'Monthly Revenue & Salary'}
                {currentStep === 'expenses' && 'Monthly Committed Expenses'}
                {currentStep === 'position' && 'Existing Position & Liabilities'}
                {currentStep === 'priorities' && 'Core Financial Priorities'}
                {currentStep === 'risk' && 'Risk Profile Doctrine'}
                {currentStep === 'summary' && 'Confirm Financial Baseline'}
              </h3>
            </div>

            {profile.hasCompletedOnboarding && (
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="btn-ghost"
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div
              style={{
                background: 'rgba(239, 71, 111, 0.15)',
                borderLeft: '4px solid var(--status-red)',
                padding: '0.75rem 1.25rem',
                fontSize: '0.8rem',
                color: 'var(--status-red)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form Content Area */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
            {/* STEP A: BASIC PROFILE */}
            {currentStep === 'profile' && (
              <>
                <div>
                  <label className="ui-label">Name / Nickname</label>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="e.g. Sergio, Tokyo, Berlin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="ui-label">Age</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="ui-label">Country</label>
                    <input
                      type="text"
                      className="ui-input"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="ui-label">Currency Standard</label>
                  <select
                    className="ui-select font-mono"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  >
                    <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                  </select>
                </div>
              </>
            )}

            {/* STEP B: INCOME */}
            {currentStep === 'income' && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Enter your monthly take-home salary. We do not ask for annual gross salary to prevent tax deduction inaccuracies.
                </p>

                <div>
                  <label className="ui-label">Monthly Take-Home Salary (₹)</label>
                  <input
                    type="number"
                    className="ui-input font-mono"
                    style={{ fontSize: '1.25rem', fontWeight: 800 }}
                    placeholder="e.g. 75000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Formatted: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(Number(salary) || 0)}</strong>
                  </span>
                </div>

                <div>
                  <label className="ui-label">Other Monthly Income (Consulting, Dividends, Side Ops)</label>
                  <input
                    type="number"
                    className="ui-input font-mono"
                    placeholder="e.g. 0"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                  />
                </div>

                <div style={{ background: 'var(--bg-card-elevated)', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Monthly Income:</span>
                  <span className="mono-figure" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--status-green)' }}>
                    {formatINR(totalIncomeVal)}
                  </span>
                </div>
              </>
            )}

            {/* STEP C: EXPENSES */}
            {currentStep === 'expenses' && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Enter your typical monthly expenses. Leave blank or 0 for categories that do not apply to you.
                </p>

                <div>
                  <span className="ui-label" style={{ color: 'var(--red-bright)', marginBottom: '0.5rem' }}>FIXED COMMITMENTS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="ui-label">Rent / Housing (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={rent} onChange={(e) => setRent(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Utilities / Power (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={utilities} onChange={(e) => setUtilities(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Internet (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={internet} onChange={(e) => setInternet(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Phone Comms (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Insurance (Health/Term) (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">EMI & Loans (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={emi} onChange={(e) => setEmi(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Subscriptions (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={subscriptions} onChange={(e) => setSubscriptions(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Transportation / Fuel (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={transportation} onChange={(e) => setTransportation(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Education / Tuition (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={education} onChange={(e) => setEducation(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Other Recurring Fixed (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={otherFixed} onChange={(e) => setOtherFixed(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <span className="ui-label" style={{ color: 'var(--red-bright)', marginBottom: '0.5rem' }}>VARIABLE LIFESTYLE</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="ui-label">Food & Groceries (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={food} onChange={(e) => setFood(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Shopping (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={shopping} onChange={(e) => setShopping(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Entertainment & Leisure (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={entertainment} onChange={(e) => setEntertainment(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Travel & Vacation (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={travel} onChange={(e) => setTravel(e.target.value)} />
                    </div>
                    <div>
                      <label className="ui-label">Miscellaneous (₹)</label>
                      <input type="number" className="ui-input font-mono" placeholder="0" value={miscellaneous} onChange={(e) => setMiscellaneous(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Real-time calculated surplus/deficit preview */}
                <div style={{ background: 'var(--bg-card-elevated)', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Total Expenses: <strong className="font-mono" style={{ color: '#ffffff' }}>{formatINR(totalExpensesVal)}</strong>
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDeficit ? 'var(--status-red)' : 'var(--status-green)' }}>
                    {isDeficit ? `Deficit: -${formatINR(Math.abs(surplusVal))}` : `Surplus: ${formatINR(surplusVal)}`}
                  </span>
                </div>
              </>
            )}

            {/* STEP D: EXISTING FINANCIAL POSITION */}
            {currentStep === 'position' && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Inventory of your current liquid reserves, wealth assets, and liabilities.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="ui-label">Current Bank Savings (₹)</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      placeholder="0"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="ui-label">Emergency Fund (₹)</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      placeholder="0"
                      value={emergencyFund}
                      onChange={(e) => setEmergencyFund(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="ui-label">Existing Investments (₹)</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      placeholder="0"
                      value={existingInvestments}
                      onChange={(e) => setExistingInvestments(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="ui-label">Outstanding Loans (₹)</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      placeholder="0"
                      value={outstandingLoans}
                      onChange={(e) => setOutstandingLoans(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="ui-label">Credit Card Debt (₹)</label>
                    <input
                      type="number"
                      className="ui-input font-mono"
                      placeholder="0"
                      value={creditCardDebt}
                      onChange={(e) => setCreditCardDebt(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP E: PRIORITIES */}
            {currentStep === 'priorities' && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Select your key financial priorities. You may select multiple items.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {PRIORITY_OPTIONS.map((item) => {
                    const isSelected = priorities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleTogglePriority(item)}
                        className={isSelected ? 'btn-primary' : 'btn-secondary'}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="Add custom priority..."
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomPriority();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddCustomPriority} className="btn-secondary" style={{ flexShrink: 0 }}>
                    Add
                  </button>
                </div>
              </>
            )}

            {/* STEP F: RISK PROFILE */}
            {currentStep === 'risk' && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Select your general risk tolerance doctrine.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    {
                      key: 'conservative' as const,
                      label: 'Conservative (Capital Preservation)',
                      desc: 'Priority on liquidity and minimal drawdown volatility.',
                    },
                    {
                      key: 'moderate' as const,
                      label: 'Moderate (Balanced Strategic Growth)',
                      desc: 'Tolerates standard market cycles for compounding velocity.',
                    },
                    {
                      key: 'aggressive' as const,
                      label: 'Aggressive (Long-Term Wealth Maximization)',
                      desc: 'Embraces volatility to achieve maximum multi-year expansion.',
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setRiskPreference(item.key)}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: riskPreference === item.key ? 'var(--red-badge-bg)' : 'var(--bg-card-elevated)',
                        border: `1px solid ${riskPreference === item.key ? 'var(--red-primary)' : 'var(--border-card)'}`,
                        color: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.desc}</div>
                      </div>
                      {riskPreference === item.key && <CheckCircle2 size={18} style={{ color: 'var(--red-bright)' }} />}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  * Notice: Basic risk preference for Phase 1. Detailed multi-factor investment questionnaires and asset models will be activated in later phases.
                </div>
              </>
            )}

            {/* STEP 9: ONBOARDING SUMMARY */}
            {currentStep === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.25rem' }}>
                  <span className="status-pill status-pill-neutral" style={{ fontSize: '0.65rem' }}>
                    FINANCIAL BASELINE
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <span className="ui-label">MONTHLY INCOME</span>
                      <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(totalIncomeVal)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">MONTHLY EXPENSES</span>
                      <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(totalExpensesVal)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label" style={{ color: isDeficit ? 'var(--status-red)' : 'var(--status-green)' }}>
                        {isDeficit ? 'DEFICIT' : 'AVAILABLE CAPITAL'}
                      </span>
                      <div
                        className="mono-figure"
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: isDeficit ? 'var(--status-red)' : 'var(--status-green)',
                        }}
                      >
                        {isDeficit ? `-${formatINR(Math.abs(surplusVal))}` : formatINR(surplusVal)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">SAVINGS RATE</span>
                      <div className="mono-figure" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {savingsRateVal}%
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">CURRENT SAVINGS</span>
                      <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(Number(currentSavings) || 0)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">CURRENT INVESTMENTS</span>
                      <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(Number(existingInvestments) || 0)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">DEBT</span>
                      <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800, color: totalDebtVal > 0 ? 'var(--status-red)' : '#ffffff' }}>
                        {formatINR(totalDebtVal)}
                      </div>
                    </div>

                    <div>
                      <span className="ui-label">EMERGENCY FUND</span>
                      <div className="mono-figure" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(Number(emergencyFund) || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {isDeficit && (
                  <div
                    style={{
                      background: 'rgba(239, 71, 111, 0.15)',
                      border: '1px solid var(--status-red)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      fontSize: '0.8rem',
                      color: '#ffffff',
                    }}
                  >
                    <strong>DEFICIT WARNING:</strong> Your monthly expenses exceed income by {formatINR(Math.abs(surplusVal))}. Available capital is currently negative.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {currentStep !== 'profile' ? (
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  if (currentStep === 'income') setCurrentStep('profile');
                  else if (currentStep === 'expenses') setCurrentStep('income');
                  else if (currentStep === 'position') setCurrentStep('expenses');
                  else if (currentStep === 'priorities') setCurrentStep('position');
                  else if (currentStep === 'risk') setCurrentStep('priorities');
                  else if (currentStep === 'summary') setCurrentStep('risk');
                }}
                className="btn-secondary"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            ) : <div />}

            <div>
              {currentStep === 'profile' && (
                <button type="button" onClick={handleNextFromProfile} className="btn-primary">
                  Continue <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'income' && (
                <button type="button" onClick={handleNextFromIncome} className="btn-primary">
                  Continue <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'expenses' && (
                <button type="button" onClick={handleNextFromExpenses} className="btn-primary">
                  Continue <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'position' && (
                <button type="button" onClick={handleNextFromPosition} className="btn-primary">
                  Continue <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'priorities' && (
                <button type="button" onClick={handleNextFromPriorities} className="btn-primary">
                  Continue <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'risk' && (
                <button type="button" onClick={handleNextFromRisk} className="btn-primary">
                  Review Summary <ChevronRight size={16} />
                </button>
              )}
              {currentStep === 'summary' && (
                <button type="button" onClick={handleFinalConfirm} className="btn-primary">
                  [ CONFIRM PROFILE ]
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
