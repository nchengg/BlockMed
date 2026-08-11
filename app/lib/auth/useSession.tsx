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

type SessionState = {
  account: SessionAccount | null;
  /** False until the first session check completes — avoids a sign-in flash. */
  ready: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; errors?: FieldErrors }>;
  logout: () => Promise<void>;
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

  const refresh = useCallback(async () => {
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
    await fetch('/api/auth/logout', { method: 'POST' });
    setAccount(null);
  }, []);

  return (
    <Ctx.Provider value={{ account, ready, refresh, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside <SessionProvider>');
  return v;
}
