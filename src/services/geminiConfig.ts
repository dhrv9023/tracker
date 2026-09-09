// ==========================================================================
// FINANCE OS — GEMINI CONFIGURATION & CREDENTIAL MANAGEMENT
// Central configuration for model versioning and API key resolution.
// ==========================================================================

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
export const STORAGE_KEY_GEMINI_API_KEY = 'finance_os_gemini_api_key';

/**
 * Resolves the active Gemini API key.
 * Priority order:
 * 1. User-provided key saved in localStorage (allows runtime configuration in Settings).
 * 2. Build-time/environment key from import.meta.env.VITE_GEMINI_API_KEY.
 */
/**
 * Resolves the explicitly user-provided key in localStorage, if any.
 */
export function getStoredClientApiKey(): string {
  try {
    const customKey = localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  } catch (e) {
    // LocalStorage unavailable
  }
  return '';
}

/**
 * Resolves the active Gemini API key.
 * Priority order:
 * 1. User-provided key saved in localStorage (allows runtime configuration in Settings).
 * 2. Build-time/environment key from import.meta.env.VITE_GEMINI_API_KEY.
 */
export function getActiveGeminiApiKey(): string {
  const clientKey = getStoredClientApiKey();
  if (clientKey) return clientKey;

  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return '';
}

/**
 * Checks whether Gemini AI intelligence capabilities are available
 * via either server proxy or client-configured API key.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(getActiveGeminiApiKey());
}

/**
 * Saves a user-defined Gemini API key to local browser storage.
 */
export function setStoredGeminiApiKey(key: string): void {
  try {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_GEMINI_API_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY_GEMINI_API_KEY, key.trim());
    }
  } catch (e) {
    console.warn('Failed to save Gemini API key to localStorage', e);
  }
}

/**
 * Clears the stored Gemini API key.
 */
export function clearStoredGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_GEMINI_API_KEY);
  } catch (e) {
    // Ignore
  }
}

/**
 * Centralized Gemini execution engine.
 * Automatically tries local proxy first, falling back to direct client API calls.
 */
export async function generateGeminiContent(options: {
  contents: any;
  config?: any;
  model?: string;
  apiKey?: string;
}): Promise<string> {
  const model = options.model || DEFAULT_GEMINI_MODEL;

  if (options.apiKey !== undefined && !options.apiKey.trim()) {
    throw new Error('NO_API_KEY');
  }

  const customClientKey = options.apiKey || getStoredClientApiKey();
  const isVitest = typeof process !== 'undefined' && Boolean(process.env?.VITEST);

  // If no explicit custom client key was entered, try serverless proxy (except in test runner)
  if (!isVitest && !customClientKey && typeof window !== 'undefined' && window.location) {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          contents: options.contents,
          config: options.config,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && typeof json.text === 'string') {
          return json.text;
        }
      } else if (res.status === 401) {
        // Server has no key configured
        const errJson = await res.json().catch(() => ({}));
        if (errJson?.error === 'NO_SERVER_KEY') {
          // Check if there is an active client key to try as fallback
          const clientFallback = getActiveGeminiApiKey();
          if (!clientFallback) {
            throw new Error('NO_API_KEY');
          }
        }
      }
    } catch (err: any) {
      if (err?.message === 'NO_API_KEY') throw err;
      // Proxy unavailable, timeout, or network glitch; fall through to direct client call if key available
    }
  }

  // Direct client invocation
  const apiKey = options.apiKey !== undefined ? options.apiKey : getActiveGeminiApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('NO_API_KEY');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const response = await ai.models.generateContent({
    model,
    contents: options.contents,
    config: options.config,
  });

  return (response && response.text) ? response.text : '';
}

/**
 * Diagnostic test to verify that Gemini can connect.
 */
export async function testGeminiConnection(): Promise<{ success: boolean; message: string; model: string }> {
  // Try proxy first if no custom client key
  const customClientKey = getStoredClientApiKey();
  if (!customClientKey && typeof window !== 'undefined' && window.location) {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_GEMINI_MODEL,
          contents: 'Ping test. Reply with: PONG',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.text) {
          return {
            success: true,
            message: `Server Proxy Connection successful (${DEFAULT_GEMINI_MODEL} verified).`,
            model: DEFAULT_GEMINI_MODEL,
          };
        }
      }
    } catch (e) {
      // Fall through to client key check
    }
  }

  const apiKey = getActiveGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      message: 'No Gemini API key detected. Please add VITE_GEMINI_API_KEY to .env or enter it below.',
      model: DEFAULT_GEMINI_MODEL,
    };
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: 'Ping test. Reply with: PONG',
    });

    if (response && response.text) {
      return {
        success: true,
        message: `Direct Connection successful (${DEFAULT_GEMINI_MODEL} verified).`,
        model: DEFAULT_GEMINI_MODEL,
      };
    }

    return {
      success: false,
      message: 'Gemini responded with an empty payload.',
      model: DEFAULT_GEMINI_MODEL,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('403') || errMsg.includes('unregistered')) {
      return {
        success: false,
        message: 'Invalid Gemini API key or insufficient permissions.',
        model: DEFAULT_GEMINI_MODEL,
      };
    }
    if (errMsg.includes('404')) {
      return {
        success: false,
        message: `Model ${DEFAULT_GEMINI_MODEL} not accessible with this API key.`,
        model: DEFAULT_GEMINI_MODEL,
      };
    }
    return {
      success: false,
      message: `Gemini connection failed: ${errMsg.slice(0, 120)}`,
      model: DEFAULT_GEMINI_MODEL,
    };
  }
}
