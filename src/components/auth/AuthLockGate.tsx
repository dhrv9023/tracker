// ==========================================================================
// FINANCE OS — TACTICAL AUTHENTICATION LOCK GATE
// Human-designed Money-Heist security gateway protecting all telemetry.
// ==========================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import {
  isPasswordConfigured,
  isSessionUnlocked,
  setMasterPassword,
  verifyPassword,
  unlockSession,
  lockSession,
  getLockoutState,
  recordFailedAttempt,
  resetFailedAttempts,
} from '../../utils/authManager';

export function triggerTerminalLock(): void {
  lockSession();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('finance_os_lock'));
  }
}

interface AuthLockGateProps {
  children: React.ReactNode;
}

export const AuthLockGate: React.FC<AuthLockGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState<boolean>(() => isSessionUnlocked());
  const [configured, setConfigured] = useState<boolean>(() => isPasswordConfigured());

  // Input states
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Lockout states
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for terminal lock commands from TopBar or Settings
  useEffect(() => {
    const handleLock = () => {
      setUnlocked(false);
      setConfigured(isPasswordConfigured());
      setPasscode('');
    };
    window.addEventListener('finance_os_lock', handleLock);
    return () => window.removeEventListener('finance_os_lock', handleLock);
  }, []);

  // Countdown timer for lockout cooldown
  useEffect(() => {
    const { isLockedOut, remainingSeconds } = getLockoutState();
    if (isLockedOut) {
      setLockoutSeconds(remainingSeconds);
    }
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          resetFailedAttempts();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Autofocus input when locked
  useEffect(() => {
    if (!unlocked) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [unlocked, configured]);

  // Trigger shake animation on error
  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Setup mode handler (First-time initialization)
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (passcode.length < 4) {
      triggerError('Passcode must be at least 4 characters long.');
      return;
    }

    if (passcode !== confirmPasscode) {
      triggerError('Passcodes do not match. Verify your entry.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setMasterPassword(passcode);
      await unlockSession(rememberMe);
      setConfigured(true);
      setUnlocked(true);
    } catch {
      triggerError('Failed to initialize security credentials. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unlock mode handler (Entering established passcode)
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutSeconds > 0) return;

    if (!passcode.trim()) {
      triggerError('Enter your master passcode to authorize access.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await verifyPassword(passcode);
      if (isValid) {
        await unlockSession(rememberMe);
        setUnlocked(true);
        setPasscode('');
      } else {
        const attempt = recordFailedAttempt();
        if (attempt.isLockedOut) {
          setLockoutSeconds(attempt.remainingSeconds);
          triggerError(`Brute-force protection activated. Terminal locked for ${attempt.remainingSeconds}s.`);
        } else {
          triggerError(
            `Access Denied // Invalid Passcode (${attempt.attemptsRemaining} attempt${
              attempt.attemptsRemaining === 1 ? '' : 's'
            } remaining)`
          );
        }
      }
    } catch {
      triggerError('Authentication error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already unlocked, render application cockpit
  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse at center, #150808 0%, #080303 60%, #030101 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* Background Tactical Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(229, 9, 20, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 9, 20, 0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      {/* Lock Gate Modal Box */}
      <div
        className={isShaking ? 'lock-shake' : ''}
        style={{
          maxWidth: '460px',
          width: '100%',
          background: '#0d0404',
          border: '1px solid rgba(229, 9, 20, 0.4)',
          borderRadius: 'var(--radius-lg, 12px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(229, 9, 20, 0.18)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Terminal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.12)',
              border: '1px solid rgba(229, 9, 20, 0.5)',
              marginBottom: '1.25rem',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)',
            }}
          >
            {configured ? (
              <Lock size={26} style={{ color: 'var(--red-primary, #e50914)' }} />
            ) : (
              <KeyRound size={26} style={{ color: 'var(--status-yellow, #ffd166)' }} />
            )}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--red-primary, #e50914)',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <span className="pulsing-dot" style={{ width: '6px', height: '6px' }} />
            FINANCE OS // SECURITY GATEWAY
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem',
            }}
          >
            {configured ? 'Access Verification' : 'Initialize Passcode'}
          </h1>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary, #cbd5e1)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {configured
              ? 'Security clearance Level 0 required. Enter your master passcode to unlock this terminal.'
              : 'Create a private master passcode to secure your financial cockpit on this device.'}
          </p>
        </div>

        {/* Error / Alert Box */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 71, 111, 0.12)',
              border: '1px solid rgba(239, 71, 111, 0.4)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.75rem 0.95rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: '#ff8a9e',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Cooldown Lockout Warning */}
        {lockoutSeconds > 0 && (
          <div
            style={{
              background: 'rgba(255, 209, 102, 0.1)',
              border: '1px solid rgba(255, 209, 102, 0.4)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <ShieldAlert size={20} style={{ color: 'var(--status-yellow, #ffd166)', margin: '0 auto 0.4rem' }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
              TERMINAL LOCKED DOWN
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--status-yellow, #ffd166)',
                marginTop: '0.2rem',
              }}
            >
              Retry authorized in {lockoutSeconds}s
            </div>
          </div>
        )}

        {/* FORM: Setup or Unlock */}
        <form onSubmit={configured ? handleUnlock : handleSetup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Primary Passcode Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-muted, #94a3b8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.45rem',
                }}
              >
                {configured ? 'Master Passcode' : 'Create Master Passcode'}
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={lockoutSeconds > 0 || isSubmitting}
                  placeholder={configured ? '••••••••' : 'Enter secret passcode'}
                  className="tactical-input font-mono"
                  style={{
                    width: '100%',
                    fontSize: '1.05rem',
                    paddingRight: '2.75rem',
                    borderColor: 'rgba(229, 9, 20, 0.4)',
                    letterSpacing: showPassword ? 'normal' : '0.2em',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Passcode Input (Setup Mode Only) */}
            {!configured && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--text-muted, #94a3b8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.45rem',
                  }}
                >
                  Confirm Master Passcode
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Re-enter secret passcode"
                  className="tactical-input font-mono"
                  style={{
                    width: '100%',
                    fontSize: '1.05rem',
                    borderColor: 'rgba(229, 9, 20, 0.4)',
                    letterSpacing: showPassword ? 'normal' : '0.2em',
                  }}
                />
              </div>
            )}

            {/* Remember Me Option */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary, #cbd5e1)',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '0.25rem',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--red-primary, #e50914)',
                  width: '15px',
                  height: '15px',
                  cursor: 'pointer',
                }}
              />
              <span>Remember this browser for 30 days</span>
            </label>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isSubmitting || !passcode}
              className="ui-btn ui-btn-primary"
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(229, 9, 20, 0.4)',
              }}
            >
              {configured ? (
                <>
                  <Unlock size={16} /> Unlock Command Terminal
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Authorize & Initialize Terminal
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Security Advisory */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.5,
          }}
        >
          {configured ? (
            <span>PROTECTED BY SHA-256 CLIENT-SIDE CRYPTOGRAPHIC VAULT</span>
          ) : (
            <span>ZERO CLOUD LEAKAGE // STORED LOCALLY VIA WEB CRYPTO API</span>
          )}
        </div>
      </div>
    </div>
  );
};
