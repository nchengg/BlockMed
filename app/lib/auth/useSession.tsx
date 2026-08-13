'use client';
// Client-side session state for Dan's surface.
//
// Unlike the mock authStore, this holds NO authority: it is a cache of what
// /api/auth/session reports. The cookie is httpOnly, so the client cannot read
// or forge it — every mutating request is authorised by the server from the
// cookie, not from anything here. If this state were tampered with, the API
// would simply reject the call.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { SignupInput, FieldErrors } from './validate';

// This preview is a client-only development aid. It intentionally never makes
// an auth request, writes a cookie, or receives authority from an API route.
// Keep it out of production even if a browser has an old localStorage value.
const UI_PREVIEW_STORAGE_KEY = 'blockmediary.ui-preview-role';
const UI_PREVIEW_ENABLED = process.env.NODE_ENV === 'development';

export type UiPreviewRole = 'buyer' | 'seller' | 'platform';

export type SessionAccount = {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  country: string;
  type: string;
  /** Null until a wallet is proven via SIWE. Serialised, so the date is a string. */
  walletAddress: string | null;
  walletLinkedAt: string | null;
};

const UI_PREVIEW_ACCOUNTS: Record<UiPreviewRole, SessionAccount> = {
  buyer: {
    id: 'ui-preview-buyer', email: 'buyer.preview@blockmediary.test',
    companyName: 'Meridian Imports Ltd.', contactName: 'Maya Patel', country: 'United Kingdom',
    type: 'buyer', walletAddress: null, walletLinkedAt: null,
  },
  seller: {
    id: 'ui-preview-seller', email: 'seller.preview@blockmediary.test',
    companyName: 'Ege Weave Ltd.', contactName: 'Emre Kaya', country: 'Türkiye',
    type: 'seller', walletAddress: null, walletLinkedAt: null,
  },
  platform: {
    id: 'ui-preview-platform', email: 'platform.preview@blockmediary.test',
    companyName: 'Blockmediary Operations', contactName: 'Alex Morgan', country: 'United Kingdom',
    type: 'platform', walletAddress: null, walletLinkedAt: null,
  },
};

function storedPreviewRole(): UiPreviewRole | null {
  if (!UI_PREVIEW_ENABLED || typeof window === 'undefined') return null;
  const role = window.localStorage.getItem(UI_PREVIEW_STORAGE_KEY);
  return role === 'buyer' || role === 'seller' || role === 'platform' ? role : null;
}

type SessionState = {
  account: SessionAccount | null;
  /** False until the first session check completes — avoids a sign-in flash. */
  ready: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; errors?: FieldErrors }>;
  logout: () => Promise<void>;
  isUiPreview: boolean;
  uiPreviewRole: UiPreviewRole | null;
  canUseUiPreview: boolean;
  startUiPreview: (role: UiPreviewRole) => void;
  clearUiPreview: () => Promise<void>;
};

const Ctx = createContext<SessionState | null>(null);

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<SessionAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [uiPreviewRole, setUiPreviewRole] = useState<UiPreviewRole | null>(null);

  const refresh = useCallback(async () => {
    const previewRole = storedPreviewRole();
    if (previewRole) {
      setUiPreviewRole(previewRole);
      setAccount(UI_PREVIEW_ACCOUNTS[previewRole]);
      setReady(true);
      return;
    }
    setUiPreviewRole(null);
    try {
      const r = await fetch('/api/auth/session', { cache: 'no-store' });
      const j = await readJson<{ account?: SessionAccount | null }>(r);
      setAccount(r.ok ? j?.account ?? null : null);
    } catch {
      setAccount(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    if (UI_PREVIEW_ENABLED) window.localStorage.removeItem(UI_PREVIEW_STORAGE_KEY);
    setUiPreviewRole(null);
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await readJson<{ account?: SessionAccount; error?: string }>(r);
    if (!r.ok) return { ok: false, error: j?.error ?? 'Could not sign in.' };
    if (!j?.account) return { ok: false, error: 'Could not sign in.' };
    setAccount(j.account);
    return { ok: true };
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    if (UI_PREVIEW_ENABLED) window.localStorage.removeItem(UI_PREVIEW_STORAGE_KEY);
    setUiPreviewRole(null);
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const j = await readJson<{ account?: SessionAccount; errors?: FieldErrors }>(r);
    if (!r.ok) return { ok: false, errors: j?.errors ?? {} };
    if (!j?.account) return { ok: false, errors: {} };
    setAccount(j.account);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    if (uiPreviewRole) {
      if (UI_PREVIEW_ENABLED) window.localStorage.removeItem(UI_PREVIEW_STORAGE_KEY);
      setUiPreviewRole(null);
      setAccount(null);
      return;
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    setAccount(null);
  }, [uiPreviewRole]);

  const startUiPreview = useCallback((role: UiPreviewRole) => {
    if (!UI_PREVIEW_ENABLED) return;
    window.localStorage.setItem(UI_PREVIEW_STORAGE_KEY, role);
    setUiPreviewRole(role);
    setAccount(UI_PREVIEW_ACCOUNTS[role]);
    setReady(true);
  }, []);

  const clearUiPreview = useCallback(async () => {
    if (!UI_PREVIEW_ENABLED) return;
    window.localStorage.removeItem(UI_PREVIEW_STORAGE_KEY);
    setUiPreviewRole(null);
    setAccount(null);
    await refresh();
  }, [refresh]);

  return (
    <Ctx.Provider value={{
      account, ready, refresh, login, signup, logout,
      isUiPreview: uiPreviewRole !== null,
      uiPreviewRole,
      canUseUiPreview: UI_PREVIEW_ENABLED,
      startUiPreview,
      clearUiPreview,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}
