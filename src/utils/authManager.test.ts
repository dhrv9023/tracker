// ==========================================================================
// FINANCE OS — AUTH MANAGER UNIT TESTS
// ==========================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sha256Hex,
  generateSalt,
  isPasswordConfigured,
  setMasterPassword,
  verifyPassword,
  changeMasterPassword,
  removePasswordProtection,
  isSessionUnlocked,
  unlockSession,
  lockSession,
  getLockoutState,
  recordFailedAttempt,
  resetFailedAttempts,
} from './authManager';

describe('AuthManager — Master Passcode Cryptographic Security', () => {
  beforeEach(() => {
    // Reset virtual localStorage and sessionStorage
    const memoryStore: Record<string, string> = {};
    const sessionStore: Record<string, string> = {};

    (globalThis as any).localStorage = {
      getItem: (k: string) => memoryStore[k] ?? null,
      setItem: (k: string, v: string) => {
        memoryStore[k] = String(v);
      },
      removeItem: (k: string) => {
        delete memoryStore[k];
      },
      clear: () => {
        Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
      },
    };

    (globalThis as any).sessionStorage = {
      getItem: (k: string) => sessionStore[k] ?? null,
      setItem: (k: string, v: string) => {
        sessionStore[k] = String(v);
      },
      removeItem: (k: string) => {
        delete sessionStore[k];
      },
      clear: () => {
        Object.keys(sessionStore).forEach((k) => delete sessionStore[k]);
      },
    };
  });

  it('computes deterministic SHA-256 hex string', async () => {
    const hash1 = await sha256Hex('test-secret');
    const hash2 = await sha256Hex('test-secret');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('generates unique cryptographic salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBeGreaterThanOrEqual(16);
  });

  it('handles password configuration flow', async () => {
    expect(isPasswordConfigured()).toBe(false);
    expect(isSessionUnlocked()).toBe(false);

    await setMasterPassword('OperativeVault99!');
    expect(isPasswordConfigured()).toBe(true);

    // Verify correct and incorrect password
    const correct = await verifyPassword('OperativeVault99!');
    expect(correct).toBe(true);

    const incorrect = await verifyPassword('WrongPassword');
    expect(incorrect).toBe(false);
  });

  it('manages session unlocking and locking', async () => {
    await setMasterPassword('Secret1234');
    expect(isSessionUnlocked()).toBe(false);

    // Unlock without remember me (session only)
    await unlockSession(false);
    expect(isSessionUnlocked()).toBe(true);

    // Lock session
    lockSession();
    expect(isSessionUnlocked()).toBe(false);

    // Unlock with 30-day device memory
    await unlockSession(true);
    expect(isSessionUnlocked()).toBe(true);
  });

  it('enforces brute-force lockout protection after 5 consecutive failures', () => {
    resetFailedAttempts();
    expect(getLockoutState().isLockedOut).toBe(false);

    // 4 failed attempts: remaining decreases
    for (let i = 1; i <= 4; i++) {
      const res = recordFailedAttempt();
      expect(res.isLockedOut).toBe(false);
      expect(res.attemptsRemaining).toBe(5 - i);
    }

    // 5th failed attempt: triggers lockout
    const fifth = recordFailedAttempt();
    expect(fifth.isLockedOut).toBe(true);
    expect(fifth.remainingSeconds).toBeGreaterThan(0);

    const status = getLockoutState();
    expect(status.isLockedOut).toBe(true);
    expect(status.remainingSeconds).toBeGreaterThan(0);

    // Resetting clears lockout
    resetFailedAttempts();
    expect(getLockoutState().isLockedOut).toBe(false);
  });

  it('allows changing passcode only with valid current passcode', async () => {
    await setMasterPassword('AlphaPass123');

    // Wrong current passcode
    const failRes = await changeMasterPassword('WrongPass', 'BetaPass456');
    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain('Current passcode is incorrect');

    // Too short new passcode
    const shortRes = await changeMasterPassword('AlphaPass123', '12');
    expect(shortRes.success).toBe(false);
    expect(shortRes.error).toContain('at least 4 characters');

    // Valid change
    const okRes = await changeMasterPassword('AlphaPass123', 'BetaPass456');
    expect(okRes.success).toBe(true);

    // Old password now fails, new password succeeds
    expect(await verifyPassword('AlphaPass123')).toBe(false);
    expect(await verifyPassword('BetaPass456')).toBe(true);
  });

  it('allows removing password protection with valid verification', async () => {
    await setMasterPassword('MyCode88');
    expect(isPasswordConfigured()).toBe(true);

    const fail = await removePasswordProtection('BadCode');
    expect(fail.success).toBe(false);

    const success = await removePasswordProtection('MyCode88');
    expect(success.success).toBe(true);
    expect(isPasswordConfigured()).toBe(false);
  });
});
