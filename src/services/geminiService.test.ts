// ==========================================================================
// FINANCE OS — PHASE 4 GEMINI SAVINGS INTELLIGENCE TESTS
// Comprehensive unit tests for natural language parsing, compact context construction,
// structured output validation, and deterministic calculation preservation.
// ==========================================================================

import { describe, it, expect } from 'vitest';
import {
  parseNaturalLanguageAmount,
  parseNaturalLanguageDate,
  normalizeGoalCategory,
} from '../utils/naturalLanguageFinance';
import {
  buildCompactContext,
  sanitizeGeminiOutput,
  CompactFinancialContext,
} from './geminiService';
import {
  calculateRemainingGoalAmount,
  calculateRequiredMonthlyContribution,
  calculateMissionFeasibility,
} from '../utils/finance';

describe('Phase 4 Gemini Savings Intelligence', () => {
  // ------------------------------------------------------------------------
  // 1. Natural Language Amount Normalizer Tests
  // ------------------------------------------------------------------------
  describe('Natural Language Amount Normalization', () => {
    it('parses Lakh representations accurately', () => {
      expect(parseNaturalLanguageAmount('1.5 lakh')).toBe(150000);
      expect(parseNaturalLanguageAmount('₹1.2 lakh')).toBe(120000);
      expect(parseNaturalLanguageAmount('1 lakh')).toBe(100000);
      expect(parseNaturalLanguageAmount('1L')).toBe(100000);
      expect(parseNaturalLanguageAmount('2.5 lakhs')).toBe(250000);
      expect(parseNaturalLanguageAmount('0.5 lac')).toBe(50000);
    });

    it('parses Crore representations accurately', () => {
      expect(parseNaturalLanguageAmount('1 crore')).toBe(10000000);
      expect(parseNaturalLanguageAmount('2.5 crore')).toBe(25000000);
      expect(parseNaturalLanguageAmount('₹1 cr')).toBe(10000000);
    });

    it('parses Thousands (k) representations accurately', () => {
      expect(parseNaturalLanguageAmount('100k')).toBe(100000);
      expect(parseNaturalLanguageAmount('50k')).toBe(50000);
      expect(parseNaturalLanguageAmount('₹25k')).toBe(25000);
      expect(parseNaturalLanguageAmount('7.5k')).toBe(7500);
    });

    it('parses standard plain number and comma-formatted strings', () => {
      expect(parseNaturalLanguageAmount('120000')).toBe(120000);
      expect(parseNaturalLanguageAmount('₹1,20,000')).toBe(120000);
      expect(parseNaturalLanguageAmount(50000)).toBe(50000);
    });

    it('handles invalid or empty amounts safely', () => {
      expect(parseNaturalLanguageAmount(null)).toBeNull();
      expect(parseNaturalLanguageAmount(undefined)).toBeNull();
      expect(parseNaturalLanguageAmount('')).toBeNull();
      expect(parseNaturalLanguageAmount('random string')).toBeNull();
      expect(parseNaturalLanguageAmount(-5000)).toBeNull();
    });
  });

  // ------------------------------------------------------------------------
  // 2. Natural Language Date & Horizon Normalizer Tests
  // ------------------------------------------------------------------------
  describe('Natural Language Date Normalization', () => {
    const fixedRefDate = new Date(2026, 8, 1); // 2026-09-01

    it('parses discrete month durations', () => {
      const res6m = parseNaturalLanguageDate('6 months', fixedRefDate);
      expect(res6m).not.toBeNull();
      expect(res6m?.months).toBe(6);
      expect(res6m?.isAsap).toBe(false);

      const res8m = parseNaturalLanguageDate('in 8 months', fixedRefDate);
      expect(res8m).not.toBeNull();
      expect(res8m?.months).toBe(8);
    });

    it('parses relative years', () => {
      const resNextYear = parseNaturalLanguageDate('next year', fixedRefDate);
      expect(resNextYear).not.toBeNull();
      expect(resNextYear?.months).toBe(12);

      const res2yr = parseNaturalLanguageDate('in 2 years', fixedRefDate);
      expect(res2yr).not.toBeNull();
      expect(res2yr?.months).toBe(24);
    });

    it('parses named month targets', () => {
      const resMarch = parseNaturalLanguageDate('March 2027', fixedRefDate);
      expect(resMarch).not.toBeNull();
      expect(resMarch?.dateStr).toBe('2027-03-01');
      expect(resMarch?.months).toBe(6);
    });

    it('detects ASAP mode', () => {
      const resAsap = parseNaturalLanguageDate('asap', fixedRefDate);
      expect(resAsap).not.toBeNull();
      expect(resAsap?.isAsap).toBe(true);

      const resSoon = parseNaturalLanguageDate('as soon as possible', fixedRefDate);
      expect(resSoon?.isAsap).toBe(true);
    });

    it('handles ISO date strings', () => {
      const resIso = parseNaturalLanguageDate('2027-03-15', fixedRefDate);
      expect(resIso).not.toBeNull();
      expect(resIso?.dateStr).toBe('2027-03-15');
    });
  });

  // ------------------------------------------------------------------------
  // 3. Goal Category Normalizer Tests
  // ------------------------------------------------------------------------
  describe('Goal Category Normalization', () => {
    it('maps technology items to gadget', () => {
      expect(normalizeGoalCategory('gaming laptop')).toBe('gadget');
      expect(normalizeGoalCategory('MacBook Pro')).toBe('gadget');
      expect(normalizeGoalCategory('iPhone 16')).toBe('gadget');
      expect(normalizeGoalCategory('Sony Camera')).toBe('gadget');
    });

    it('maps safety reserves to emergency_fund', () => {
      expect(normalizeGoalCategory('emergency fund')).toBe('emergency_fund');
      expect(normalizeGoalCategory('6-month safety buffer')).toBe('emergency_fund');
      expect(normalizeGoalCategory('financial runway')).toBe('emergency_fund');
    });

    it('maps travel, vehicle, and home goals', () => {
      expect(normalizeGoalCategory('trip to Goa')).toBe('travel');
      expect(normalizeGoalCategory('vacation in Japan')).toBe('travel');
      expect(normalizeGoalCategory('Honda City Car')).toBe('vehicle');
      expect(normalizeGoalCategory('Home renovation')).toBe('home');
    });
  });

  // ------------------------------------------------------------------------
  // 4. Compact Privacy-Safe Context Builder Tests
  // ------------------------------------------------------------------------
  describe('Compact Context Builder', () => {
    it('produces privacy-conscious JSON without credentials', () => {
      const ctx: CompactFinancialContext = {
        currency: 'INR',
        monthly_income: 75000,
        monthly_expenses: 42000,
        monthly_surplus: 33000,
        current_savings: 150000,
        emergency_fund: 60000,
        active_missions_count: 1,
        active_missions_summary: [
          {
            name: 'MacBook Pro',
            target_amount: 120000,
            current_amount: 45000,
            monthly_contribution: 10000,
            target_date: '2027-03-01',
            priority: 'high',
          },
        ],
      };

      const jsonStr = buildCompactContext(ctx);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.currency).toBe('INR');
      expect(parsed.available_monthly_surplus).toBe(33000);
      expect(parsed.active_missions.length).toBe(1);
      expect(parsed.active_missions[0].name).toBe('MacBook Pro');
      expect(jsonStr).not.toContain('password');
      expect(jsonStr).not.toContain('apiKey');
    });
  });

  // ------------------------------------------------------------------------
  // 5. Structured Gemini JSON Sanitization & Parsing
  // ------------------------------------------------------------------------
  describe('Structured Output Sanitization', () => {
    it('parses valid structured JSON correctly', () => {
      const raw = JSON.stringify({
        intent: 'create_savings_mission',
        status: 'plan_ready',
        mission: {
          name: 'Gaming Laptop',
          category: 'gadget',
          target_amount: 100000,
          target_date: '6 months',
          current_amount: 20000,
          priority: 'high',
        },
        missing_information: [],
        summary: 'Your laptop goal is achievable.',
        recommendations: [],
        warnings: [],
      });

      const parsed = sanitizeGeminiOutput(raw);
      expect(parsed.status).toBe('plan_ready');
      expect(parsed.mission?.target_amount).toBe(100000);
      expect(parsed.mission?.current_amount).toBe(20000);
      expect(parsed.mission?.category).toBe('gadget');
    });

    it('strips markdown code blocks if returned by model', () => {
      const raw = '```json\n{"intent":"create_savings_mission","status":"question","next_question":"What is your budget?","missing_information":["target_amount"],"summary":"","recommendations":[],"warnings":[]}\n```';
      const parsed = sanitizeGeminiOutput(raw);
      expect(parsed.status).toBe('question');
      expect(parsed.next_question).toBe('What is your budget?');
    });

    it('gracefully handles malformed JSON without throwing', () => {
      const malformed = 'Not valid JSON from AI';
      const parsed = sanitizeGeminiOutput(malformed);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.next_question).toBeDefined();
    });
  });

  // ------------------------------------------------------------------------
  // 6. Deterministic Engine Handoff (Core Law Verification)
  // ------------------------------------------------------------------------
  describe('Deterministic Engine Handoff', () => {
    it('ensures application calculations override any AI numerical claims', () => {
      // User says: 1.2 lakh laptop in 8 months, 20k saved, surplus 33k
      const targetAmount = 120000;
      const currentAmount = 20000;
      const surplus = 33000;

      const remaining = calculateRemainingGoalAmount(targetAmount, currentAmount);
      expect(remaining).toBe(100000);

      // Deterministic required calculation for 8 months
      const requiredMonthly = Math.ceil(remaining / 8);
      expect(requiredMonthly).toBe(12500);

      // Deterministic feasibility
      const feasibility = calculateMissionFeasibility({
        targetAmount,
        currentAmount,
        targetDate: '2027-05-01',
        availableSurplus: surplus,
        userSelectedContribution: requiredMonthly,
      });

      expect(feasibility.status).toBe('on_track');
      expect(feasibility.requiredMonthlyContribution).toBe(12500);
      expect(feasibility.surplusAfterContribution).toBe(20500); // 33,000 - 12,500
    });
  });
});
