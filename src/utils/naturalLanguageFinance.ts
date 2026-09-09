// ==========================================================================
// FINANCE OS — NATURAL LANGUAGE FINANCIAL TEXT NORMALIZER
// Deterministic parsing and normalization of Indian numeric formats (Lakh/Crore/k),
// relative time horizons, and date strings.
// ==========================================================================

/**
 * Formats a Date object to local YYYY-MM-DD without UTC timezone shift.
 */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parses user financial text amounts into exact numeric values.
 * Supports:
 * - "₹1.5 lakh", "1.5 lakh", "1.5L", "1 lakh", "2 lakh"
 * - "2.5 crore", "1 crore", "1 cr"
 * - "100k", "50k", "20k"
 * - "₹1,20,000", "120000", "50000"
 */
export function parseNaturalLanguageAmount(input: string | number | undefined | null): number | null {
  if (input === undefined || input === null) return null;
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? null : Math.round(input);
  }

  const raw = String(input).trim().toLowerCase().replace(/,/g, '');
  if (!raw) return null;

  // Clean currency symbols
  const cleaned = raw.replace(/[₹$€£\s]/g, '');

  // Match Crore: e.g. "1.5crore", "2cr", "1crores"
  const croreMatch = cleaned.match(/^([\d.]+)\s*(?:crore|crores|cr)$/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    if (!isNaN(val) && val >= 0) return Math.round(val * 10000000);
  }

  // Match Lakh: e.g. "1.5lakh", "1.2l", "2lakhs", "1l"
  const lakhMatch = cleaned.match(/^([\d.]+)\s*(?:lakh|lakhs|lac|lacs|l)$/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val) && val >= 0) return Math.round(val * 100000);
  }

  // Match Thousands (k): e.g. "100k", "25k"
  const kMatch = cleaned.match(/^([\d.]+)\s*k$/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    if (!isNaN(val) && val >= 0) return Math.round(val * 1000);
  }

  // Match plain numbers: e.g. "120000"
  const plainNum = parseFloat(cleaned);
  if (!isNaN(plainNum) && plainNum >= 0 && isFinite(plainNum)) {
    return Math.round(plainNum);
  }

  return null;
}

/**
 * Parses natural language time horizons into a discrete target date (YYYY-MM-DD).
 * Supports:
 * - "6 months", "in 8 months", "3m"
 * - "1 year", "next year", "in 2 years"
 * - "March 2027", "december 2026", "2027-03"
 */
export function parseNaturalLanguageDate(
  input: string | undefined | null,
  referenceDate: Date = new Date()
): { dateStr: string; months: number; isAsap: boolean } | null {
  if (!input) return null;
  const raw = String(input).trim().toLowerCase();
  if (!raw) return null;

  // ASAP checks
  if (raw.includes('asap') || raw.includes('soon as possible') || raw.includes('earliest') || raw.includes('organic')) {
    return {
      dateStr: '',
      months: 0,
      isAsap: true,
    };
  }

  // Exact ISO format: YYYY-MM-DD or YYYY-MM
  const isoMatch = raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const monthsFromRef = (year - referenceDate.getFullYear()) * 12 + (month - referenceDate.getMonth());
    return {
      dateStr: `${year}-${monthStr}-${dayStr}`,
      months: Math.max(1, monthsFromRef),
      isAsap: false,
    };
  }

  // "X months" / "in X months"
  const monthsMatch = raw.match(/(?:in\s+)?(\d+)\s*(?:months?|m)/i);
  if (monthsMatch) {
    const count = parseInt(monthsMatch[1], 10);
    if (count > 0 && count <= 120) {
      const d = new Date(referenceDate);
      d.setMonth(d.getMonth() + count);
      return {
        dateStr: formatLocalDate(d),
        months: count,
        isAsap: false,
      };
    }
  }

  // "X years" / "next year"
  if (raw.includes('next year')) {
    const d = new Date(referenceDate);
    d.setFullYear(d.getFullYear() + 1);
    const monthsFromRef = 12;
    return {
      dateStr: formatLocalDate(d),
      months: monthsFromRef,
      isAsap: false,
    };
  }

  const yearsMatch = raw.match(/(?:in\s+)?(\d+)\s*years?/i);
  if (yearsMatch) {
    const count = parseInt(yearsMatch[1], 10);
    if (count > 0 && count <= 20) {
      const d = new Date(referenceDate);
      d.setMonth(d.getMonth() + count * 12);
      return {
        dateStr: formatLocalDate(d),
        months: count * 12,
        isAsap: false,
      };
    }
  }

  // Named month + year: e.g. "March 2027" or "Dec 2026"
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  for (let idx = 0; idx < 12; idx++) {
    const full = monthNames[idx];
    const short = shortMonthNames[idx];
    const monthRegex = new RegExp(`(?:by\\s+)?(?:${full}|${short})\\s*(\\d{4})?`, 'i');
    const mMatch = raw.match(monthRegex);
    if (mMatch) {
      const year = mMatch[1] ? parseInt(mMatch[1], 10) : referenceDate.getFullYear() + (idx < referenceDate.getMonth() ? 1 : 0);
      const d = new Date(year, idx, 1);
      const monthsFromRef = (year - referenceDate.getFullYear()) * 12 + (idx - referenceDate.getMonth());
      return {
        dateStr: formatLocalDate(d),
        months: Math.max(1, monthsFromRef),
        isAsap: false,
      };
    }
  }

  return null;
}

/**
 * Normalizes category classifications suggested by Gemini or input by user.
 */
export function normalizeGoalCategory(categoryStr: string | undefined): string {
  if (!categoryStr) return 'gadget';
  const c = categoryStr.trim().toLowerCase();

  if (c.includes('emergency') || c.includes('safety') || c.includes('runway') || c.includes('buffer')) {
    return 'emergency_fund';
  }
  if (
    c.includes('laptop') ||
    c.includes('macbook') ||
    c.includes('mac') ||
    c.includes('iphone') ||
    c.includes('ipad') ||
    c.includes('tech') ||
    c.includes('phone') ||
    c.includes('gadget') ||
    c.includes('camera') ||
    c.includes('hardware') ||
    c.includes('computer') ||
    c.includes('electronic')
  ) {
    return 'gadget';
  }
  if (c.includes('travel') || c.includes('trip') || c.includes('vacation') || c.includes('flight') || c.includes('holiday')) {
    return 'travel';
  }
  if (c.includes('car') || c.includes('bike') || c.includes('vehicle') || c.includes('scooter') || c.includes('transport')) {
    return 'vehicle';
  }
  if (c.includes('home') || c.includes('flat') || c.includes('house') || c.includes('furniture') || c.includes('renovation')) {
    return 'home';
  }
  if (c.includes('course') || c.includes('education') || c.includes('degree') || c.includes('college') || c.includes('upskilling') || c.includes('exam')) {
    return 'education';
  }
  if (c.includes('invest') || c.includes('seed') || c.includes('stock') || c.includes('business') || c.includes('portfolio')) {
    return 'investment_seed';
  }

  return 'other';
}
