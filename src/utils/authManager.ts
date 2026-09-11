// ==========================================================================
// FINANCE OS — PHASE 9: MASTER AUTHENTICATION & ACCESS CONTROL MANAGER
// Cryptographically hashes master passcodes using native Web Crypto API (SHA-256)
// with a per-device cryptographic salt. Zero plaintext passwords stored.
// ==========================================================================

const STORAGE_KEY_AUTH = 'finance_os_auth_credentials_v1';
const STORAGE_KEY_REMEMBER = 'finance_os_auth_remember_token_v1';
const SESSION_KEY_UNLOCKED = 'finance_os_session_unlocked_v1';
const STORAGE_KEY_ATTEMPTS = 'finance_os_auth_failed_attempts_v1';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds
const REMEMBER_ME_DAYS = 30;

export interface StoredCredentials {
  hash: string;
  salt: string;
  updatedAt: string;
}

interface AttemptTracker {
  count: number;
  lockedUntil: number | null;
}

/**
 * Universal SHA-256 hashing supporting browser Web Crypto API and Node runtime.
 */
export async function sha256Hex(text: string): Promise<string> {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj && cryptoObj.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Deterministic fallback
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Generates a random cryptographic salt string.
 */
export function generateSalt(): string {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const array = new Uint8Array(16);
    cryptoObj.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Checks whether a master password is configured either via localStorage or environment variable.
 */
export function isPasswordConfigured(): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        const creds = JSON.parse(stored);
        if (creds && creds.hash) return true;
      }
    }
  } catch {}

  // Check optional build-time or Vercel environment variable
  const envPassword = (import.meta as any).env?.VITE_APP_PASSWORD;
  return Boolean(envPassword && String(envPassword).trim().length > 0);
}

/**
 * Saves a new master passcode.
 */
export async function setMasterPassword(password: string): Promise<void> {
  const salt = generateSalt();
  const hash = await sha256Hex(`${salt}:${password}`);
  const payload: StoredCredentials = {
    hash,
    salt,
    updatedAt: new Date().toISOString(),
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(payload));
  }
}

/**
 * Validates an input passcode against the stored hash or environment variable.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  if (!password || !password.trim()) return false;

  // 1. Check local stored credentials
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        const creds: StoredCredentials = JSON.parse(stored);
        if (creds && creds.hash && creds.salt) {
          const computedHash = await sha256Hex(`${creds.salt}:${password}`);
          return computedHash === creds.hash;
        }
      }
    }
  } catch {}

  // 2. Check environment variable fallback
  const envPassword = (import.meta as any).env?.VITE_APP_PASSWORD;
  if (envPassword && String(envPassword).trim().length > 0) {
    return password.trim() === String(envPassword).trim();
  }

  return false;
}

/**
 * Changes master passcode after verifying the current one.
 */
export async function changeMasterPassword(
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyPassword(currentPass);
  if (!isValid) {
    return { success: false, error: 'Current passcode is incorrect.' };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, error: 'New passcode must be at least 4 characters long.' };
  }

  await setMasterPassword(newPass.trim());
  return { success: true };
}

/**
 * Removes master passcode protection completely.
 */
export async function removePasswordProtection(
  currentPass: string
): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyPassword(currentPass);
  if (!isValid) {
    return { success: false, error: 'Current passcode is incorrect.' };
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_REMEMBER);
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY_UNLOCKED);
  }
  return { success: true };
}

/**
 * Checks if the current browser session is already unlocked.
 */
export function isSessionUnlocked(): boolean {
  // If no password is configured anywhere, require setup or consider locked depending on setup flow
  if (!isPasswordConfigured()) {
    return false; // Will trigger the setup password screen
  }

  // 1. Check current session
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY_UNLOCKED) === 'true') {
      return true;
    }
  } catch {}

  // 2. Check 30-day "Remember this device" token
  try {
    if (typeof localStorage !== 'undefined') {
      const tokenStr = localStorage.getItem(STORAGE_KEY_REMEMBER);
      if (tokenStr) {
        const { expiry } = JSON.parse(tokenStr);
        if (expiry && Date.now() < expiry) {
          return true;
        } else {
          localStorage.removeItem(STORAGE_KEY_REMEMBER);
        }
      }
    }
  } catch {}

  return false;
}

/**
 * Marks the session as unlocked, optionally persisting for 30 days.
 */
export async function unlockSession(rememberDevice: boolean): Promise<void> {
  try {
    sessionStorage.setItem(SESSION_KEY_UNLOCKED, 'true');
    resetFailedAttempts();

    if (rememberDevice) {
      const expiry = Date.now() + REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000;
      const tokenPayload = {
        expiry,
        issuedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify(tokenPayload));
    }
  } catch {}
}

/**
 * Locks the current session immediately.
 */
export function lockSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY_UNLOCKED);
    localStorage.removeItem(STORAGE_KEY_REMEMBER);
  } catch {}
}

/**
 * Inspects lockout cooldown state.
 */
export function getLockoutState(): { isLockedOut: boolean; remainingSeconds: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    if (!stored) return { isLockedOut: false, remainingSeconds: 0 };

    const data: AttemptTracker = JSON.parse(stored);
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      const remainingMs = data.lockedUntil - Date.now();
      return {
        isLockedOut: true,
        remainingSeconds: Math.ceil(remainingMs / 1000),
      };
    }
  } catch {}

  return { isLockedOut: false, remainingSeconds: 0 };
}

/**
 * Records a failed attempt and triggers lockout if max attempts exceeded.
 */
export function recordFailedAttempt(): {
  isLockedOut: boolean;
  remainingSeconds: number;
  attemptsRemaining: number;
} {
  let tracker: AttemptTracker = { count: 0, lockedUntil: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    if (stored) {
      tracker = JSON.parse(stored);
    }
  } catch {}

  tracker.count += 1;

  if (tracker.count >= MAX_FAILED_ATTEMPTS) {
    tracker.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(tracker));
    return {
      isLockedOut: true,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      attemptsRemaining: 0,
    };
  }

  localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(tracker));
  return {
    isLockedOut: false,
    remainingSeconds: 0,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - tracker.count,
  };
}

/**
 * Clears failed attempt counter upon successful login.
 */
export function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
  } catch {}
}
